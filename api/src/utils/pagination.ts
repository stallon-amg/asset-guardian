export type PaginationInput = {
  page: number
  limit: number
}

export type PaginationMeta = {
  page: number
  limit: number
  skip: number
  take: number
}

export type PaginatedResult<T> = {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Convert page/limit into Prisma-friendly skip/take.
 * - page is 1-based
 * - limit is capped/validated by your Zod schemas (recommended)
 */
export function getPagination(input: PaginationInput): PaginationMeta {
  const page = Number.isFinite(input.page) && input.page >= 1 ? input.page : 1
  const limit = Number.isFinite(input.limit) && input.limit >= 1 ? input.limit : 20

  const skip = (page - 1) * limit
  const take = limit

  return { page, limit, skip, take }
}

/**
 * Build a standard paginated response object.
 */
export function toPaginated<T>(params: {
  items: T[]
  total: number
  page: number
  limit: number
}): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(params.total / params.limit))

  return {
    items: params.items,
    total: params.total,
    page: params.page,
    limit: params.limit,
    totalPages,
  }
}
