FROM node:18-alpine

WORKDIR /app

RUN corepack enable

ENV HOST=0.0.0.0
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

EXPOSE 3000

CMD ["sh", "-c", "yarn install && yarn start"]
