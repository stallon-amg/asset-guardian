import type { FastifyReply } from "fastify"

/* =========================
   ERROR TYPES
========================= */

export type HttpErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR"

export class HttpError extends Error {
  readonly status: number
  readonly code: HttpErrorCode
  readonly details?: unknown

  constructor(status: number, code: HttpErrorCode, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

/* =========================
   THROW HELPERS (SERVICES)
========================= */

export const http = {
  badRequest(message = "Bad request", details?: unknown) {
    return new HttpError(400, "BAD_REQUEST", message, details)
  },

  unauthenticated(message = "Not authenticated", details?: unknown) {
    return new HttpError(401, "UNAUTHENTICATED", message, details)
  },

  forbidden(message = "Not authorized", details?: unknown) {
    return new HttpError(403, "FORBIDDEN", message, details)
  },

  notFound(message = "Not found", details?: unknown) {
    return new HttpError(404, "NOT_FOUND", message, details)
  },

  conflict(message = "Conflict", details?: unknown) {
    return new HttpError(409, "CONFLICT", message, details)
  },

  internal(message = "Internal server error", details?: unknown) {
    return new HttpError(500, "INTERNAL_SERVER_ERROR", message, details)
  },
}

/* =========================
   RESPONSE HELPERS (ROUTES)
========================= */

export function ok<T>(reply: FastifyReply, data: T) {
  return reply.status(200).send(data)
}

export function created<T>(reply: FastifyReply, data: T) {
  return reply.status(201).send(data)
}

export function noContent(reply: FastifyReply) {
  return reply.status(204).send()
}

export function sendError(reply: FastifyReply, err: unknown) {
  if (err instanceof HttpError) {
    return reply.status(err.status).send({
      message: err.message,
      code: err.code,
      details: err.details,
    })
  }

  return reply.status(500).send({
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  })
}
