FROM node:12.16.1-alpine AS builder
WORKDIR /app
ENV CI=true
COPY package.json .
COPY yarn.lock .
RUN yarn --network-concurrency 1 
COPY . .
RUN yarn build


FROM nginx:alpine
RUN apk update && apk add wget curl
COPY default.conf /etc/nginx/conf.d/default.conf
COPY htpasswd.passwd /etc/nginx/htpasswd.passwd
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/src/env.js.template .
EXPOSE 8080
CMD [ "/bin/ash", "-c", "envsubst < env.js.template > /usr/share/nginx/html/env.js && exec nginx -g 'daemon off;'"]