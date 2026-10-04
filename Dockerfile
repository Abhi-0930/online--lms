# Production Dockerfile for PrepPath LMS Backend (Hugging Face Spaces / Cloud)
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies including OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy backend dependencies and prisma schema
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

RUN npm ci

# Copy backend source code and config
COPY backend/tsconfig.json ./
COPY backend/src ./src/
COPY backend/data ./data/

RUN npx prisma generate
RUN npm run build

# Production runner
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PORT=7860
ENV HOST=0.0.0.0

COPY backend/package*.json ./
COPY backend/prisma ./prisma/

RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# Expose standard HF Spaces port (7860), Render/Northflank (8080), and default (4000)
EXPOSE 7860
EXPOSE 8080
EXPOSE 4000

CMD ["node", "dist/server.js"]
