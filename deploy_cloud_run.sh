#!/bin/bash

# Configuration
PROJECT_ID="abaquest-dev"
SERVICE_NAME="abaquest-frontend"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

echo "🚀 Starting deployment for $SERVICE_NAME..."

# 1. Enable Services (First time only)
echo "Ensuring required services are enabled..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# 2. Build and Push Container using Cloud Build
echo "📦 Building container image..."
gcloud builds submit --tag $IMAGE_NAME .

# 3. Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi

echo "✅ Deployment Complete!"
