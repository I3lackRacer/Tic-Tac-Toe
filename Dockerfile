FROM node:20.9.0-alpine AS builder_frontend

WORKDIR /usr/local/app

COPY ./frontend /usr/local/app/

RUN npm install

RUN npm install -g vite

RUN vite build

FROM node:20.9.0-alpine AS server

COPY --from=builder_frontend /usr/local/app/dist /usr/src/frontend/dist

WORKDIR /usr/src/app

COPY ./backend/package*.json ./

RUN npm install

COPY ./backend .

RUN npm run build

EXPOSE 3000

CMD [ "node", "dist/main.js" ]