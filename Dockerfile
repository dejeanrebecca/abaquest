FROM node:18

WORKDIR /app

# Copy all files for simplicity in debugging
# Build Arguments for Firebase
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

# Set as environment variables for the build process
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

COPY package*.json ./
RUN npm install

COPY . .

# Run build - the VITE_ variables are baked into the static files here
RUN npm run build

# Vite 6+ outputs to dist by default. server.cjs expects 'build'.
# We can either change server.cjs or move the folder.
RUN if [ -d "dist" ]; then mv dist build; fi

EXPOSE 8080

ENTRYPOINT ["node", "server.cjs"]
