FROM node:12-alpine

WORKDIR /user/src/app
COPY package*.json ./
RUN npm install --only=production
COPY ./src ./src
COPY ./videos ./videos
ENV PORT=3000
CMD ["npm", "start"]