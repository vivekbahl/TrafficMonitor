# Azure Traffic Monitor - PowerShell Deployment Script for Windows
# This script deploys the infrastructure using Terraform

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("plan", "apply", "destroy")]
    [string]$Action = "plan",
    
    [Parameter(Mandatory=$false)]
    [switch]$AutoApprove = $false
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

function Show-Usage {
    Write-Host "Usage: .\deploy.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Environment ENV    Environment to deploy (dev, staging, prod) [default: dev]"
    Write-Host "  -Action ACTION      Terraform action (plan, apply, destroy) [default: plan]"
    Write-Host "  -AutoApprove        Auto approve Terraform actions"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy.ps1 -Environment dev -Action plan"
    Write-Host "  .\deploy.ps1 -Environment prod -Action apply -AutoApprove"
    Write-Host "  .\deploy.ps1 -Environment dev -Action destroy"
}

# Check prerequisites
Write-Status "Checking prerequisites..."

# Check if Terraform is installed
try {
    $tfVersion = terraform version
    Write-Success "Terraform found"
} catch {
    Write-Error "Terraform is not installed. Please install Terraform first."
    exit 1
}

# Check if Azure CLI is installed
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Success "Azure CLI found"
} catch {
    Write-Error "Azure CLI is not installed. Please install Azure CLI first."
    exit 1
}

# Check if logged into Azure
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Success "Logged into Azure as: $($account.user.name)"
} catch {
    Write-Error "Not logged into Azure. Please run 'az login' first."
    exit 1
}

Write-Success "Prerequisites check passed"

# Navigate to terraform directory
$terraformDir = Join-Path $PSScriptRoot "..\terraform"
if (-not (Test-Path $terraformDir)) {
    Write-Error "Terraform directory not found: $terraformDir"
    exit 1
}

Set-Location $terraformDir

# Check if environment-specific tfvars file exists
$tfvarsFile = "environments\$Environment.tfvars"
if (-not (Test-Path $tfvarsFile)) {
    Write-Error "Environment file not found: $tfvarsFile"
    Write-Warning "Please create the environment-specific tfvars file or copy from terraform.tfvars.example"
    exit 1
}

# Initialize Terraform
Write-Status "Initializing Terraform..."
$initResult = terraform init
if ($LASTEXITCODE -ne 0) {
    Write-Error "Terraform init failed"
    exit 1
}

# Validate Terraform configuration
Write-Status "Validating Terraform configuration..."
$validateResult = terraform validate
if ($LASTEXITCODE -ne 0) {
    Write-Error "Terraform validation failed"
    exit 1
}

Write-Success "Terraform validation passed"

# Format Terraform files
Write-Status "Formatting Terraform files..."
terraform fmt -recursive

# Execute Terraform action
switch ($Action) {
    "plan" {
        Write-Status "Running Terraform plan for $Environment environment..."
        terraform plan -var-file="$tfvarsFile" -out="$Environment.tfplan"
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Terraform plan completed. Review the plan above."
            Write-Warning "To apply these changes, run: .\deploy.ps1 -Environment $Environment -Action apply"
        } else {
            Write-Error "Terraform plan failed"
            exit 1
        }
    }
    
    "apply" {
        if (Test-Path "$Environment.tfplan") {
            Write-Status "Applying Terraform plan for $Environment environment..."
            if ($AutoApprove) {
                terraform apply "$Environment.tfplan"
            } else {
                terraform apply "$Environment.tfplan"
            }
        } else {
            Write-Status "No plan file found. Running plan and apply for $Environment environment..."
            if ($AutoApprove) {
                terraform apply -var-file="$tfvarsFile" -auto-approve
            } else {
                terraform apply -var-file="$tfvarsFile"
            }
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Terraform apply completed successfully"
            Write-Status "Displaying outputs..."
            terraform output
        } else {
            Write-Error "Terraform apply failed"
            exit 1
        }
    }
    
    "destroy" {
        Write-Warning "This will DESTROY all resources in the $Environment environment!"
        if (-not $AutoApprove) {
            $confirm = Read-Host "Are you sure you want to continue? (yes/no)"
            if ($confirm -ne "yes") {
                Write-Status "Destroy operation cancelled"
                exit 0
            }
        }
        
        Write-Status "Destroying Terraform resources for $Environment environment..."
        if ($AutoApprove) {
            terraform destroy -var-file="$tfvarsFile" -auto-approve
        } else {
            terraform destroy -var-file="$tfvarsFile"
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Terraform destroy completed successfully"
        } else {
            Write-Error "Terraform destroy failed"
            exit 1
        }
    }
}

Write-Success "Deployment script completed successfully!" 