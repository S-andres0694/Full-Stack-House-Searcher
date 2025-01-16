FROM node:22

WORKDIR /app

COPY . .

RUN npm install

ENV PORT=3000

RUN npm run parcel-build

CMD ["npm", "start"]