FROM node:21-alpine3.18

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 5173

CMD [ "npm", "run", "dev" ]
