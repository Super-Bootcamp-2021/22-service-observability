FROM node:14-alpine3.11

RUN mkdir -p /app
WORKDIR /app

COPY service/dist ./service/dist
COPY package.json package-lock.json ./

# update certificates & timezone
# RUN apk update && apk add --no-cache python make g++ tzdata ca-certificates

# install production dependencies
RUN NODE_ENV=production npm install

ENTRYPOINT [ "npm", "run" ]
CMD [ "service:start" ]
