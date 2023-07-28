FROM ghcr.io/navikt/baseimages/node-express:16-alpine
USER root
RUN apk --no-cache add curl
USER apprunner

ADD ./ /var/server/

CMD ["yarn", "start"]