$env:CLOUDFLARE_ACCOUNT_ID = "441473cfd291e56f372ff4b4640ee88d"
$env:CLOUDFLARE_API_TOKEN = "dBh8-LGrxeQGnPSd5Tb01zmG6rtKOlSQYTnXpQlo"

Write-Host "--- Cloudflare Frontend Deployment Script ---"

# 1. Update Environment Variable (Ensure it's loaded)
Write-Host "Ensuring .env.production is correct..."
# We assume the AI has already updated the file content via tool.

# 2. Build Frontend
Write-Host "Building React Frontend..."
Set-Location ../apps/web
npm install
npm run build

# 3. Deploy to Pages
Write-Host "Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name=trendkart --commit-dirty=true

Write-Host "--- Frontend Deployment Complete! ---"
Read-Host -Prompt "Press Enter to exit"
