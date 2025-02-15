FROM node:20.17.0-alpine

RUN apk add --no-cache curl

# Install dotenvx
RUN curl -sfS https://dotenvx.sh/install.sh | sh

RUN npm i -g maildev@2.0.5

COPY .env.production .env.production
CMD ["dotenvx", "run", "--strict", "--", "maildev"]