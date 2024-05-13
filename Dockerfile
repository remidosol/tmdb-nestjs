FROM node:20.12-slim AS development

RUN apt-get update && apt-get install -y procps

WORKDIR /app

COPY package*.json ./

COPY yarn.lock ./

RUN yarn --frozen-lockfile

COPY . .
