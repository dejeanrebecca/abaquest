FROM node:20

WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install

COPY . .

# Move production.env to .env so Vite finds it
RUN if [ -f "production.env" ]; then mv production.env .env; fi

# Run build - the VITE_ variables are baked into the static files here
RUN npm run build

# Vite 6 outputs to dist by default. server.cjs expects 'build'.
RUN if [ -d "dist" ]; then mv dist build; fi

EXPOSE 8080

ENTRYPOINT ["node", "server.cjs"]
