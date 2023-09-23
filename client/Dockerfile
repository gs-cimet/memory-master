FROM node:16.16.0
WORKDIR /app
ARG NODE_ENV
COPY package.json .
RUN cat package.json
RUN npm install
COPY . .
CMD npm start