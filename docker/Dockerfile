FROM mhart/alpine-node:8.13

WORKDIR /usr/app
COPY ./ /usr/app

# --no-cache: download package index on-the-fly, no need to cleanup afterwards
# --virtual: bundle packages, remove whole bundle at once, when done
RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++ \
    && npm install \
    && apk del build-dependencies

# Install dev dependencies to remove flow types and process files but after that
# only preserve production ones
RUN cd /usr/app && npm install

WORKDIR /usr/app
EXPOSE 8080

# was throwing UnhandledPromiseRejectionWarning in production mode, good enough for now, but should be fixed eventually
CMD npm run dev

