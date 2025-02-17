FROM node:14.19.0-alpine AS package

ARG NEXT_PUBLIC_UMAMI_SITE_ID
ARG NEXT_PUBLIC_RECAPTCHA_SITEKEY
ARG ENVIRONMENT
ENV PARCEL_WORKERS=1

COPY ./.babelrc /app/.babelrc
COPY config.$ENVIRONMENT.yaml /app/config.yaml
COPY config.seed.example.yaml /app/config.seed.yaml
COPY migrate-mongo-config-example.ts /app/migrate-mongo-config.ts
COPY ./migrations /app/migrations
COPY ./.eslintignore /app/.eslintignore
COPY ./.eslintrc.yml /app/.eslintrc.yml
COPY server/jest.config.json /app/jest.config.json
COPY ./next.config.js /app/next.config.js
COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock
COPY ./scripts /app/scripts
COPY ./tsconfig.json /app/tsconfig.json
COPY ./server /app/server
COPY ./src /app/src
COPY ./public /app/public
COPY ./next-i18next.config.js /app/next-i18next.config.js

WORKDIR /app

RUN apk add --no-cache git python3 make g++
RUN yarn install
RUN NEXT_PUBLIC_UMAMI_SITE_ID=$NEXT_PUBLIC_UMAMI_SITE_ID \
    NEXT_PUBLIC_RECAPTCHA_SITEKEY=$NEXT_PUBLIC_RECAPTCHA_SITEKEY \
    yarn build

FROM node:14.19.0-alpine

LABEL maintainer="Giovanni Rossini <giovannijrrossini@gmail.com>"

COPY --from=package /app /app

WORKDIR /app

ENTRYPOINT [ "yarn", "start" ]
