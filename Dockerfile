###############################
### BASE LAYER FOR IMAGES BELOW
FROM git.ia.surfsara.nl/automation/dependency_proxy/containers/node:14.2.0-slim AS base

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

RUN yarn --network-concurrency 1 --frozen-lockfile
COPY . .
RUN yarn build

########################
### IMAGE FOR PRODUCTION
FROM git.ia.surfsara.nl/automation/dependency_proxy/containers/nginx:alpine

RUN apk update && apk add wget curl
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/src/env.js.template .

EXPOSE 8080
CMD [ "/bin/ash", "-c", "envsubst < env.js.template > /usr/share/nginx/html/env.js && exec nginx -g 'daemon off;'"]
