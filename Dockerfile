FROM node:18

WORKDIR /app

# Copy all files for simplicity in debugging
COPY package*.json ./
RUN npm install

COPY . .

# Run build if needed (though server.cjs won't use it yet)
RUN npm run build

EXPOSE 8080

ENTRYPOINT ["node", "server.cjs"]
