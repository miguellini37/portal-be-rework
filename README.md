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

## Keycloak Authentication

This application uses Keycloak for authentication and authorization. Keycloak is an open-source identity and access management solution.

### Keycloak Setup via Docker Compose

You can run Keycloak locally or in production mode using docker compose.

To start Keycloak locally:

```sh
yarn start:keycloak
```

This will start Keycloak on `http://localhost:8180` (configurable via `KEYCLOAK_HTTP_PORT`).

Options:

- Dispatcher with profiles: `docker-compose.keycloak.yml`
  - Dev profile service: `keycloak-dev`
  - Prod profile service: `keycloak-prod`

- Separate files:
  - `docker-compose.keycloak.dev.yml` (local dev)
  - `docker-compose.keycloak.prod.yml` (production)

Required env vars for Keycloak Docker:

- Dev: `KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD`, optional `KEYCLOAK_HTTP_PORT`
- Prod: `KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD`, `DB_ENDPOINT`, `DB_USER`, `DB_PASSWORD`, `KEYCLOAK_DB_NAME`, optional `KEYCLOAK_HTTP_PORT`

### Keycloak Configuration for Backend

The backend requires the following environment variables to connect to Keycloak:

- `KEYCLOAK_AUTH_SERVER_URL` - The URL of your Keycloak server (e.g., `http://localhost:8180`)
- `KEYCLOAK_REALM` - The Keycloak realm name (e.g., `portal`)
- `KEYCLOAK_CLIENT_ID` - The client ID for this backend (e.g., `portal-backend`)
- `KEYCLOAK_CLIENT_SECRET` - The client secret from Keycloak

## Messaging Feature

This application includes a comprehensive messaging system with real-time WebSocket support. For detailed information about the messaging feature, including:

- API endpoints documentation
- WebSocket usage and events
- React frontend integration example
- CloudFront/EC2 deployment configuration
- Security considerations

Please refer to [MESSAGING_FEATURE.md](MESSAGING_FEATURE.md)

### Quick Start for Messaging

1. **Run the database migration:**
   ```sh
   yarn migration:run
   ```

2. **The messaging endpoints are available at:**
   - `GET /getRecentMessages` - Get recent conversations
   - `GET /getConversation?otherUserId={id}` - Get conversation history
   - `POST /sendMessage` - Send a message
   - `PATCH /markMessageRead` - Mark message as read

3. **WebSocket connection for real-time updates:**
   ```javascript
   const socket = io('http://localhost:3000', {
     path: '/messages',
     auth: { token: 'your-jwt-token' }
   });
   ```

See [MESSAGING_FEATURE.md](MESSAGING_FEATURE.md) for complete documentation.
