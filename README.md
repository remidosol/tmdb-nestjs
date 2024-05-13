# TMDB NestJS Case

This project is a NestJS application that interacts with The Movie Database (TMDB) API to manage movie data. It integrates GraphQL for querying data and uses Mongoose for MongoDB interactions. It includes full Docker support for both development and testing environments.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application with Docker](#running-the-application-with-docker)
- [API Documentation](#api-documentation)
  - [Swagger](#swagger)
  - [GraphQL Playground](#graphql-playground)
- [Testing](#testing)
  - [Running Tests with Docker](#running-tests-with-docker)
- [Endpoints](#endpoints)
- [Additional Information](#endpoints)

## Features

- REST API and GraphQL endpoints for movie data management.
- CSRF token generation and management.
- Swagger API documentation.
- Integration with TMDB API for fetching movie details.
- Dockerized environment setup for development and testing.
- Rate limiting with custom throttling guards.
- Response transformation with interceptors.

## Prerequisites

- Docker
- Docker Compose

## Installation

Clone the repository:

```bash
git clone https://github.com/remidosol/tmdb-nestjs.git
cd tmdb-nestjs
```

## Running the Application with Docker

Ensure Docker and Docker Compose are installed and then run:

```bash
docker-compose up --build
```

This command will build the Docker image if it's not already built and start all services defined in `docker-compose.yml`, including the NestJS application and MongoDB.

## API Documentation

### Swagger

The Swagger documentation can be accessed at:

```bash
http://localhost:3333/api
```

### GraphQL Playground

The GraphQL Playground documentation can be accessed at:

```bash
http://localhost:3333/graphql
```

##  Environment Variables

Ensure that you have a .env file located in `<rootDir>/secrets/.env`. This file should contain all the necessary environment variables required by the application.

Create a .env file in the secrets directory with the following variables:

```.env
DATABASE_URL=""

TMDB_API_KEY=""
TMDB_READ_ACCESS_TOKEN=""
```

## Testing

### Running Tests with Docker

To run the tests within the Docker environment, use the following Docker Compose command:

```bash
docker-compose run app yarn test
```

For end to end tests, use:

```bash
docker-compose run app yarn test:e2e
```

This command executes the tests inside the Docker container, ensuring that the testing environment is consistent with the development setup.

## Endpoints

### REST Endpoints

- **POST /csrf**: Generate CSRF token
- **GET /main_goal**: Fetch and persist top 5 movies from TMDB
- **GET /movie**: Get all movies with optional sorting
- **GET /movie/:movieId**: Get movie by ID
- **POST /movie**: Create a new movie
- **DELETE /movie/:movieId**: Delete a movie by ID

### GraphQL Queries

- **findById(id: String!): Movie**: Find a movie by ID

Example GraphQL query to execute in the playground:

```graphql
query GetMovieById($id: String!) {
  findById(id: $id) {
    id
    name
    overview
    releaseDate
    voteAverage
    voteCount
    genres {
      id
      name
    }
    popularity
  }
}
```

Example id:

```json
{
  "id": "12345"
}
```

Find more detailed documentation on each endpoint in the Swagger UI or the GraphQL Playground.

## Additional Information

- **MongoDB**: This application uses Mongoose to interact with MongoDB.
- **CSRF Protection**: Implemented using CSRF tokens.
- **Throttling**: Rate limiting is enforced using custom throttling guards.
- **Interceptors**: Used for transforming responses.
