# Production Dockerfile for PrepPath LMS Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies including OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY tsconfig.json ./
COPY src ./src/
COPY data ./data/

RUN npx prisma generate
RUN npm run build

# Production runner
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

EXPOSE 8080
EXPOSE 4000

CMD ["node", "--max-old-space-size=384", "dist/server.js"]
