function Load-Env {
    if (Test-Path ".env") {
        Get-Content ".env" | ForEach-Object {
            if ($_ -match '^(?<key>[^=]+)=(?<value>.*)$') {
                $key = $Matches.key.Trim()
                $value = $Matches.value.Trim()
                $env:$key = $value
            }
        }
    }
}
Load-Env

Write-Host "--- Cloudflare Worker Deployment Script ---"

# 1. Install Worker Dependencies
Write-Host "Installing worker dependencies..."
Set-Location ../apps/worker
# Check if npm install is needed
if (-not (Test-Path "node_modules")) {
    npm install
}

# 2. Deploy Code
Write-Host "Deploying Worker Code (This might ask for confirmation)..."
# Using npx wrangler directly to avoid global path issues
npx wrangler deploy

# 3. Set Secrets
Write-Host "Configuring Secrets..."

# Helper function to set secret
function Set-WorkerSecret ($key, $value) {
    if ($value) {
        Write-Output $value | npx wrangler secret put $key
    } else {
        Write-Host "Warning: Secret $key is not set in environment." -ForegroundColor Yellow
    }
}

# Firebase (Read file content)
$firebaseKey = Get-Content "../../apps/api/src/config/serviceAccountKey.json" -Raw
# Note: JSON content might have newlines, so strict piping is safer:
Write-Output $firebaseKey | npx wrangler secret put FIREBASE_SERVICE_ACCOUNT

# Cloudinary
Set-WorkerSecret "CLOUDINARY_CLOUD_NAME" $env:CLOUDINARY_CLOUD_NAME
Set-WorkerSecret "CLOUDINARY_API_KEY" $env:CLOUDINARY_API_KEY
Set-WorkerSecret "CLOUDINARY_API_SECRET" $env:CLOUDINARY_API_SECRET

# Razorpay
Set-WorkerSecret "RAZORPAY_KEY_ID" $env:RAZORPAY_KEY_ID
Set-WorkerSecret "RAZORPAY_KEY_SECRET" $env:RAZORPAY_KEY_SECRET

# JWT
Set-WorkerSecret "JWT_SECRET" $env:JWT_SECRET

# Firebase Project ID (if used)
Set-WorkerSecret "FIREBASE_PROJECT_ID" $env:FIREBASE_PROJECT_ID

Write-Host "--- Deployment Complete! ---"
Read-Host -Prompt "Press Enter to exit"
