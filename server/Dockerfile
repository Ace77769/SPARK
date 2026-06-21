# Use lightweight node:20-alpine base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package descriptors first to leverage build cache
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start Express server
CMD ["node", "index.js"]
