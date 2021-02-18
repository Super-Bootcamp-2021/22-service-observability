FROM node:14-alpine3.11

RUN mkdir -p /app
WORKDIR /app

COPY service ./service
COPY package.json package-lock.json ./

#update time zone and certificates
RUN apk update && apk add --no-cache python make g++ tzdata ca-certificates

#install prod dependencies

RUN NODE_ENV=production npm install

ENTRYPOINT [ "npm", "run" ]
CMD ["svc:start", "worker"]