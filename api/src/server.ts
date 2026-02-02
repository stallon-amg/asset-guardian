import "dotenv/config"
import Fastify from "fastify"
import cors from "@fastify/cors"
import cookie from "@fastify/cookie"
import jwt from "@fastify/jwt"

import { registerSecurity } from "./plugins/security"
import { registerErrorHandler } from "./plugins/errorHandler"

import { authRoutes } from "./routes/auth"
import { assetRoutes } from "./routes/assets"
import { userRoutes } from "./routes/users"
import { eventRoutes } from "./routes/events"



const app = Fastify({ logger: true })

// 1️⃣ Security first (helmet, rate limit, sensible)
await registerSecurity(app)

// 2️⃣ CORS
await app.register(cors, {
  origin: (process.env.CORS_ORIGIN ?? "http://localhost:5173").split(","),
  credentials: true,
})

// 3️⃣ Cookies
await app.register(cookie)

// 4️⃣ JWT (cookie-based)
await app.register(jwt, {
  secret: process.env.JWT_SECRET!,
  cookie: { cookieName: "access_token", signed: false },
})

// Health check
app.get("/health", async () => ({ ok: true }))

// Routes
await app.register(authRoutes, { prefix: "/auth" })
await app.register(assetRoutes, { prefix: "/assets" })
await app.register(userRoutes, { prefix: "/users" })
await app.register(eventRoutes, { prefix: "/events" })



// 5️⃣ Error handler LAST
await registerErrorHandler(app)

// Start server
await app.listen({ port: Number(process.env.PORT ?? 4000), host: "0.0.0.0" })
