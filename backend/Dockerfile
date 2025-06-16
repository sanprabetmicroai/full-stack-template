# Use the official Node.js image as base
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Expose port that the app runs on
EXPOSE 8080

# Start the application
CMD [ "node", "server.js" ] 