FROM node:22.15.0-alpine3.20

ENV NODE_ENV production

WORKDIR /app

COPY . /app

RUN apk update && \
    apk add --update git && \
    apk add --update openssh 

RUN npm install

CMD ["node", "index.mjs"]
