# Application Insights Action Group for alerts
resource "azurerm_monitor_action_group" "main" {
  name                = "${var.app_name}-alerts"
  resource_group_name = azurerm_resource_group.main.name
  short_name          = "trafficmon"

  dynamic "email_receiver" {
    for_each = var.alert_email_address != "" ? [1] : []
    content {
      name          = "admin"
      email_address = var.alert_email_address
    }
  }

  dynamic "webhook_receiver" {
    for_each = var.teams_webhook_url != "" ? [1] : []
    content {
      name        = "teams"
      service_uri = var.teams_webhook_url
    }
  }

  tags = var.common_tags
}

# CPU Alert
resource "azurerm_monitor_metric_alert" "cpu_alert" {
  name                = "${var.app_name}-high-cpu"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_linux_web_app.main.id]

  description = "High CPU usage detected"
  severity    = 2

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name     = "CpuPercentage"
    aggregation     = "Average"
    operator        = "GreaterThan"
    threshold       = 80

    dimension {
      name     = "Instance"
      operator = "Include"
      values   = ["*"]
    }
  }

  window_size = "PT5M"
  frequency   = "PT1M"

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = var.common_tags
}

# Memory Alert
resource "azurerm_monitor_metric_alert" "memory_alert" {
  name                = "${var.app_name}-high-memory"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_linux_web_app.main.id]

  description = "High memory usage detected"
  severity    = 2

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name     = "MemoryPercentage"
    aggregation     = "Average"
    operator        = "GreaterThan"
    threshold       = 85

    dimension {
      name     = "Instance"
      operator = "Include"
      values   = ["*"]
    }
  }

  window_size = "PT5M"
  frequency   = "PT1M"

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = var.common_tags
}

# Response Time Alert
resource "azurerm_monitor_metric_alert" "response_time_alert" {
  name                = "${var.app_name}-slow-response"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_linux_web_app.main.id]

  description = "Slow response time detected"
  severity    = 3

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name     = "AverageResponseTime"
    aggregation     = "Average"
    operator        = "GreaterThan"
    threshold       = 5000  # 5 seconds

    dimension {
      name     = "Instance"
      operator = "Include"
      values   = ["*"]
    }
  }

  window_size = "PT5M"
  frequency   = "PT1M"

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = var.common_tags
}

# Availability Alert
resource "azurerm_monitor_metric_alert" "availability_alert" {
  name                = "${var.app_name}-low-availability"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_application_insights.main.id]

  description = "Low availability detected"
  severity    = 1

  criteria {
    metric_namespace = "Microsoft.Insights/components"
    metric_name     = "availabilityResults/availabilityPercentage"
    aggregation     = "Average"
    operator        = "LessThan"
    threshold       = 95
  }

  window_size = "PT5M"
  frequency   = "PT1M"

  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }

  tags = var.common_tags
}

# Diagnostic Settings for App Service
resource "azurerm_monitor_diagnostic_setting" "app_service" {
  name                       = "${var.app_name}-diagnostics"
  target_resource_id         = azurerm_linux_web_app.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "AppServiceHTTPLogs"
  }

  enabled_log {
    category = "AppServiceConsoleLogs"
  }

  enabled_log {
    category = "AppServiceAppLogs"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
} 