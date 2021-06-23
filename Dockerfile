# syntax=docker/dockerfile:1

FROM node:14
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", ".env", "./"]

RUN npm install --production

COPY . .

WORKDIR /app/client_src

RUN npm install --production

RUN npm run build

WORKDIR /app

EXPOSE 8080
CMD [ "node", "server/server.js" ]