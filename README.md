## tl;dr

Star Wars API integrator. API docs for project are available with Swagger documentation at `/api`.

## Description
Sign up. Users should provide an email and password to create their account. During the
registration process, the server should pick one hero at random from Star Wars API, for each
new user. Users should be able to sign in with credentials provided during the registration process. All
other resources must require authentication. Resources:
films - should return all films associated with a hero from the user profile.
species - same, but species
vehicles - same, but vehicles
starships - same, but starships
planets - same, but planets
Users can also get resources, through API, with a specific id. There should be an authorization
function that checks if a user can get the requested resource. Like before, a user can only get
resources that belong to his hero from SW API.
Cache mechanism - Every resource pulled from SW API should be cached for 24 hours. Every
next request for a specific resource should firstly check if it exists in the cache. If yes, the server
should return the object from the cache instead of requesting SW API.

## Technologies
1. Nest.js
2. TypeORM
3. Postgres
4. Docker
5. Jest
6. Star Wars API (https://swapi.dev/api/)

## Before first run

1. Run `npm install`
2. Copy `.env.example` to `.env` and fill it with your data
3. Run tests `npm run test`

## Running with docker

```bash
$ docker-compose up --build -V -d
```

## Running without docker

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
## License

[MIT licensed](LICENSE).
