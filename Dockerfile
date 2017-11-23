FROM node:8.9 AS builder
COPY . /app
WORKDIR /app
ENV CI=true
RUN yarn --network-concurrency 1 install && yarn test && yarn build

FROM nginx:latest
COPY --from=builder /app/build /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d
COPY default.conf /etc/nginx/conf.d/default.conf
