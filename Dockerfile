# Base image for Node
FROM node:18.16.0 as node

# Copy project files
WORKDIR /projectFiles
COPY _src ./_src
COPY package.json package-lock.json ./
COPY tsconfig.json ./
COPY public ./public

# Install dependencies
RUN npm install

# build the project
RUN npm run build

# Expose necessary ports
EXPOSE 3000

# Define the startup command
ENTRYPOINT ["node", "app/index.js"]
