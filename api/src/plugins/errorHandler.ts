import type { FastifyInstance } from "fastify"
import { ZodError } from "zod"

type ErrorBody = {
  message: string
  code?: string
  details?: unknown
}

type PrismaKnownErrorLike = {
  name: "PrismaClientKnownRequestError"
  code: string
  meta?: unknown
}

type PrismaValidationErrorLike = {
  name: "PrismaClientValidationError"
}

export async function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err, _req, reply) => {
    const e = err as any

    // Zod validation errors
    if (err instanceof ZodError) {
      const body: ErrorBody = {
        message: "Validation error",
        code: "VALIDATION_ERROR",
        details: err.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      }
      return reply.status(400).send(body)
    }

    // Prisma known errors (duck-typed)
    if (isPrismaKnownRequestError(e)) {
      const mapped = mapPrismaKnownError(e)
      return reply.status(mapped.status).send(mapped.body)
    }

    // Prisma validation error (bad query shape, etc.)
    if (isPrismaValidationError(e)) {
      const body: ErrorBody = {
        message: "Invalid database query",
        code: "PRISMA_VALIDATION_ERROR",
      }
      return reply.status(400).send(body)
    }

    // Auth/JWT errors
    if (isAuthError(e)) {
      const status =
        e.name === "JsonWebTokenError" || e.code === "FST_JWT_NO_AUTHORIZATION_IN_COOKIE" ? 401 : 403

      const body: ErrorBody = {
        message: status === 401 ? "Not authenticated" : "Not authorized",
        code: status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN",
      }
      return reply.status(status).send(body)
    }

    // Fallback
    app.log.error({ err }, "Unhandled error")
    const body: ErrorBody = {
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    }
    return reply.status(500).send(body)
  })
}

function isPrismaKnownRequestError(err: any): err is PrismaKnownErrorLike {
  return !!err && err.name === "PrismaClientKnownRequestError" && typeof err.code === "string"
}

function isPrismaValidationError(err: any): err is PrismaValidationErrorLike {
  return !!err && err.name === "PrismaClientValidationError"
}

function mapPrismaKnownError(err: PrismaKnownErrorLike): { status: number; body: ErrorBody } {
  switch (err.code) {
    case "P2002":
      return {
        status: 409,
        body: {
          message: "Conflict (unique constraint)",
          code: "CONFLICT",
          details: err.meta,
        },
      }

    case "P2025":
      return {
        status: 404,
        body: { message: "Record not found", code: "NOT_FOUND" },
      }

    case "P2003":
      return {
        status: 400,
        body: {
          message: "Invalid reference (foreign key constraint)",
          code: "INVALID_REFERENCE",
          details: err.meta,
        },
      }

    default:
      return {
        status: 400,
        body: {
          message: "Database error",
          code: err.code,
          details: err.meta,
        },
      }
  }
}

function isAuthError(err: any): boolean {
  return (
    !!err &&
    (err.name === "JsonWebTokenError" ||
      err.name === "NotBeforeError" ||
      err.name === "TokenExpiredError" ||
      err.code === "FST_JWT_NO_AUTHORIZATION_IN_COOKIE" ||
      err.code === "FST_JWT_AUTHORIZATION_TOKEN_INVALID" ||
      err.code === "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED")
  )
}
