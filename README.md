# Portal Backend Setup Instructions

## Setup Instructions

### 1. Prerequisites

- **macOS**:
  - [Homebrew](https://brew.sh/) (recommended)
  - [Node.js](https://nodejs.org/) (v20 or higher)
  - [Yarn](https://classic.yarnpkg.com/en/docs/install/) (recommended)
    - Install with Homebrew: `brew install yarn` (after installing Node.js)

- **Windows (WSL)**:
  - [Node.js](https://nodejs.org/) (v20 or higher)
  - [Yarn](https://classic.yarnpkg.com/en/docs/install/)
    - Install with: `npm install -g yarn`

### 2. Install Dependencies

Run the following command in the project root:

```sh
yarn install
```

### 3. Environment Variables

Copy the sample environment file to your own local config:

```sh
cp sample.env .env
```

Edit the file as needed for your environment.

### 4. Start the App
```sh
yarn dev
```

The app will be available at [http://localhost:3001](http://localhost:3001).

## Keycloak via Docker Compose

You can run Keycloak locally or in production mode using docker compose.

Options:

- Dispatcher with profiles: `docker-compose.keycloak.yml`
  - Dev profile service: `keycloak-dev`
  - Prod profile service: `keycloak-prod`

- Separate files:
  - `docker-compose.keycloak.dev.yml` (local dev)
  - `docker-compose.keycloak.prod.yml` (production)

Required env vars:

- Dev: `KEYCLOAK_ADMIN_PASSWORD`, optional `KEYCLOAK_HTTP_PORT`
- Prod: `KEYCLOAK_ADMIN_PASSWORD`, `DB_ENDPOINT`, `DB_USER`, `DB_PASSWORD`, `KEYCLOAK_DB_NAME`, optional `KEYCLOAK_HTTP_PORT`