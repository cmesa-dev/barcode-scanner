FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DB_PATH=/app/data/scanops.sqlite
COPY --from=build /app/dist ./dist
COPY api ./api
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["node", "api/server.mjs"]
