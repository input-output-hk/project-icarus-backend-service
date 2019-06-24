FROM tarampampam/node:11-alpine

EXPOSE 8080

WORKDIR /usr/app
COPY ./ .

RUN mkdir -p /var/log/app
RUN wget -q https://raw.githubusercontent.com/vishnubob/wait-for-it/9995b721327eac7a88f0dce314ea074d5169634f/wait-for-it.sh -O wait-for-it.sh
RUN chmod +x wait-for-it.sh

RUN yarn install
RUN yarn build

CMD ["/bin/sh", "-c", "yarn knex migrate:latest && yarn start"]
