FROM node:20-alpine

RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories
RUN apk update

RUN apk add wakeonlan

ARG BASE_URL
ARG SERVER_HOST
ARG DATABASE_URL
ARG SESSION_SECRET
ARG REDIS_PASSWORD
ARG REDIS_PORT
ARG FILE_ENCRYPTION_KEY

ENV BASE_URL=${BASE_URL}
ENV SERVER_HOST=${SERVER_HOST}
ENV DATABASE_URL=${DATABASE_URL}
ENV SESSION_SECRET=${SESSION_SECRET}
ENV REDIS_PASSWORD=${REDIS_PASSWORD}
ENV REDIS_PORT=${REDIS_PORT}
ENV FILE_ENCRYPTION_KEY=${FILE_ENCRYPTION_KEY}

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

CMD ["npm", "run", "start"]
