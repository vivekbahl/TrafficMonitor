#!/bin/bash

# Azure Traffic Monitor - Deployment Script
# This script deploys the infrastructure using Terraform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
ACTION="plan"
AUTO_APPROVE=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Environment to deploy (dev, staging, prod) [default: dev]"
    echo "  -a, --action ACTION      Terraform action (plan, apply, destroy) [default: plan]"
    echo "  -y, --auto-approve       Auto approve Terraform actions"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e dev -a plan                   # Plan development deployment"
    echo "  $0 -e prod -a apply -y             # Apply production deployment with auto-approve"
    echo "  $0 -e dev -a destroy               # Destroy development environment"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -a|--action)
            ACTION="$2"
            shift 2
            ;;
        -y|--auto-approve)
            AUTO_APPROVE=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be dev, staging, or prod."
    exit 1
fi

# Validate action
if [[ ! "$ACTION" =~ ^(plan|apply|destroy)$ ]]; then
    print_error "Invalid action: $ACTION. Must be plan, apply, or destroy."
    exit 1
fi

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    print_error "Terraform is not installed. Please install Terraform first."
    exit 1
fi

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    print_error "Azure CLI is not installed. Please install Azure CLI first."
    exit 1
fi

# Check if logged into Azure
if ! az account show &> /dev/null; then
    print_error "Not logged into Azure. Please run 'az login' first."
    exit 1
fi

print_success "Prerequisites check passed"

# Navigate to terraform directory
cd terraform

# Check if environment-specific tfvars file exists
TFVARS_FILE="environments/${ENVIRONMENT}.tfvars"
if [[ ! -f "$TFVARS_FILE" ]]; then
    print_error "Environment file not found: $TFVARS_FILE"
    print_warning "Please create the environment-specific tfvars file or copy from terraform.tfvars.example"
    exit 1
fi

# Initialize Terraform
print_status "Initializing Terraform..."
terraform init

# Validate Terraform configuration
print_status "Validating Terraform configuration..."
terraform validate

if [[ $? -ne 0 ]]; then
    print_error "Terraform validation failed"
    exit 1
fi

print_success "Terraform validation passed"

# Format Terraform files
print_status "Formatting Terraform files..."
terraform fmt -recursive

# Execute Terraform action
case $ACTION in
    plan)
        print_status "Running Terraform plan for $ENVIRONMENT environment..."
        terraform plan -var-file="$TFVARS_FILE" -out="$ENVIRONMENT.tfplan"
        print_success "Terraform plan completed. Review the plan above."
        print_warning "To apply these changes, run: $0 -e $ENVIRONMENT -a apply"
        ;;
    apply)
        if [[ -f "$ENVIRONMENT.tfplan" ]]; then
            print_status "Applying Terraform plan for $ENVIRONMENT environment..."
            if [[ "$AUTO_APPROVE" == "true" ]]; then
                terraform apply "$ENVIRONMENT.tfplan"
            else
                terraform apply "$ENVIRONMENT.tfplan"
            fi
        else
            print_status "No plan file found. Running plan and apply for $ENVIRONMENT environment..."
            if [[ "$AUTO_APPROVE" == "true" ]]; then
                terraform apply -var-file="$TFVARS_FILE" -auto-approve
            else
                terraform apply -var-file="$TFVARS_FILE"
            fi
        fi
        
        if [[ $? -eq 0 ]]; then
            print_success "Terraform apply completed successfully"
            print_status "Displaying outputs..."
            terraform output
        else
            print_error "Terraform apply failed"
            exit 1
        fi
        ;;
    destroy)
        print_warning "This will DESTROY all resources in the $ENVIRONMENT environment!"
        if [[ "$AUTO_APPROVE" != "true" ]]; then
            read -p "Are you sure you want to continue? (yes/no): " -r
            if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
                print_status "Destroy operation cancelled"
                exit 0
            fi
        fi
        
        print_status "Destroying Terraform resources for $ENVIRONMENT environment..."
        if [[ "$AUTO_APPROVE" == "true" ]]; then
            terraform destroy -var-file="$TFVARS_FILE" -auto-approve
        else
            terraform destroy -var-file="$TFVARS_FILE"
        fi
        
        if [[ $? -eq 0 ]]; then
            print_success "Terraform destroy completed successfully"
        else
            print_error "Terraform destroy failed"
            exit 1
        fi
        ;;
esac

print_success "Deployment script completed successfully!" 