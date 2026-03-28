#!/bin/bash

# Configuration
ENVIRONMENT=${1:-dev}
PROJECT_ID="abaquest"
if [ "$ENVIRONMENT" == "prod" ]; then
    SERVICE_NAME="abaquest-app"
else
    SERVICE_NAME="abaquest-app-$ENVIRONMENT"
fi
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/abaquest-frontend-${ENVIRONMENT}:latest"

echo "----------------------------------------"
echo "Target Environment: $ENVIRONMENT"
echo "Project ID:         $PROJECT_ID"
echo "Service Name:       $SERVICE_NAME"
echo "Image Name:         $IMAGE_NAME"
echo "----------------------------------------"

# 1. Prepare environment variables for the build
ENV_FILE=".env.$ENVIRONMENT"
PROD_ENV="production.env"

if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$PROD_ENV"
else
    echo "⚠️ Warning: No $ENV_FILE found! Build may fail to initialize Firebase."
fi

# 2. Build and Push
echo "📦 Building container image on Cloud Build..."
gcloud builds submit --config=cloudbuild.yaml --substitutions=_IMAGE_NAME="$IMAGE_NAME" .

# 3. Deploy
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_NAME" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi

echo "✅ Deployment Complete!"

# 4. Clean up
if [ -f "$PROD_ENV" ]; then
    rm "$PROD_ENV"
fi
if [ -f "source.tgz" ]; then
    rm "source.tgz"
fi
