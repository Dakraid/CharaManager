ARG NODE_VERSION=20.17.0

FROM node:${NODE_VERSION}-slim as base

ARG PORT=3000

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    hunspell \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src

# Build
FROM base as build

COPY --link package.json yarn.lock ./

RUN corepack enable
RUN yarn --frozen-lockfile --silent

COPY --link . .

RUN yarn prepare
RUN yarn build

# Run
FROM base

ENV PORT=$PORT

COPY --from=build /src/.output /src/.output
RUN yarn playwright install --with-deps

CMD [ "node", ".output/server/index.mjs" ]
