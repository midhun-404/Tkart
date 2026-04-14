$env:CLOUDFLARE_ACCOUNT_ID = "441473cfd291e56f372ff4b4640ee88d"
$env:CLOUDFLARE_API_TOKEN = "dBh8-LGrxeQGnPSd5Tb01zmG6rtKOlSQYTnXpQlo"

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
    Write-Output $value | npx wrangler secret put $key
}

# Firebase (Read file content)
$firebaseKey = Get-Content "../../apps/api/src/config/serviceAccountKey.json" -Raw
# Note: JSON content might have newlines, so strict piping is safer:
Write-Output $firebaseKey | npx wrangler secret put FIREBASE_SERVICE_ACCOUNT

# Cloudinary
Set-WorkerSecret "CLOUDINARY_CLOUD_NAME" "df7bzlvfb"
Set-WorkerSecret "CLOUDINARY_API_KEY" "854124388467913"
Set-WorkerSecret "CLOUDINARY_API_SECRET" "p046tBDjtegMS5P-IFPdTx_ZXMU"

# Razorpay
Set-WorkerSecret "RAZORPAY_KEY_ID" "rzp_test_S8X93NUrtx5Pm3"
Set-WorkerSecret "RAZORPAY_KEY_SECRET" "1AswCsLr08PGbb506gnmvoJz"

# JWT
Set-WorkerSecret "JWT_SECRET" "supersecretkey_change_this_in_production"

# Firebase Project ID (if used)
Set-WorkerSecret "FIREBASE_PROJECT_ID" "trendkart-53484"

Write-Host "--- Deployment Complete! ---"
Read-Host -Prompt "Press Enter to exit"
