FROM node:22.4.1-bookworm-slim
ENV NODE_ENV production

WORKDIR /app

COPY . /app

RUN apt -y update && \
    apt -y install git

RUN npm install

CMD ["node", "index.mjs"]