FROM ubuntu:22.04

WORKDIR /app

COPY . /app

RUN chmod +x /app/setup-config.sh    

RUN --mount=type=secret,id=API_KEY \
    --mount=type=secret,id=ADMIN_PASSWORD \
    --mount=type=secret,id=ADMIN_USERNAME \
    --mount=type=secret,id=ADMIN_EMAIL \
    --mount=type=secret,id=API_HOST \
    --mount=type=secret,id=SESSION_SECRET \
    --mount=type=secret,id=REFRESH_JWT_SECRET \
    --mount=type=secret,id=ACCESS_JWT_SECRET \
    --mount=type=secret,id=GOOGLE_CLIENT_ID \
    --mount=type=secret,id=GOOGLE_CLIENT_SECRET \
    --mount=type=secret,id=TEST_USER_EMAIL \
    --mount=type=secret,id=TEST_USER_PASSWORD \
    ./setup-config.sh 


ARG DB_PATH
ARG MIGRATIONS_PATH
ENV DB_PATH=$DB_PATH
ENV MIGRATIONS_PATH=$MIGRATIONS_PATH

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