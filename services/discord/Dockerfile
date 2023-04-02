# development stage
FROM node:alpine As development
WORKDIR /usr/src/app
COPY . .
RUN npm install

# build stage
FROM node:alpine As build
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build

# prod stage
FROM node:alpine As production
WORKDIR /usr/src/app
ENV NODE_ENV production
COPY --from=build /usr/src/app/package.json ./package.json
RUN npm i --omit=dev && npm cache clean --force
COPY --from=build /usr/src/app/dist ./dist
