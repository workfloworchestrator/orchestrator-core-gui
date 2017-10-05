FROM node:8.6 AS builder
COPY . /app
WORKDIR /app
RUN yarn install && yarn build

FROM nginx:latest
COPY --from=builder /app/build /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d
