# Base image with Node.js 20 on Debian Bookworm
FROM node:20-bookworm-slim

# Install g++, make, and build essentials for C++ judge execution
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    make \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency definitions and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies and generate Prisma client
RUN npm ci --only=production
RUN npx prisma generate

# Copy source code
COPY . .

# Create cache and run execution directories with appropriate permissions
RUN mkdir -p judge/cache judge/runs

ENV NODE_ENV=production
ENV PORT=10000
EXPOSE 10000

# Default to running the submission worker
CMD ["node", "src/workers/submissionWorker.js"]
