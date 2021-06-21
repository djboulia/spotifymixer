# syntax=docker/dockerfile:1

FROM node:14
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", ".env", "./"]

RUN npm install --production

COPY . .

EXPOSE 8080
CMD [ "node", "server/server.js" ]