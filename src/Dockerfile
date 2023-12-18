FROM node:20.8.0-bookworm-slim
ENV NODE_ENV production

WORKDIR /app

COPY . /app

RUN npm install

CMD ["node", "cluster.mjs"]