FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Create directory for database
RUN mkdir -p /app/data

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Set volume for database
VOLUME ["/app/data"]

CMD ["node", "src/index.js"]
