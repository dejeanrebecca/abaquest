# AbaQuest Firestore Sync: Prod -> UAT
# This script exports the Production database and imports it into the UAT instance.

$PROJECT_ID = "abaquest"
$BUCKET = "gs://abaquest-backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"
$EXPORT_PATH = "$BUCKET/sync-$TIMESTAMP"

Write-Host "`n--- AbaQuest Firestore Sync: Prod -> UAT ---`n" -ForegroundColor Yellow
Write-Host "Project:    $PROJECT_ID"
Write-Host "Staging:    $EXPORT_PATH"
Write-Host "--------------------------------------------`n"

# 1. Export Production (default) database
Write-Host "[1/2] Exporting Production (default) database..." -ForegroundColor Cyan
gcloud firestore export $EXPORT_PATH --database='(default)' --project=$PROJECT_ID -q
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Export failed! Check if Service Account has permissions for the bucket." -ForegroundColor Red
    exit $LASTEXITCODE
}

# 2. Import into UAT database
Write-Host "[2/2] Importing into database-uat..." -ForegroundColor Cyan
gcloud firestore import $EXPORT_PATH --database='database-uat' --project=$PROJECT_ID -q
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Import failed! Verify that database-uat exists." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n[SUCCESS] Sync completed! UAT now reflects Production data.`n" -ForegroundColor Green
Write-Host "Clean up: You can delete the staging data at $EXPORT_PATH if desired." -ForegroundColor Gray
