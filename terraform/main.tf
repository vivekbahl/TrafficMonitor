# Configure the Azure Provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
  required_version = ">= 1.0"
}

# Configure the Microsoft Azure Provider
provider "azurerm" {
  features {}
}

# Create a resource group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = var.common_tags
}

# Create an App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "${var.app_name}-plan"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  os_type            = "Linux"
  sku_name           = var.app_service_sku

  tags = var.common_tags
}

# Create the App Service
resource "azurerm_linux_web_app" "main" {
  name                = var.app_name
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_service_plan.main.location
  service_plan_id    = azurerm_service_plan.main.id

  site_config {
    always_on = var.environment == "production" ? true : false
    
    application_stack {
      node_version = "18-lts"
    }

    app_command_line = "npm start"
  }

  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "18.17.0"
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "true"
    "VITE_AZURE_CLIENT_ID" = var.azure_client_id
    "VITE_AZURE_TENANT_ID" = var.azure_tenant_id
    "VITE_AZURE_SUBSCRIPTION_ID" = var.azure_subscription_id
    "VITE_AZURE_ENVIRONMENT" = "AzurePublicCloud"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = var.common_tags
}

# Create Application Insights
resource "azurerm_application_insights" "main" {
  name                = "${var.app_name}-insights"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
  workspace_id        = azurerm_log_analytics_workspace.main.id

  tags = var.common_tags
}

# Create Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.app_name}-workspace"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = var.common_tags
}

# Create Storage Account for build artifacts (optional)
resource "azurerm_storage_account" "build" {
  name                     = "${replace(var.app_name, "-", "")}build"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = var.common_tags
}

# Configure App Service deployment settings
resource "azurerm_app_service_source_control" "main" {
  app_id                 = azurerm_linux_web_app.main.id
  repo_url              = var.github_repo_url
  branch                = var.github_branch
  use_manual_integration = true
}

# Configure custom domain (optional)
resource "azurerm_app_service_custom_hostname_binding" "main" {
  count               = var.custom_domain != "" ? 1 : 0
  hostname            = var.custom_domain
  app_service_name    = azurerm_linux_web_app.main.name
  resource_group_name = azurerm_resource_group.main.name
}

# Configure SSL certificate (optional)
resource "azurerm_app_service_managed_certificate" "main" {
  count                            = var.custom_domain != "" ? 1 : 0
  custom_hostname_binding_id       = azurerm_app_service_custom_hostname_binding.main[0].id
} 