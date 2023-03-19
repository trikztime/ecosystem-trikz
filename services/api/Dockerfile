# development stage
FROM node:alpine As development
WORKDIR /usr/src/app
COPY . .
RUN npm install

# build stage
FROM node:alpine As build
WORKDIR /usr/src/app
COPY . .
ENV NODE_ENV production
RUN npm ci --only=production && npm cache clean --force
RUN npm run build

# prod stage
FROM node:alpine As production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY ./prisma ./prisma
