# ─────────────────────────────────────────────────────────────────────────────
#  MediCare AI — Frontend  (React 19 + Vite → Nginx static)
#  Multi-stage: node build → nginx serve
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build-time VITE env variable (injected by docker-compose build args)
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: serve with Nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/medicare.conf

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy content assets (images)
COPY public/content /usr/share/nginx/html/content

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
