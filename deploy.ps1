param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'uat', 'prod')]
    [string]$Environment = 'dev'
)

# Configuration
$PROJECT_ID = "abaquest"
$SERVICE_NAME = "abaquest-app-$Environment"
$REGION = "us-central1"

$IMAGE_NAME = "gcr.io/$PROJECT_ID/abaquest-frontend-$Environment:latest"

Write-Host "----------------------------------------"
Write-Host "Target Environment: $Environment"
Write-Host "Project ID:         $PROJECT_ID"
Write-Host "Service Name:       $SERVICE_NAME"
Write-Host "Image Name:         $IMAGE_NAME"
Write-Host "----------------------------------------"

# 1. Prepare environment variables for the build
$ENV_FILE = ".env.$Environment"
$PROD_ENV = "production.env"

if (Test-Path $ENV_FILE) {
    # Create a temporary file that isn't in .gitignore - using NoBOM UTF8 for Docker/Linux compatibility
    $content = Get-Content $ENV_FILE -Raw
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) $PROD_ENV), $content)
} else {
    Write-Warning "No $ENV_FILE found! Build may fail to initialize Firebase."
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
