FROM node:12

COPY . .

RUN npm install

EXPOSE 9000

