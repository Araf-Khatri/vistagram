FROM node:22.19.0-alpine

WORKDIR /frontend

COPY . /frontend

RUN npm install

EXPOSE 3000

CMD ["npm", "start", "--host", "0.0.0.0"]