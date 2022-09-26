# syntax=docker/dockerfile:1
FROM node:18-alpine3.15

WORKDIR /app

RUN apk --no-cache --update add python3 py3-pip make gcc musl-dev g++

COPY . .

RUN yarn install

RUN npm run build

CMD ["yarn", "start"]
