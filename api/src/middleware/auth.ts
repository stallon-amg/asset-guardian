import type { FastifyReply, FastifyRequest } from "fastify"

export type AuthUser = {
  sub: string
  role: "ADMIN" | "USER"
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<AuthUser> {
  try {
    await req.jwtVerify<AuthUser>() // reads from access_token cookie (server.ts config)
    return req.user as AuthUser
  } catch {
    // consistent with your error handler, but safe to respond here too
    return reply.status(401).send({ message: "Not authenticated", code: "UNAUTHENTICATED" }) as any
  }
}

export function requireRole(role: AuthUser["role"]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = await requireAuth(req, reply)
    // if requireAuth already replied with 401, stop
    if (!user?.sub) return

    if (user.role !== role) {
      return reply.status(403).send({ message: "Not authorized", code: "FORBIDDEN" })
    }
  }
}
