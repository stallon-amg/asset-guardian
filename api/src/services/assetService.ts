import { any } from "zod"
import { prisma } from "../db"
import type {
  CreateAssetInput,
  UpdateAssetInput,
  AssignAssetInput,
  SetAssetStatusInput,
  ListAssetsQuery,
  AssetStatus,
} from "../schemas/assets"

type AuthCtx = {
  userId: string
}

// ✅ define this BEFORE using it
export type AssignAssetError = "NOT_FOUND" | "INVALID_OWNER"

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

export async function listAssets(query: ListAssetsQuery) {
  const skip = (query.page - 1) * query.limit

  const where: any = {}

  if (query.status) where.status = query.status
  if (query.ownerId) where.ownerId = query.ownerId

  if (query.q) {
    where.OR = [
      { tag: { contains: query.q, mode: "insensitive" } },
      { name: { contains: query.q, mode: "insensitive" } },
      { type: { contains: query.q, mode: "insensitive" } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
      include: { owner: { select: { id: true, email: true, name: true } } },
    }),
    prisma.asset.count({ where }),
  ])

  return {
    items,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  }
}

export async function getAsset(assetId: string) {
  return prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      events: { orderBy: { createdAt: "desc" } },
    },
  })
}

export async function createAsset(ctx: AuthCtx, input: CreateAssetInput) {
  const asset = await prisma.asset.create({
    data: {
      tag: input.tag,
      name: input.name,
      type: input.type,
      status: input.status ?? "ACTIVE",
      ownerId: input.ownerId ?? null,
    },
  })

  await createAssetEvent({
    assetId: asset.id,
    assetTag: asset.tag,
    assetName: asset.name,
    assetType: asset.type,
    assetStatus: asset.status,
    action: "ASSET_CREATED",
    createdBy: ctx.userId,
    meta: input.ownerId ? { ownerId: input.ownerId } : undefined,
  })

  return asset
}

export async function updateAsset(ctx: AuthCtx, assetId: string, input: UpdateAssetInput) {
  const existing = await prisma.asset.findUnique({ where: { id: assetId } })
  if (!existing) return null

  const updated = await prisma.asset.update({
    where: { id: assetId },
    data: {
      tag: input.tag ?? undefined,
      name: input.name ?? undefined,
      type: input.type ?? undefined,
      status: input.status ?? undefined,
      ownerId: input.ownerId === undefined ? undefined : input.ownerId, // can be null
    } as any, 
  })

  await createAssetEvent({
    assetId: updated.id,
    assetTag: updated.tag,
    assetName: updated.name,
    assetType: updated.type,
    assetStatus: updated.status,
    action: "ASSET_UPDATED",
    createdBy: ctx.userId,
    meta: input,
  })

  return updated
}

export async function assignAsset(
  ctx: AuthCtx,
  assetId: string,
  input: AssignAssetInput
): Promise<{ asset: unknown | null; error: AssignAssetError | null }> {
  const existing = await prisma.asset.findUnique({ where: { id: assetId } })
  if (!existing) return { asset: null, error: "NOT_FOUND" }

  if (input.ownerId) {
    const owner = await prisma.user.findUnique({ where: { id: input.ownerId } })
    if (!owner) return { asset: null, error: "INVALID_OWNER" }
  }

  const updated = await prisma.asset.update({
    where: { id: assetId },
    data: { ownerId: input.ownerId },
  })

  await createAssetEvent({
    assetId: updated.id,
    assetTag: updated.tag,
    assetName: updated.name,
    assetType: updated.type,
    assetStatus: updated.status,
    action: input.ownerId ? "ASSET_ASSIGNED" : "ASSET_UNASSIGNED",
    createdBy: ctx.userId,
    meta: { ownerId: input.ownerId },
  })

  return { asset: updated, error: null }
}

export async function setAssetStatus(ctx: AuthCtx, assetId: string, input: SetAssetStatusInput) {
  const existing = await prisma.asset.findUnique({ where: { id: assetId } })
  if (!existing) return null

  const updated = await prisma.asset.update({
    where: { id: assetId },
    data: { status: input.status },
  })

  await createAssetEvent({
    assetId: updated.id,
    assetTag: updated.tag,
    assetName: updated.name,
    assetType: updated.type,
    assetStatus: updated.status,
    action: "ASSET_STATUS_CHANGED",
    createdBy: ctx.userId,
    meta: { from: existing.status, to: updated.status },
  })

  return updated
}

export async function deleteAsset(ctx: AuthCtx, assetId: string) {
  const existing = await prisma.asset.findUnique({ where: { id: assetId } })
  if (!existing) return false

  await createAssetEvent({
    assetId: existing.id,
    assetTag: existing.tag,
    assetName: existing.name,
    assetType: existing.type,
    assetStatus: existing.status,
    action: "ASSET_DELETED",
    createdBy: ctx.userId,
  })

  await prisma.asset.delete({ where: { id: assetId } })
  return true
}
