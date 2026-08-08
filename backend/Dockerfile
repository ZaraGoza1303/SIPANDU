# BUILD
FROM node:26.5.0-alpine3.24 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Generate custom Prisma client path for TS compilation
RUN npx prisma generate

RUN npm run build

# RUN
FROM node:26.5.0-alpine3.24

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

# Copy generated prisma files & compiled files
COPY --from=builder /app/src/generated /app/src/generated
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 8000

CMD ["node", "dist/index.js"]
