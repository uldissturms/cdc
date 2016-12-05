FROM node:slim
MAINTAINER Uldis Sturms <uldis.sturms@gmail.com>

RUN mkdir contracts
WORKDIR contracts

RUN npm i cdc --production

ENTRYPOINT ["./node_modules/.bin/cdc"]
