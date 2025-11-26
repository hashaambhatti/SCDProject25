# Base Image: Node 20 (Stable & Lightweight)
FROM node:20-alpine

# Working Directory
WORKDIR /app

# Copy package files first (Better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Expose Port
EXPOSE 3000

# Run the app
CMD ["node", "main.js"]
