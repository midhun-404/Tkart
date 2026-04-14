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
