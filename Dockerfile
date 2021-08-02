FROM node:alpine as BUILD_IMAGE

WORKDIR /app

ADD package.json package-lock.json ./

# install dependencies
RUN npm i

# Add project files
ADD . .

# build
RUN npm run build || true

# remove dev dependencies
RUN npm prune --production

# go to another VM
FROM node:alpine

# go to folder
WORKDIR /app

# copy from build image
COPY --from=BUILD_IMAGE /app/package.json ./package.json
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /app/dist ./dist

# run it !
CMD [ "npm", "run", "prod" ]
