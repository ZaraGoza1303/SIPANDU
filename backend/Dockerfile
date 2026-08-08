# BUILD STAGE
FROM node:26.5.0-alpine3.24 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# RUN STAGE
FROM node:26.5.0-alpine3.24

WORKDIR /app

COPY package*.json ./

# Salin node_modules hasil install dari builder (di dalam container Railway)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/generated /app/src/generated
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 8000

CMD ["node", "dist/index.js"]