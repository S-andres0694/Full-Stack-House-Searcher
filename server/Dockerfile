FROM ubuntu:22.04

#Define the build arguments
ARG API_KEY
ARG ADMIN_PASSWORD
ARG ADMIN_USERNAME
ARG ADMIN_EMAIL
ARG API_HOST
ARG DB_PATH
ARG MIGRATIONS_PATH
ARG SESSION_SECRET
ARG REFRESH_JWT_SECRET
ARG ACCESS_JWT_SECRET
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG TEST_USER_EMAIL
ARG TEST_USER_PASSWORD

#Set the build arguments
ENV API_KEY=${API_KEY}
ENV ADMIN_PASSWORD=${ADMIN_PASSWORD}
ENV ADMIN_USERNAME=${ADMIN_USERNAME}
ENV ADMIN_EMAIL=${ADMIN_EMAIL}
ENV API_HOST=${API_HOST}
ENV DB_PATH=${DB_PATH}
ENV MIGRATIONS_PATH=${MIGRATIONS_PATH}
ENV SESSION_SECRET=${SESSION_SECRET}
ENV REFRESH_JWT_SECRET=${REFRESH_JWT_SECRET}
ENV ACCESS_JWT_SECRET=${ACCESS_JWT_SECRET}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV TEST_USER_EMAIL=${TEST_USER_EMAIL}
ENV TEST_USER_PASSWORD=${TEST_USER_PASSWORD}

WORKDIR /app

COPY . /app

#Logs that all files are copied
RUN ls -la

RUN echo 'All files have been copied. Downloading Linux Dependencies...'

# Install Node.js and npm
RUN apt-get update && apt-get install -y nodejs npm

# Logging
RUN echo 'Linux Dependencies installed. Installing project dependencies...'

#Get all dependencies for the project
RUN npm install

#Generate the database migrations
RUN npm run generate

#Run the migrations
RUN npm run migrate

#Build the project using parcel
RUN npm run parcel-build

#Run the project
ENTRYPOINT ["node", "dist/index.js"]