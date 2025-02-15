FROM node:20.17.0-alpine

# Install dotenvx
RUN curl -sfS https://dotenvx.sh/install.sh | sh

RUN npm i -g maildev@2.0.5

CMD ["dotenvx", "run", "--", "maildev"]
