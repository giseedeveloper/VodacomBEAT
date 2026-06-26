FROM node:20-alpine AS admin-build
WORKDIR /app
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=production
RUN corepack enable
COPY portals/admin-portal/package.json portals/admin-portal/yarn.lock ./
RUN yarn install --network-timeout 600000
COPY portals/admin-portal/ ./
RUN yarn build

FROM node:20-alpine AS customer-build
WORKDIR /app
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=production
RUN corepack enable
COPY portals/customer/package.json portals/customer/yarn.lock ./
RUN yarn install --network-timeout 600000
COPY portals/customer/ ./
RUN yarn build

FROM node:20-alpine AS agents-build
WORKDIR /app
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=production
RUN corepack enable
COPY portals/vodacom-agents-portal/package.json portals/vodacom-agents-portal/yarn.lock ./
RUN yarn install --network-timeout 600000
COPY portals/vodacom-agents-portal/ ./
RUN yarn build

FROM node:20-alpine AS referrals-build
WORKDIR /app
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=production
RUN corepack enable
COPY portals/referrals-agents-portal/package.json portals/referrals-agents-portal/yarn.lock ./
RUN yarn install --network-timeout 600000
COPY portals/referrals-agents-portal/ ./
RUN yarn build

FROM nginx:1.27-alpine
RUN apk add --no-cache openssl
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/entrypoint.sh /docker-entrypoint.d/40-generate-ssl.sh
RUN chmod +x /docker-entrypoint.d/40-generate-ssl.sh
COPY --from=admin-build /app/build /usr/share/nginx/html/admin
COPY --from=customer-build /app/build /usr/share/nginx/html/customer
COPY --from=agents-build /app/build /usr/share/nginx/html/agents
COPY --from=referrals-build /app/build /usr/share/nginx/html/referrals
