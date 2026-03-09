# verify-db.ps1
Write-Host "--- AbaQuest Database Verification Tool ---" -ForegroundColor Cyan

# 1. Check environment variables
$ENV_FILE = ".env.local"
if (-not (Test-Path $ENV_FILE)) {
    Write-Host "Error: $ENV_FILE not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Checking environment variables in $ENV_FILE..."
$requiredVars = @(
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID"
)

$missing = $false
foreach ($var in $requiredVars) {
    if (-not (Select-String -Path $ENV_FILE -Pattern "^$var=")) {
        Write-Host "Missing: $var" -ForegroundColor Yellow
        $missing = $true
    }
}

if ($missing) {
    Write-Host "Please update $ENV_FILE with missing variables." -ForegroundColor Red
    exit 1
}
Write-Host "Environment variables: OK" -ForegroundColor Green

# 2. Check GCP Project
Write-Host "Checking GCP project configuration..."
$project = gcloud config get-value project 2>$null
if ($project -ne "abaquest") {
    Write-Host "Warning: Current gcloud project is '$project', expected 'abaquest'." -ForegroundColor Yellow
    Write-Host "Run: gcloud config set project abaquest"
} else {
    Write-Host "GCP Project: abaquest (OK)" -ForegroundColor Green
}

# 3. Check Firestore Initialization
Write-Host "Checking Firestore initialization status..."
$dbList = gcloud firestore databases list --project=abaquest 2>&1
if ($dbList -match "Listed 0 items" -or $dbList -match "not found" -or -not $dbList) {
    Write-Host "Status: Firestore NOT initialized." -ForegroundColor Red
    Write-Host "Action Required: The project Owner (becca@thebeeprint.com) must initialize Firestore in Native Mode via the Firebase Console." -ForegroundColor Yellow
} else {
    Write-Host "Status: Firestore Initialized! (OK)" -ForegroundColor Green
    Write-Host "Database details:"
    Write-Host $dbList
}

Write-Host "-------------------------------------------"
Write-Host "Verification Complete" -ForegroundColor Cyan
