# Nestam server — Node 22 LTS, multi-stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# Persist /app/data as a volume on Railway/Fly for memories + TTS cache
VOLUME ["/app/data"]
EXPOSE 4020
CMD ["node", "dist/index.js"]
