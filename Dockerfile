# Use an official Node.js image as base
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript code
RUN yarn build

# Production image
FROM node:20-alpine AS production

WORKDIR /app

# Copy only the dist folder and necessary files
COPY --from=base /app/package.json /app/yarn.lock ./
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules

EXPOSE 3000

# Start the app
CMD ["node", "dist/index.js"]
