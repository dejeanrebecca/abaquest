# Configuration
$PROJECT_ID = "abaquest"
$SERVICE_NAME = "abaquest-frontend"
$REGION = "us-central1"
$IMAGE_TAG = "latest"

$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME`:$IMAGE_TAG"

Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "CONFIGURATION" -ForegroundColor Cyan
Write-Host "Project ID:   $PROJECT_ID"
Write-Host "Service Name: $SERVICE_NAME"
Write-Host "Image Name:   $IMAGE_NAME"
Write-Host "----------------------------------------" -ForegroundColor Cyan

# Check if project exists/is accessible
Write-Host "Checking access to project: $PROJECT_ID..." -ForegroundColor Cyan
$ProjectCheck = gcloud projects describe $PROJECT_ID 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Cannot access project '$PROJECT_ID'." -ForegroundColor Red
    Write-Host "Please ensure you have access to this project."
    Write-Host "Available projects:"
    gcloud projects list
    exit 1
}

Write-Host "Starting deployment for $SERVICE_NAME to project $PROJECT_ID..." -ForegroundColor Cyan

# 1. Enable Services (First time only)
Write-Host "Ensuring required services are enabled..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# 2. Build and Push Container using Cloud Build
Write-Host "Building container image: $IMAGE_NAME"
gcloud builds submit --tag $IMAGE_NAME .

# 3. Deploy to Cloud Run
Write-Host "Deploying to Cloud Run: $SERVICE_NAME"
gcloud run deploy $SERVICE_NAME `
  --image $IMAGE_NAME `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --memory 512Mi

Write-Host "Deployment Complete!" -ForegroundColor Green
