import { z } from "zod"

/* =========================
   ENUMS
========================= */

export const assetStatusEnum = z.enum([
  "ACTIVE",
  "IN_REPAIR",
  "RETIRED",
  "LOST",
])

export type AssetStatus = z.infer<typeof assetStatusEnum>

/* =========================
   QUERY SCHEMAS
========================= */

export const listAssetsQuerySchema = z.object({
  q: z.string().optional(), // search tag / name / type
  status: assetStatusEnum.optional(),
  ownerId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type ListAssetsQuery = z.infer<typeof listAssetsQuerySchema>

/* =========================
   BODY SCHEMAS
========================= */

// Create asset
export const createAssetSchema = z.object({
  tag: z.string().min(1, "Tag is required"),
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  status: assetStatusEnum.optional(),
  ownerId: z.string().nullable().optional(),
})

export type CreateAssetInput = z.infer<typeof createAssetSchema>

// Update asset (partial)
export const updateAssetSchema = z.object({
  tag: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  status: assetStatusEnum.optional(),
  ownerId: z.string().nullable().optional(),
})

export type UpdateAssetInput = z.infer<typeof updateAssetSchema>

// Assign / unassign owner
export const assignAssetSchema = z.object({
  ownerId: z.string().nullable(), // null = unassign
})

export type AssignAssetInput = z.infer<typeof assignAssetSchema>

// Change asset status
export const setAssetStatusSchema = z.object({
  status: assetStatusEnum,
})

export type SetAssetStatusInput = z.infer<typeof setAssetStatusSchema>

/* =========================
   PARAM SCHEMAS
========================= */

export const assetIdParamSchema = z.object({
  id: z.string(),
})

export type AssetIdParam = z.infer<typeof assetIdParamSchema>
