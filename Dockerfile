FROM node:latest

WORKDIR /root/
COPY id_rsa .
RUN chmod 600 id_rsa

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
