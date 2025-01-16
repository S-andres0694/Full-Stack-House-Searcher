# Current App State:
[![Application Build State](https://github.com/S-andres0694/Full-Stack-House-Searcher/actions/workflows/npm-grunt.yml/badge.svg)](https://github.com/S-andres0694/Full-Stack-House-Searcher/actions/workflows/npm-grunt.yml) [![Server Deployment State](https://github.com/S-andres0694/Full-Stack-House-Searcher/actions/workflows/docker-container-deployment-heroku.yml/badge.svg)](https://github.com/S-andres0694/Full-Stack-House-Searcher/actions/workflows/docker-container-deployment-heroku.yml) [![Internal Tests State](https://github.com/S-andres0694/Full-Stack-House-Searcher/actions/workflows/jest-tests.yml/badge.svg)](https://github.com/S-andres0694/Full-Stack-House-Searcher/actions/workflows/jest-tests.yml)

# Full-Stack House Searcher

Full-Stack House Searcher is a web application that allows users to search for houses. It includes both a client-side application built with React and a server-side application built with Express.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [Technologies](#technologies)
- [Contributing](#contributing)
- [License](#license)

## Local Usage

### Client
1. Navigate to the `client` directory:
    ```bash
    cd client
    ```
2. Install the dependencies:
    ```bash
    npm install
    ```
3. Check out the website in your local server!
    ```bash
    npm run preview
    ```    

### Server
1. Navigate to the `server` directory:
    ```bash
    cd server
    ```
2. Install the dependencies:
    ```bash
    npm install
    ```
3. Run the development server locally:
   ```bash
   npm run dev
   ```
   __This will use the production database__

## Scripts

### Client
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Previews the production build.

### Server
- `npm run dev`: Starts the development server with nodemon.
- `npm run generate-prod`: Generates the migration files for the production database.
- `npm run generate-test`: Generates the migration files for the test database on the PostgreSQL Docker instance.
- `npm run parcel-build`: Builds the server using Parcel.
- `npm run unit-tests`: Runs the unit tests.
- `npm run integration-tests`: Runs the integration tests.
- `npm run migrate-prod`: Runs the production migrations.
- `npm run migrate-test`: Runs the test migrations.
- `npm run doc`: Generates the API and overall server automatic documentation. You can check it out by running a local web server through the `docs` folder
- `npm run deployment-tests`: Runs the deployment tests.
- `npm run start`: Starts the server from the built files.  

## Technologies

### Client
- React
- TypeScript
- Chakra UI
- Redux Toolkit
- Vite
- Tailwind

### Server
- Express
- TypeScript
- Drizzle ORM
- PostgreSQL
- Docker & Docker Compose

### CI/CD and Automation
- Github Actions
- Heroku
- Grunt

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
This project is licensed under the ISC License.
