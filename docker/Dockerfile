FROM mhart/alpine-node:8.9.4

RUN apk add --update bash bash-doc util-linux pciutils usbutils coreutils binutils findutils grep python make \ 
    && npm install -g pm2 \
    && pm2 install pm2-logrotate \ 
    && pm2 set pm2-logrotate:max_size 500M \
    && mkdir -p /usr/app

WORKDIR /usr/app
COPY ./ /usr/app

# Install dev dependencies to remove flow types and process files but after that
# only preserve production ones
RUN cd /usr/app && npm install && npm run flow-remove-types &&  npm prune --production

WORKDIR /usr/app

CMD ["pm2", "start", "./flow-files/index.js", "-i", "0", "--no-daemon"]
