FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY portals/admin-portal/package.json portals/admin-portal/yarn.lock ./

RUN yarn install --network-timeout 600000

COPY portals/admin-portal/ .

ENV HOST=0.0.0.0
ENV PORT=3332
ENV WDS_SOCKET_PORT=3332
ENV CHOKIDAR_USEPOLLING=true

EXPOSE 3332

CMD ["yarn", "start"]
