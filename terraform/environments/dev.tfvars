# Development Environment Configuration

resource_group_name = "rg-azure-traffic-monitor-dev"
app_name           = "azure-traffic-monitor-dev"
location           = "East US"
environment        = "dev"
app_service_sku    = "F1"  # Free tier for development

# GitHub Repository
github_repo_url = "https://github.com/your-username/azure-traffic-monitor"
github_branch   = "develop"

# Tags for development
common_tags = {
  Project     = "Azure Traffic Monitor"
  Environment = "development"
  ManagedBy   = "Terraform"
  Owner       = "Development Team"
  CostCenter  = "IT-Development"
} 