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

# External data storage
VOLUME /projectFiles/public

# Define the startup command
ENTRYPOINT ["node", "app/index.js"]

# Base image for RabbitMQ
#FROM rabbitmq:3.12-management AS rabbitmq
#
## Expose RabbitMQ ports
#EXPOSE 5672 15672

# Base image for Redis
#FROM redis:6.0.16 AS redis
#
## Expose Redis port
#EXPOSE 6379
