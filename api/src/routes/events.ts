import type { FastifyPluginAsync } from "fastify"
import { z } from "zod"
import { prisma } from "../db"
import { requireAuth } from "../middleware/auth"

const querySchema = z.object({
  assetId: z.string().optional(),
  createdBy: z.string().optional(),
  action: z.string().optional(),
  q: z.string().optional(), // search assetTag / assetName / assetType
  from: z.string().datetime().optional(), // ISO date-time
  to: z.string().datetime().optional(),   // ISO date-time
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
})

export const eventRoutes: FastifyPluginAsync = async (app) => {
  // LIST events with filters + pagination
  app.get("/", async (req, reply) => {
    await requireAuth(req, reply)

    const q = querySchema.parse(req.query)
    const skip = (q.page - 1) * q.limit

    const where: any = {}

    if (q.assetId) where.assetId = q.assetId
    if (q.createdBy) where.createdBy = q.createdBy
    if (q.action) where.action = q.action

    if (q.from || q.to) {
      where.createdAt = {}
      if (q.from) where.createdAt.gte = new Date(q.from)
      if (q.to) where.createdAt.lte = new Date(q.to)
    }

    if (q.q) {
      where.OR = [
        { assetTag: { contains: q.q, mode: "insensitive" } },
        { assetName: { contains: q.q, mode: "insensitive" } },
        { assetType: { contains: q.q, mode: "insensitive" } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.assetEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: q.limit,
        include: {
          user: { select: { id: true, email: true, name: true } }, // who did it
          asset: { select: { id: true, tag: true, name: true, type: true, status: true } }, // current asset (optional)
        },
      }),
      prisma.assetEvent.count({ where }),
    ])

    return {
      items,
      page: q.page,
      limit: q.limit,
      total,
      totalPages: Math.ceil(total / q.limit),
    }
  })

  // GET one event by id
  app.get("/:id", async (req, reply) => {
    await requireAuth(req, reply)

    const { id } = z.object({ id: z.string() }).parse(req.params)

    const event = await prisma.assetEvent.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        asset: { select: { id: true, tag: true, name: true, type: true, status: true } },
      },
    })

    if (!event) return reply.code(404).send({ message: "Event not found" })
    return { event }
  })

  // GET events for a specific asset (convenience)
  app.get("/asset/:assetId", async (req, reply) => {
    await requireAuth(req, reply)

    const { assetId } = z.object({ assetId: z.string() }).parse(req.params)
    const q = z
      .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(50),
      })
      .parse(req.query)

    const skip = (q.page - 1) * q.limit

    const [items, total] = await Promise.all([
      prisma.assetEvent.findMany({
        where: { assetId },
        orderBy: { createdAt: "desc" },
        skip,
        take: q.limit,
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      prisma.assetEvent.count({ where: { assetId } }),
    ])

    return {
      items,
      page: q.page,
      limit: q.limit,
      total,
      totalPages: Math.ceil(total / q.limit),
    }
  })
}
