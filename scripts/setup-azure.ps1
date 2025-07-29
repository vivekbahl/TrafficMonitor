# Azure Traffic Monitor - Setup Script for Windows
# This script helps set up Azure prerequisites for the deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$AppName = "azure-traffic-monitor",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "East US"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Check prerequisites
Write-Status "Checking prerequisites..."

# Check if Azure CLI is installed
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Success "Azure CLI version $($azVersion.'azure-cli') found"
} catch {
    Write-Error "Azure CLI is not installed. Please install it from: https://aka.ms/installazurecliwindows"
    exit 1
}

# Check if Terraform is installed
try {
    $tfVersion = terraform version
    Write-Success "Terraform found: $tfVersion"
} catch {
    Write-Error "Terraform is not installed. Please install it from: https://www.terraform.io/downloads"
    exit 1
}

# Check if logged into Azure
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Success "Logged into Azure as: $($account.user.name)"
    Write-Status "Using subscription: $($account.name) ($($account.id))"
} catch {
    Write-Error "Not logged into Azure. Please run 'az login' first."
    exit 1
}

Write-Status "Setting up Azure AD Application..."

# Create Azure AD Application
$appDisplayName = "$AppName-$Environment"
$replyUrl = "https://$AppName-$Environment.azurewebsites.net"

Write-Status "Creating Azure AD application: $appDisplayName"

try {
    $app = az ad app create --display-name $appDisplayName --reply-urls $replyUrl --output json | ConvertFrom-Json
    $clientId = $app.appId
    Write-Success "Azure AD Application created with Client ID: $clientId"
} catch {
    Write-Error "Failed to create Azure AD application: $_"
    exit 1
}

# Get Azure details
$account = az account show --output json | ConvertFrom-Json
$tenantId = $account.tenantId
$subscriptionId = $account.id

Write-Status "Azure Configuration Details:"
Write-Host "  Tenant ID: $tenantId" -ForegroundColor White
Write-Host "  Subscription ID: $subscriptionId" -ForegroundColor White
Write-Host "  Client ID: $clientId" -ForegroundColor White

# Create or update terraform.tfvars file
$terraformDir = Join-Path $PSScriptRoot "..\terraform"
$tfvarsFile = Join-Path $terraformDir "terraform.tfvars"

Write-Status "Creating Terraform variables file: $tfvarsFile"

$tfvarsContent = @"
# Azure Traffic Monitor - Terraform Variables
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Basic Configuration
resource_group_name = "rg-$AppName-$Environment"
app_name           = "$AppName-$Environment"
location           = "$Location"
environment        = "$Environment"
app_service_sku    = $(if ($Environment -eq "prod") { '"B2"' } else { '"F1"' })

# Azure Authentication
azure_client_id       = "$clientId"
azure_tenant_id       = "$tenantId"
azure_subscription_id = "$subscriptionId"

# Optional: GitHub Repository
# github_repo_url = "https://github.com/your-username/azure-traffic-monitor"
# github_branch   = "main"

# Optional: Custom Domain
# custom_domain = "monitor.yourdomain.com"

# Optional: Alert Configuration
# alert_email_address = "admin@yourdomain.com"
# teams_webhook_url   = "https://your-teams-webhook-url"

# Tags
common_tags = {
  Project     = "Azure Traffic Monitor"
  Environment = "$Environment"
  ManagedBy   = "Terraform"
  Owner       = "DevOps Team"
  CreatedBy   = "Setup Script"
  CreatedOn   = "$(Get-Date -Format 'yyyy-MM-dd')"
}
"@

New-Item -Path $terraformDir -ItemType Directory -Force | Out-Null
Set-Content -Path $tfvarsFile -Value $tfvarsContent -Encoding UTF8

Write-Success "Terraform variables file created: $tfvarsFile"

# Create environment-specific tfvars file
$envTfvarsDir = Join-Path $terraformDir "environments"
$envTfvarsFile = Join-Path $envTfvarsDir "$Environment.tfvars"

New-Item -Path $envTfvarsDir -ItemType Directory -Force | Out-Null
Copy-Item -Path $tfvarsFile -Destination $envTfvarsFile -Force

Write-Success "Environment-specific variables file created: $envTfvarsFile"

Write-Status "Next Steps:"
Write-Host "1. Review and update the variables in: $tfvarsFile" -ForegroundColor White
Write-Host "2. Run the deployment:" -ForegroundColor White
Write-Host "   cd terraform" -ForegroundColor Gray
Write-Host "   terraform init" -ForegroundColor Gray
Write-Host "   terraform plan -var-file=environments/$Environment.tfvars" -ForegroundColor Gray
Write-Host "   terraform apply -var-file=environments/$Environment.tfvars" -ForegroundColor Gray
Write-Host "3. Or use the deployment script:" -ForegroundColor White
if ($IsWindows -or $env:OS -eq "Windows_NT") {
    Write-Host "   powershell .\scripts\deploy.ps1 -Environment $Environment -Action plan" -ForegroundColor Gray
    Write-Host "   powershell .\scripts\deploy.ps1 -Environment $Environment -Action apply" -ForegroundColor Gray
} else {
    Write-Host "   ./deploy.sh -e $Environment -a plan" -ForegroundColor Gray
    Write-Host "   ./deploy.sh -e $Environment -a apply" -ForegroundColor Gray
}

Write-Success "Azure setup completed successfully!" 