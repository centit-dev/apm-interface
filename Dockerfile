FROM node:20.11-slim AS builder

COPY . /app
WORKDIR /app

RUN npx yarn install && NODE_ENV=production npx yarn build

FROM alpine:latest

COPY --from=builder /app/dist /data
