# Configuration
$PROJECT_ID = "abaquest"
$SERVICE_NAME = "abaquest-app"
$REGION = "us-central1"

$IMAGE_NAME = "gcr.io/$PROJECT_ID/abaquest-frontend:latest"

Write-Host "----------------------------------------"
Write-Host "Project ID:   $PROJECT_ID"
Write-Host "Service Name: $SERVICE_NAME"
Write-Host "Image Name:   $IMAGE_NAME"
Write-Host "----------------------------------------"

# 1. Build and Push
Write-Host "Building container image..."
gcloud builds submit --tag $IMAGE_NAME .

# 2. Deploy
Write-Host "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME `
  --image $IMAGE_NAME `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --memory 512Mi

Write-Host "Deployment Complete!" -ForegroundColor Green

# Clean up
if (Test-Path "source.tgz") {
    Remove-Item "source.tgz" -Force
}
