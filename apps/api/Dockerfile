# Base image for Node.js
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY ./apps/api/package*.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the application files
COPY ./apps/api .

# Build the NestJS application
RUN npm run build

# Expose the port the app runs on
EXPOSE 8000

# Start the application
CMD ["npm", "run", "start:prod"]