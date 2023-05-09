FROM node:20-alpine as BUILD_IMAGE

WORKDIR /app

ADD package.json package-lock.json ./

# install dependencies
RUN npm ci

# Add project files
ADD . .

# build
RUN npm run build

# remove dev dependencies
RUN npm prune --omit=dev

# go to another VM
FROM node:20-alpine

# go to folder
WORKDIR /app

# copy from build image
COPY --from=BUILD_IMAGE /app/package.json ./package.json
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /app/dist ./dist
COPY --from=BUILD_IMAGE /app/discord.json ./discord.json
COPY --from=BUILD_IMAGE /app/telegram.json ./telegram.json
COPY --from=BUILD_IMAGE /app/config.json ./config.json

# run it !
CMD [ "npm", "run", "start" ]
