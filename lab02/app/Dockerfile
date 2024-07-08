FROM node:20.15.0-slim as builder

WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build

FROM node:20.15.0-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json .
RUN npm install --omit=dev

CMD npm run start