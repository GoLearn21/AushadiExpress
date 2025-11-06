# Use Node.js 22 LTS
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (keep all deps, including dev, as bundled code references them)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose port (Railway sets PORT env var)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
