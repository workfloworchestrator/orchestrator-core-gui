FROM node:8.6 AS builder
COPY . /app
WORKDIR /app
RUN yarn install && yarn build

FROM nginx:latest
COPY --from=builder /app/build /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d
#RUN apt-get update && apt-get -y install gettext-base
COPY default.conf /etc/nginx/conf.d/temp.conf
ENV API_LOCATION=http://workflows-stg:8080/api/
RUN envsubst "$API_LOCATION"< /etc/nginx/conf.d/temp.conf > /etc/nginx/conf.d/default.conf && rm -f /etc/nginx/conf.d/temp.conf