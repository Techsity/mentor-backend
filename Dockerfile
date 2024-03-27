FROM node:20-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install production dependencies.
RUN npm install --force

# Copy local code to the container image.
COPY . .

# Build the NestJS application
RUN npm run build

# Run the web service on container startup.
CMD [ "node", "dist/main" ]
