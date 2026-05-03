FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src

# Railway sets PORT automatically
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "src/server.js"]
