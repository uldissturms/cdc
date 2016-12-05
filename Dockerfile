FROM node:slim
MAINTAINER Uldis Sturms <uldis.sturms@gmail.com>
RUN npm i cdc -g --production
ENTRYPOINT ["cdc"]
