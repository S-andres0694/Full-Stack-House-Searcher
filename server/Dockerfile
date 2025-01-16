FROM node:22.x

WORKDIR /app

COPY . .

RUN npm install

ENV PORT=3000

RUN npm run generate-prod && npm run migrate-prod

RUN npm run parcel-build

CMD ["npm", "start"]