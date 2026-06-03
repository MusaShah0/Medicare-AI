# ─────────────────────────────────────────────────────────────────────────────
#  MediCare AI — Backend  (Express 5 + Mongoose)
#  Multi-stage build: install deps → production image
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: dependency install ───────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 2: production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Create directories for file uploads and static assets
RUN mkdir -p uploads public

# Run as non-root user for security
RUN addgroup -S medicare && adduser -S medicare -G medicare
RUN chown -R medicare:medicare /app
USER medicare

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "index.js"]
