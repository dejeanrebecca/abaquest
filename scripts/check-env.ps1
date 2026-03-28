# AbaQuest Environment Health Check
# This script verifies the local development environment for AbaQuest.

function Write-Success($message) {
    Write-Host "[SUCCESS] $message" -ForegroundColor Green
}

function Write-Error-Msg($message) {
    Write-Host "[ERROR]   $message" -ForegroundColor Red
}

function Write-Info($message) {
    Write-Host "[INFO]    $message" -ForegroundColor Cyan
}

Write-Host "`n--- AbaQuest Environment Health Check ---`n" -ForegroundColor Yellow

# 1. Check Node.js
try {
    $nodeVersion = node -v
    Write-Success "Node.js is installed ($nodeVersion)"
} catch {
    Write-Error-Msg "Node.js is not found in PATH."
}

# 2. Check .env.local
$envPath = Join-Path $PSScriptRoot "..\" ".env.local"
if (Test-Path $envPath) {
    Write-Success ".env.local found"
    $envContent = Get-Content $envPath
    $requiredKeys = @(
        "VITE_FIREBASE_API_KEY",
        "VITE_FIREBASE_PROJECT_ID",
        "VITE_ELEVENLABS_VOICE_ID"
    )
    foreach ($key in $requiredKeys) {
        if ($envContent -match "$key=") {
            Write-Info "  Confirmed: $key is set"
        } else {
            Write-Error-Msg "  Missing: $key in .env.local"
        }
    }
} else {
    Write-Error-Msg ".env.local not found. Please create it from .env.example."
}

# 3. Check for Git Lock
$gitLock = Join-Path $PSScriptRoot "..\" ".git\index.lock"
if (Test-Path $gitLock) {
    Write-Error-Msg "Git lock found (.git\index.lock). This may block git commands."
    Write-Info "  Fix: Close all VS Code instances or kill git.exe/node.exe, then delete the file."
} else {
    Write-Success "No git lock detected"
}

# 4. Check for JSON Server
$port = 3001
$tcp = New-Object System.Net.Sockets.TcpClient
$result = $tcp.BeginConnect("localhost", $port, $null, $null)
$success = $result.AsyncWaitHandle.WaitOne(500, $false)
if ($success) {
    $tcp.EndConnect($result)
    Write-Success "JSON Server is reachable on port $port"
} else {
    Write-Info "JSON Server is not responding on port $port (Run 'npm run server' to start)"
}

# 5. Check Ollama
try {
    $ollamaVersion = ollama --version
    Write-Success "Ollama is installed ($ollamaVersion)"
} catch {
    Write-Info "Ollama is not found in PATH or not running."
}

Write-Host "`nHealth check complete.`n" -ForegroundColor Yellow
