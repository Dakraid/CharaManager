ARG NODE_VERSION=20.17.0

FROM node:${NODE_VERSION}-slim as base

ARG PORT=3000

ENV NODE_ENV=production

WORKDIR /src

# Run
FROM base

ENV PORT=$PORT

COPY ./.output /src/.output
COPY ./package.json /src/package.json
COPY ./yarn.lock /src/yarn.lock

RUN corepack enable
RUN npx playwright install --with-deps chromium

CMD [ "node", ".output/server/index.mjs" ]
