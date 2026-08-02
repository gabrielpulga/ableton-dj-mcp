FROM node:24-slim

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Generate parsers (needed by tests)
RUN npm run parser:build

# Default: run full quality check
CMD ["npm", "run", "check"]
