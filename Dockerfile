###############################
### BASE LAYER FOR IMAGES BELOW
FROM node:14.2.0-slim AS base

ENV CI=true

WORKDIR /app
COPY package.json .
COPY yarn.lock .

##########################################################
### IMAGE FOR LOCAL DEVELOPMENT, NODE MODULES ARE INSTALLED AT RUNTIME
FROM base AS local-dev

EXPOSE 3000

#####################################################################
### IMAGE FOR LOCAL DEVELOPMENT WITH SOURCE FOLDERS COPIED INTO IMAGE
FROM base AS local-test

COPY . .

RUN yarn install

EXPOSE 3000
CMD [ "yarn", "start" ]

###########################################
### BUILDER LAYER TO PREPARE FOR PRODUCTION
FROM base AS builder

RUN apt update  && apt install wget -y
RUN yarn --network-concurrency 1 --frozen-lockfile
COPY . .
RUN wget "https://www.dropbox.com/s/k9f9aarp9dypxyl/custom.tgz?dl=0" -O custom.tgz
RUN tar -xzvf custom.tgz src/
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
