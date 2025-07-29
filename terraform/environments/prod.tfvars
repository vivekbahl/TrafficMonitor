# Production Environment Configuration

resource_group_name = "rg-azure-traffic-monitor-prod"
app_name           = "azure-traffic-monitor-prod"
location           = "East US"
environment        = "production"
app_service_sku    = "P1V2"  # Production tier

# GitHub Repository
github_repo_url = "https://github.com/your-username/azure-traffic-monitor"
github_branch   = "main"

# Optional: Custom Domain
# custom_domain = "monitor.yourdomain.com"

# Tags for production
common_tags = {
  Project     = "Azure Traffic Monitor"
  Environment = "production"
  ManagedBy   = "Terraform"
  Owner       = "DevOps Team"
  CostCenter  = "IT-Infrastructure"
  Backup      = "Daily"
  Monitoring  = "Enabled"
} 