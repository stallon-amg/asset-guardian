import type { FastifyPluginAsync } from "fastify"
import { prisma } from "../db"
import { requireAuth } from "../middleware/auth"
import {
  listAssetsQuerySchema,
  createAssetSchema,
  updateAssetSchema,
  assignAssetSchema,
  setAssetStatusSchema,
  assetIdParamSchema,
} from "../schemas/assets"
import type { AssetStatus } from "../schemas/assets"

// --- Helpers ---
async function createAssetEvent(params: {
  assetId: string
  assetTag: string
  assetName: string
  assetType: string
  assetStatus: AssetStatus
  action: string
  createdBy: string
  meta?: unknown
}) {
  return prisma.assetEvent.create({
    data: {
      assetId: params.assetId,
      assetTag: params.assetTag,
      assetName: params.assetName,
      assetType: params.assetType,
      assetStatus: params.assetStatus,
      action: params.action,
      createdBy: params.createdBy,
      meta: params.meta as any,
    },
  })
}

export const assetRoutes: FastifyPluginAsync = async (app) => {
  // LIST assets (with filters + pagination)
  app.get("/", async (req, reply) => {
    await requireAuth(req, reply)

    const q = listAssetsQuerySchema.parse(req.query)
    const skip = (q.page - 1) * q.limit

    const where: any = {}

    if (q.status) where.status = q.status
    if (q.ownerId) where.ownerId = q.ownerId

    if (q.q) {
      where.OR = [
        { tag: { contains: q.q, mode: "insensitive" } },
        { name: { contains: q.q, mode: "insensitive" } },
        { type: { contains: q.q, mode: "insensitive" } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: q.limit,
        include: { owner: { select: { id: true, email: true, name: true } } },
      }),
      prisma.asset.count({ where }),
    ])

    return {
      items,
      page: q.page,
      limit: q.limit,
      total,
      totalPages: Math.ceil(total / q.limit),
    }
  })

  // GET one asset (includes owner + events)
  app.get("/:id", async (req, reply) => {
    await requireAuth(req, reply)

    const { id } = assetIdParamSchema.parse(req.params)

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, email: true, name: true } },
        events: { orderBy: { createdAt: "desc" } },
      },
    })

    if (!asset) return reply.code(404).send({ message: "Asset not found" })
    return { asset }
  })

  // CREATE asset (+ event snapshot)
  app.post("/", async (req, reply) => {
    const auth = await requireAuth(req, reply)
    const body = createAssetSchema.parse(req.body)

    const asset = await prisma.asset.create({
      data: {
        tag: body.tag,
        name: body.name,
        type: body.type,
        status: body.status ?? "ACTIVE",
        ownerId: body.ownerId ?? null,
      },
    })

    await createAssetEvent({
      assetId: asset.id,
      assetTag: asset.tag,
      assetName: asset.name,
      assetType: asset.type,
      assetStatus: asset.status,
      action: "ASSET_CREATED",
      createdBy: auth.sub,
      meta: body.ownerId ? { ownerId: body.ownerId } : undefined,
    })

    return reply.code(201).send({ asset })
  })

  // UPDATE asset (+ event snapshot)
  app.patch("/:id", async (req, reply) => {
    const auth = await requireAuth(req, reply)
    const { id } = assetIdParamSchema.parse(req.params)
    const body = updateAssetSchema.parse(req.body)

    const existing = await prisma.asset.findUnique({ where: { id } })
    if (!existing) return reply.code(404).send({ message: "Asset not found" })

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        tag: body.tag ?? undefined,
        name: body.name ?? undefined,
        type: body.type ?? undefined,
        status: body.status ?? undefined,
        ownerId: body.ownerId === undefined ? undefined : body.ownerId, // can be null
      } as any,
    })

    await createAssetEvent({
      assetId: updated.id,
      assetTag: updated.tag,
      assetName: updated.name,
      assetType: updated.type,
      assetStatus: updated.status,
      action: "ASSET_UPDATED",
      createdBy: auth.sub,
      meta: body,
    })

    return { asset: updated }
  })

  // ASSIGN/UNASSIGN owner (+ event)
  app.post("/:id/assign", async (req, reply) => {
    const auth = await requireAuth(req, reply)
    const { id } = assetIdParamSchema.parse(req.params)
    const body = assignAssetSchema.parse(req.body)

    const existing = await prisma.asset.findUnique({ where: { id } })
    if (!existing) return reply.code(404).send({ message: "Asset not found" })

    // validate owner exists if not null
    if (body.ownerId) {
      const owner = await prisma.user.findUnique({ where: { id: body.ownerId } })
      if (!owner) return reply.code(400).send({ message: "ownerId is invalid" })
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: { ownerId: body.ownerId },
    })

    await createAssetEvent({
      assetId: updated.id,
      assetTag: updated.tag,
      assetName: updated.name,
      assetType: updated.type,
      assetStatus: updated.status,
      action: body.ownerId ? "ASSET_ASSIGNED" : "ASSET_UNASSIGNED",
      createdBy: auth.sub,
      meta: { ownerId: body.ownerId },
    })

    return { asset: updated }
  })

  // SET STATUS (+ event)
  app.post("/:id/status", async (req, reply) => {
    const auth = await requireAuth(req, reply)
    const { id } = assetIdParamSchema.parse(req.params)
    const body = setAssetStatusSchema.parse(req.body)

    const existing = await prisma.asset.findUnique({ where: { id } })
    if (!existing) return reply.code(404).send({ message: "Asset not found" })

    const updated = await prisma.asset.update({
      where: { id },
      data: { status: body.status },
    })

    await createAssetEvent({
      assetId: updated.id,
      assetTag: updated.tag,
      assetName: updated.name,
      assetType: updated.type,
      assetStatus: updated.status,
      action: "ASSET_STATUS_CHANGED",
      createdBy: auth.sub,
      meta: { from: existing.status, to: updated.status },
    })

    return { asset: updated }
  })

  // DELETE asset (+ event)
  app.delete("/:id", async (req, reply) => {
    const auth = await requireAuth(req, reply)
    const { id } = assetIdParamSchema.parse(req.params)

    const existing = await prisma.asset.findUnique({ where: { id } })
    if (!existing) return reply.code(404).send({ message: "Asset not found" })

    await createAssetEvent({
      assetId: existing.id,
      assetTag: existing.tag,
      assetName: existing.name,
      assetType: existing.type,
      assetStatus: existing.status,
      action: "ASSET_DELETED",
      createdBy: auth.sub,
    })

    await prisma.asset.delete({ where: { id } })
    return { ok: true }
  })
}
