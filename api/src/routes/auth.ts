import type { FastifyPluginAsync } from "fastify"
import bcrypt from "bcryptjs"
import { prisma } from "../db"
import { loginSchema, registerSchema } from "../schemas/auth"
import { requireAuth } from "../middleware/auth"

function setAuthCookie(reply: any, token: string) {
  reply.setCookie("access_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set true when you deploy on HTTPS
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  // Register
  app.post("/register", async (req, reply) => {
    const body = registerSchema.parse(req.body)

    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) return reply.code(409).send({ message: "Email already in use" })

    const passwordHash = await bcrypt.hash(body.password, 12)

    const user = await prisma.user.create({
      data: { email: body.email, name: body.name, passwordHash, role: "USER" }as any,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })

    const token = await reply.jwtSign({ sub: user.id, role: user.role })
    setAuthCookie(reply, token)

    return { user }
  })

  // Login
  app.post("/login", async (req, reply) => {
    const body = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user) return reply.code(401).send({ message: "Invalid credentials" })

    const ok = await bcrypt.compare(body.password, user.passwordHash)
    if (!ok) return reply.code(401).send({ message: "Invalid credentials" })

    const token = await reply.jwtSign({ sub: user.id, role: user.role })
    setAuthCookie(reply, token)

    return { user: { id: user.id, email: user.email, name: user.name, role: user.role } }
  })

  // Me
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

  // Logout
  app.post("/logout", async (_req, reply) => {
    reply.clearCookie("access_token", { path: "/" })
    return { ok: true }
  })
}
