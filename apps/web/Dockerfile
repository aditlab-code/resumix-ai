FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY packages/ packages/
COPY apps/web/ apps/web/

RUN npm install --workspaces
RUN npm run build --workspace=packages/contracts
RUN npm run build --workspace=apps/web

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=apps/web"]
