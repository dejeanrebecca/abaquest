# Build Stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine

WORKDIR /app

# Copy production dependencies
COPY package*.json ./
# Install only production dependencies
RUN npm ci --omit=dev

# Copy the built React app
COPY --from=build /app/dist ./dist

# Copy the server file and the database file
COPY server.js .
COPY db.json .

EXPOSE 8080

CMD ["npm", "start"]
