# Revolutistics

A backend service that retrieves transactions from the [Revolut Open Banking API](https://developer.revolut.com/docs/open-banking) at
configurable intervals and stores them in a PostgreSQL database. A web UI lets you browse those
transactions.

## Features

- 🔄 **Automatic sync** – polls the Revolut Open Banking AISP API at a configurable interval
  (default every 5 minutes), fetching all accounts and their transactions.
- 🗄️ **Prisma ORM** – type-safe database access; schema defined in `prisma/schema.prisma`.
- 🌐 **REST API** – `GET /api/transactions` and `GET /api/transactions/:id`.
- 💻 **Web UI** – filter and search transactions at `http://localhost:3000`.
- 🔒 **Rate limiting** – 100 requests/minute per IP on all API routes.

## Quick Start

### 1. Prerequisites

- Node.js ≥ 22 (see `.nvmrc`)
- Docker & Docker Compose (for the database)
- A [Revolut Open Banking TPP registration](https://developer.revolut.com/docs/open-banking) with
  a valid access token (obtained via the OAuth 2.0 authorization code flow)

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set REVOLUT_CLIENT_ID, REVOLUT_CLIENT_SECRET, REVOLUT_ACCESS_TOKEN
# Optionally set REVOLUT_REFRESH_TOKEN for automatic token renewal
```

### 3. Start with Docker Compose

```bash
docker compose up --build
```

The app will be available at <http://localhost:3000>.

### 4. Local development (without Docker)

```bash
# Start Postgres
docker compose up db -d

# Install dependencies
npm install

# Run in watch mode
npm run start:dev
```

## Environment Variables

| Variable                  | Default                                 | Description                                          |
| ------------------------- | --------------------------------------- | ---------------------------------------------------- |
| `REVOLUT_CLIENT_ID`       | _(required)_                            | OAuth 2.0 client ID from the Revolut Developer Portal|
| `REVOLUT_CLIENT_SECRET`   | _(required)_                            | OAuth 2.0 client secret                              |
| `REVOLUT_ACCESS_TOKEN`    | _(required)_                            | Bearer token from the authorization code flow        |
| `REVOLUT_REFRESH_TOKEN`   | _(optional)_                            | Refresh token for automatic access token renewal     |
| `REVOLUT_API_BASE_URL`    | `https://openbanking.revolut.com/api`   | Open Banking AISP base URL                          |
| `REVOLUT_TOKEN_URL`       | `https://oba.revolut.com/token`         | OAuth 2.0 token endpoint                             |
| `SYNC_INTERVAL_SECONDS`   | `300`                                   | How often to sync transactions (seconds)             |
| `SYNC_LOOKBACK_DAYS`      | `30`                                    | Days of history to fetch on each sync                |
| `PORT`                    | `3000`                                  | HTTP server port                                     |
| `DATABASE_URL`            | _(auto-built from DB_* vars)_           | Prisma Postgres connection string                    |
| `DB_HOST`                 | `localhost`                             | PostgreSQL host                                      |
| `DB_PORT`                 | `5432`                                  | PostgreSQL port                                      |
| `DB_NAME`                 | `revolutistics`                         | PostgreSQL database name                             |
| `DB_USER`                 | `postgres`                              | PostgreSQL user                                      |
| `DB_PASSWORD`             | `postgres`                              | PostgreSQL password                                  |

## API Endpoints

| Method | Path                      | Description                          |
| ------ | ------------------------- | ------------------------------------ |
| GET    | `/api/transactions`       | List last 500 transactions           |
| GET    | `/api/transactions/:id`   | Get raw JSON for a single transaction|
| GET    | `/health`                 | Health check                         |

## Development

```bash
npm run test          # Run tests
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run build         # Compile TypeScript + copy static assets
```

## ESLint Setup

```javascript
module.exports = {
  env: {
    es2022: true,
    node: true,
  },
  overrides: [
    {
      files: ['**/*.js'],
      extends: ['eslint:recommended'],
      // https://eslint.org/docs/v8.x/use/configure/language-options#specifying-parser-options
      parserOptions: {
        ecmaVersion: '2022',
      },
    },
    {
      files: ['src**/*.ts'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked',
      ],
      plugins: ['@typescript-eslint'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: true,
      },
    },
  ],
};
```

The newest version of ESLint is using the new `flatconfig` format. Even though it looks cool sadly

the adaptation of it in the community has not yet reached to the point where it makes sense to start

using it. That is why this repo uses the `8.57.0` version which still defaults to the old config

file format. It has some consequences.

1. The file has to be in CommonJS format since version `8.57.0` doesn't support anything else
2. The support both JS and Typescript by using the overrides property.
3. Note that the `module.exports.overrides[0].parserOptions` needs to have a higher ECMA version

   specified as the default is `ES5`. For the Typescript configuration this is not needed as it

   reads the settings from the `tsconfig` when `module.exports.overrides[1].parserOptions.project`

   is set to `true`

## Why is nodemon Used Over tsx watch

Because `tsx watch` does not support watching .env file.

## Migration from Jest to Vitest

1. Uninstall Jest

   ```bash
   npm uninstall jest @types/jest
   npm install -D vitest
   ```

1. Configure Vitest

   [vitest config in the repo](vitest.config.ts)

1. Update package.json with test commands referencing `vitest` rather than `jest`

   ```json
   {
     "scripts": {
       "test": "vitest run",
       "test:watch": "vitest watch",
       "test:coverage": "vitest run --coverage"
     }
   }
   ```

1. And ensure to add `import { describe, it, expect } from 'vitest';` at the top of test cases.
