# Use the latest Node.js runtime as a parent image
FROM node:alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json .

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Compile TypeScript to JavaScript (also runs prisma generate)
RUN npm run build

VOLUME /mnt /config

# Push schema to DB then start the server
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
