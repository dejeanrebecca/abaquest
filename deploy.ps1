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

# 1. Prepare environment variables for the build
$ENV_FILE = ".env.local"
$PROD_ENV = "production.env"

if (Test-Path $ENV_FILE) {
    Write-Host "Syncing credentials to $PROD_ENV..."
    # Create a temporary file that isn't in .gitignore
    Get-Content $ENV_FILE | Out-File -FilePath $PROD_ENV -Encoding utf8
} else {
    Write-Warning "No .env.local found! Build may fail to initialize Firebase."
}

# 2. Build and Push
Write-Host "Building container image on Cloud Build..."
# Note: Dockerfile will look for production.env
gcloud builds submit --tag $IMAGE_NAME .

# 3. Deploy
Write-Host "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME `
  --image $IMAGE_NAME `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --memory 512Mi

Write-Host "Deployment Complete!" -ForegroundColor Green

# 4. Clean up
if (Test-Path $PROD_ENV) {
    Remove-Item $PROD_ENV -Force
}
if (Test-Path "source.tgz") {
    Remove-Item "source.tgz" -Force
}
