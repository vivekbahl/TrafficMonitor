# Data source for current Azure subscription
data "azurerm_client_config" "current" {}

data "azurerm_subscription" "current" {}

# Data source for Azure Monitor Reader role
data "azurerm_role_definition" "monitor_reader" {
  name = "Monitoring Reader"
}

# Data source for Azure Resource Reader role
data "azurerm_role_definition" "resource_reader" {
  name = "Reader"
}

# Assign Monitoring Reader role to App Service managed identity
resource "azurerm_role_assignment" "app_service_monitor_reader" {
  scope                = data.azurerm_subscription.current.id
  role_definition_id   = data.azurerm_role_definition.monitor_reader.id
  principal_id         = azurerm_linux_web_app.main.identity[0].principal_id
  
  depends_on = [azurerm_linux_web_app.main]
}

# Assign Reader role to App Service managed identity for resource access
resource "azurerm_role_assignment" "app_service_resource_reader" {
  scope                = data.azurerm_subscription.current.id
  role_definition_id   = data.azurerm_role_definition.resource_reader.id
  principal_id         = azurerm_linux_web_app.main.identity[0].principal_id
  
  depends_on = [azurerm_linux_web_app.main]
}

# Optional: Create custom role for specific Azure Monitor permissions
resource "azurerm_role_definition" "traffic_monitor_role" {
  name  = "Azure Traffic Monitor Role"
  scope = data.azurerm_subscription.current.id

  description = "Custom role for Azure Traffic Monitor application"

  permissions {
    actions = [
      "Microsoft.Insights/metrics/read",
      "Microsoft.Insights/metricDefinitions/read",
      "Microsoft.Resources/subscriptions/resourceGroups/read",
      "Microsoft.Resources/subscriptions/resources/read",
      "Microsoft.Network/*/read",
      "Microsoft.Compute/*/read",
      "Microsoft.Web/*/read",
      "Microsoft.Sql/*/read",
      "Microsoft.Storage/*/read"
    ]
    not_actions = []
    data_actions = []
    not_data_actions = []
  }

  assignable_scopes = [
    data.azurerm_subscription.current.id
  ]
}

# Assign custom role to App Service managed identity
resource "azurerm_role_assignment" "app_service_custom_role" {
  scope              = data.azurerm_subscription.current.id
  role_definition_id = azurerm_role_definition.traffic_monitor_role.role_definition_resource_id
  principal_id       = azurerm_linux_web_app.main.identity[0].principal_id
  
  depends_on = [azurerm_linux_web_app.main, azurerm_role_definition.traffic_monitor_role]
} 