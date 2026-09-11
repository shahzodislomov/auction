# Dependencies
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

# Build
FROM node:22-alpine AS build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_TELEGRAM_BOT_ID
ENV NEXT_PUBLIC_TELEGRAM_BOT_ID=$NEXT_PUBLIC_TELEGRAM_BOT_ID
ARG NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
ENV NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=$NEXT_PUBLIC_TELEGRAM_BOT_USERNAME

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
