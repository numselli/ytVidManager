FROM node:24.13.0-alpine3.22

ENV NODE_ENV production

WORKDIR /app

COPY . /app

RUN apk update && \
    apk add --update git && \
    apk add --update openssh 

RUN npm install

CMD ["node", "index.mjs"]
