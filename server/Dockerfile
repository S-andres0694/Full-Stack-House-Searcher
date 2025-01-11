FROM ubuntu:22.04

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