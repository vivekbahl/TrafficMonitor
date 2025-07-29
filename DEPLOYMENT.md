# Azure Traffic Monitor - Deployment Guide

This guide walks you through deploying the Azure Traffic Monitor application to Azure App Service using Terraform automation.

## Prerequisites

Before you begin, ensure you have the following installed and configured:

### Required Tools
- [Node.js 18+](https://nodejs.org/)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Terraform](https://www.terraform.io/downloads) (v1.0+)
- [Git](https://git-scm.com/)

### Azure Requirements
- Active Azure subscription
- Azure AD application registration
- Appropriate permissions to create resources

## Setup Steps

### 1. Azure Authentication Setup

#### Create Azure AD Application
```bash
# Login to Azure
az login

# Create AD application
az ad app create --display-name "Azure Traffic Monitor" --reply-urls "https://your-app-name.azurewebsites.net"

# Note the Application (client) ID from the output
# Get your Tenant ID
az account show --query tenantId -o tsv

# Get your Subscription ID
az account show --query id -o tsv
```

#### Configure Environment Variables
Copy the example environment file and fill in your Azure credentials:

```bash
# Copy the example file
cp terraform/terraform.tfvars.example terraform/terraform.tfvars

# Edit with your values
nano terraform/terraform.tfvars
```

### 2. Infrastructure Deployment

#### Development Environment
```bash
# Plan the deployment
./deploy.sh -e dev -a plan

# Apply the deployment
./deploy.sh -e dev -a apply
```

#### Production Environment
```bash
# Plan the deployment
./deploy.sh -e prod -a plan

# Apply the deployment
./deploy.sh -e prod -a apply
```

### 3. Manual Deployment Steps

If you prefer manual deployment:

#### Initialize Terraform
```bash
cd terraform
terraform init
terraform validate
```

#### Deploy to Development
```bash
terraform plan -var-file="environments/dev.tfvars"
terraform apply -var-file="environments/dev.tfvars"
```

#### Deploy to Production
```bash
terraform plan -var-file="environments/prod.tfvars"
terraform apply -var-file="environments/prod.tfvars"
```

## Configuration

### Environment Variables

The following environment variables are automatically configured by Terraform:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_AZURE_CLIENT_ID` | Azure AD App Client ID | `12345678-1234-1234-1234-123456789abc` |
| `VITE_AZURE_TENANT_ID` | Azure AD Tenant ID | `87654321-4321-4321-4321-cba987654321` |
| `VITE_AZURE_SUBSCRIPTION_ID` | Azure Subscription ID | `abcdef12-3456-7890-abcd-ef1234567890` |

### Terraform Variables

Edit `terraform/terraform.tfvars` with your specific values:

```hcl
# Basic Configuration
resource_group_name = "rg-azure-traffic-monitor-prod"
app_name           = "azure-traffic-monitor-prod"
location           = "East US"
environment        = "production"
app_service_sku    = "B2"

# Azure Authentication
azure_client_id       = "your-azure-client-id"
azure_tenant_id       = "your-azure-tenant-id"
azure_subscription_id = "your-azure-subscription-id"

# GitHub Repository (optional)
github_repo_url = "https://github.com/your-username/azure-traffic-monitor"
github_branch   = "main"

# Custom Domain (optional)
custom_domain = "monitor.yourdomain.com"
```

## CI/CD Setup

### GitHub Actions

The repository includes GitHub Actions workflows for automated deployment:

#### Required GitHub Secrets

Add the following secrets to your GitHub repository:

| Secret | Description |
|--------|-------------|
| `AZURE_CREDENTIALS` | Service principal credentials for Azure login |
| `AZURE_WEBAPP_NAME_PRODUCTION` | Production App Service name |
| `AZURE_WEBAPP_NAME_STAGING` | Staging App Service name |
| `AZURE_WEBAPP_PUBLISH_PROFILE_PRODUCTION` | Production publish profile |
| `AZURE_WEBAPP_PUBLISH_PROFILE_STAGING` | Staging publish profile |
| `AZURE_RESOURCE_GROUP` | Resource group name |
| `VITE_AZURE_CLIENT_ID` | Azure AD Client ID |
| `VITE_AZURE_TENANT_ID` | Azure AD Tenant ID |
| `VITE_AZURE_SUBSCRIPTION_ID` | Azure Subscription ID |

#### Service Principal Creation
```bash
# Create service principal for GitHub Actions
az ad sp create-for-rbac --name "github-actions-azure-traffic-monitor" \
  --role contributor \
  --scopes /subscriptions/{subscription-id} \
  --sdk-auth
```

Use the output JSON as the value for `AZURE_CREDENTIALS` secret.

### Deployment Triggers

- **Push to `main`** → Deploy to Production
- **Push to `develop`** → Deploy to Staging
- **Pull Request** → Build and Test only

## Monitoring and Logging

### Application Insights

The deployment automatically creates:
- Application Insights instance
- Log Analytics workspace
- Performance monitoring
- Error tracking

### Accessing Logs

```bash
# View App Service logs
az webapp log tail --name your-app-name --resource-group your-resource-group

# Stream logs in real-time
az webapp log config --name your-app-name --resource-group your-resource-group \
  --application-logging filesystem --level information
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Terraform Issues
```bash
# Refresh Terraform state
terraform refresh

# Check Terraform version
terraform --version  # Should be 1.0+

# Validate configuration
terraform validate
```

#### Azure Authentication
```bash
# Check Azure login status
az account show

# Re-login if needed
az login

# Verify subscription
az account list --output table
```

### Health Checks

After deployment, verify the application:

1. **App Service Health**: Check Azure Portal → App Services → your-app
2. **Application URL**: Visit the deployed URL
3. **Logs**: Check Application Insights for any errors
4. **Metrics**: Monitor performance in Azure Monitor

### Performance Optimization

#### App Service Settings
- **Always On**: Enabled for production
- **ARR Affinity**: Disabled for better load distribution
- **HTTP Version**: 2.0
- **Platform**: 64-bit

#### Caching
- Static assets cached for 1 year
- API responses with appropriate cache headers
- CDN integration (optional)

## Scaling

### Horizontal Scaling
```bash
# Scale out (increase instances)
az appservice plan update --name your-plan --resource-group your-rg --number-of-workers 3

# Scale up (increase VM size)
az appservice plan update --name your-plan --resource-group your-rg --sku P2V2
```

### Auto-scaling
Configure auto-scaling rules in Azure Portal:
- CPU threshold: 70%
- Memory threshold: 80%
- Min instances: 1
- Max instances: 10

## Security

### Managed Identity
The App Service uses system-assigned managed identity with minimal permissions:
- **Monitoring Reader**: Read Azure Monitor metrics
- **Reader**: Read Azure resources
- **Custom Role**: Specific permissions for traffic monitoring

### Network Security
- HTTPS only (enforced)
- TLS 1.2 minimum
- Security headers configured
- CORS policies applied

## Cleanup

### Destroy Infrastructure
```bash
# Development environment
./deploy.sh -e dev -a destroy -y

# Production environment
./deploy.sh -e prod -a destroy -y
```

### Manual Cleanup
```bash
cd terraform
terraform destroy -var-file="environments/prod.tfvars"
```

## Support

For issues and questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review Azure Portal logs
3. Check Application Insights for errors
4. Create GitHub issue for bugs

## Cost Optimization

### Development
- Use **F1 (Free)** tier for development
- Enable auto-shutdown for non-production
- Monitor usage with Azure Cost Management

### Production
- Use **B1/B2** for small workloads
- Use **P1V2+** for production workloads
- Consider reserved instances for cost savings
- Set up budget alerts 