###############################
### BASE LAYER FOR IMAGES BELOW
FROM node:14.21.1-slim AS base


ENV CI=true

WORKDIR /app
COPY package.json .
COPY yarn.lock .

###########################################
### BUILDER LAYER TO PREPARE FOR PRODUCTION
FROM base AS builder

RUN apt update  && apt install git -y
RUN yarn --network-concurrency 1 --frozen-lockfile
COPY . .
RUN (rm -rf src/custom && cd src && ln -s custom-example custom)
RUN yarn build

########################
### IMAGE FOR PRODUCTION
FROM nginx:alpine

RUN apk update && apk add wget curl
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/src/env.js.template .

EXPOSE 8080
CMD [ "/bin/ash", "-c", "envsubst < env.js.template > /usr/share/nginx/html/env.js && exec nginx -g 'daemon off;'"]
