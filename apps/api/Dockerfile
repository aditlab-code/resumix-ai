FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/ packages/
COPY apps/api/ apps/api/

RUN npm install --workspaces
RUN npm run build --workspace=packages/contracts
RUN npm run build --workspace=apps/api

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages/contracts/package.json packages/contracts/
COPY packages/contracts/dist packages/contracts/dist
COPY apps/api/package.json apps/api/
COPY apps/api/dist apps/api/dist

RUN npm install --omit=dev --workspaces

EXPOSE 3000

CMD ["node", "apps/api/dist/index.js"]
