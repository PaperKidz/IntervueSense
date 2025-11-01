FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Node.js API port
EXPOSE 4000

# 👇 CHANGE THIS LINE - Use dev script with nodemon
CMD ["npm", "run", "dev"]