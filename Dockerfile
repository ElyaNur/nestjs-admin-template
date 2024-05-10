FROM node:20

WORKDIR /usr/src/app

COPY . .

RUN yarn install

EXPOSE 3000

# npm run start:dev
CMD ["yarn", "run", "start:dev"]