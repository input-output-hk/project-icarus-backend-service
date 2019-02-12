FROM mhart/alpine-node:8.9.4

WORKDIR /usr/app
COPY ./ /usr/app

RUN cd /usr/app && yarn install && yarn build

WORKDIR /usr/app

EXPOSE 8080

CMD ["/bin/sh", "-c", "yarn knex migrate:latest && yarn start >> server.log 2>&1"]
