import type { FastifyPluginAsync } from "fastify"
import { z } from "zod"
import { prisma } from "../db"
import { requireAuth, requireRole } from "../middleware/auth"

const listQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const updateUserSchema = z.object({
  name: z.string().min(1).nullable().optional(),
  email: z.string().email().optional(),
})

const setRoleSchema = z.object({
  role: z.enum(["ADMIN", "USER"]),
})

export const userRoutes: FastifyPluginAsync = async (app) => {
  // Current user profile
  app.get("/me", async (req, reply) => {
    const auth = await requireAuth(req, reply)
    if (!auth?.sub) return

    const user = await prisma.user.findUnique({
      where: { id: auth.sub },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })

    if (!user) return reply.code(404).send({ message: "User not found" })
    return { user }
  })

  // ADMIN: list users
  app.get(
    "/",
    { preHandler: requireRole("ADMIN") },
    async (req) => {
      const q = listQuerySchema.parse(req.query)
      const skip = (q.page - 1) * q.limit

      const where: any = {}
      if (q.q) {
        where.OR = [
          { email: { contains: q.q, mode: "insensitive" } },
          { name: { contains: q.q, mode: "insensitive" } },
        ]
      }

      const [items, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: q.limit,
          select: { id: true, email: true, name: true, role: true, createdAt: true },
        }),
        prisma.user.count({ where }),
      ])

      return {
        items,
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.ceil(total / q.limit),
      }
    }
  )

  // ADMIN: get user by id
  app.get(
    "/:id",
    { preHandler: requireRole("ADMIN") },
    async (req, reply) => {
      const { id } = z.object({ id: z.string() }).parse(req.params)

      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      })

      if (!user) return reply.code(404).send({ message: "User not found" })
      return { user }
    }
  )

  // ADMIN: update basic user fields (name/email)
  app.patch(
    "/:id",
    { preHandler: requireRole("ADMIN") },
    async (req, reply) => {
      const { id } = z.object({ id: z.string() }).parse(req.params)
      const body = updateUserSchema.parse(req.body)

      const updated = await prisma.user.update({
        where: { id },
        data: {
          name: body.name === undefined ? undefined : body.name, // allow null to clear
          email: body.email ?? undefined,
        } as any,
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      })

      return { user: updated }
    }
  )

  // ADMIN: set role
  app.patch(
    "/:id/role",
    { preHandler: requireRole("ADMIN") },
    async (req, reply) => {
      const { id } = z.object({ id: z.string() }).parse(req.params)
      const body = setRoleSchema.parse(req.body)

      const updated = await prisma.user.update({
        where: { id },
        data: { role: body.role },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      })

      return { user: updated }
    }
  )
}
