import type { FastifyInstance } from "fastify"
import helmet from "@fastify/helmet"
import rateLimit from "@fastify/rate-limit"
import sensible from "@fastify/sensible"

type SecurityOptions = {
  isProd?: boolean
}

export async function registerSecurity(app: FastifyInstance, opts: SecurityOptions = {}) {
  const isProd = opts.isProd ?? process.env.NODE_ENV === "production"

  await app.register(sensible)

  const helmetOptions = isProd
    ? {}
    : {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
          },
        },
      }

  await app.register(helmet, helmetOptions)

  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
  })
}
