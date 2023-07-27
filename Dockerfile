# Base image for Node
FROM node:18.16.0 as nodeapp

# Copy project files
WORKDIR /projectFiles
COPY ./_src ./_src
COPY ./package.json ./package-lock.json ./tsconfig.json ./

# Install dependencies and build the project
RUN npm install && npm run build

# Expose necessary ports
EXPOSE 3000

# Set NODE_ENV to production (it is necessory to define here. It wouldn't work for docker in package.json )
ENV NODE_ENV=production
ENV DOCKER_BUILD=true

# Define the startup command
ENTRYPOINT ["node", "app/index.js"]
