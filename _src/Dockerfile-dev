# Base image for Node
FROM node:18.16.0 as nodeapp

# Copy project files
WORKDIR /projectFiles
COPY ../package.json ./tsconfig.json ./

# Install dependencies and build the project
RUN npm install

# Expose necessary ports
EXPOSE 3000

# Set NODE_ENV to production (it is necessory to define here. It wouldn't work for docker in package.json)
ENV NODE_ENV=development
ENV DOCKER_BUILD=true

# Define the startup command
ENTRYPOINT ["npm", "run", "start:dev"]
