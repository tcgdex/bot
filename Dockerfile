FROM node:alpine

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production --silent

COPY . .

RUN npm run build || true

CMD [ "npm", "run", "prod" ]
