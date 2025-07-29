import { DefaultAzureCredential } from '@azure/identity'
import { ResourceManagementClient } from '@azure/arm-resources'

export interface AzureMetric {
  name: string
  value: number
  unit: string
  timestamp: Date
}

export interface AzureResource {
  id: string
  name: string
  type: string
  location: string
  resourceGroup: string
  status: 'healthy' | 'warning' | 'error' | 'unknown'
}

export class AzureService {
  private credential: DefaultAzureCredential
  private resourceClient: ResourceManagementClient | null = null

  constructor() {
    this.credential = new DefaultAzureCredential()
  }

  async initializeResourceClient(subscriptionId: string) {
    if (!this.resourceClient) {
      this.resourceClient = new ResourceManagementClient(this.credential, subscriptionId)
    }
  }

  async getSubscriptions(): Promise<string[]> {
    try {
      // In a real implementation, you would fetch actual subscriptions
      // For now, return mock data
      return [
        'Production-Subscription-001',
        'Development-Subscription-002', 
        'Testing-Subscription-003'
      ]
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      return []
    }
  }

  async getResourceGroups(subscriptionId: string): Promise<string[]> {
    try {
      await this.initializeResourceClient(subscriptionId)
      if (!this.resourceClient) return []

      const resourceGroups = []
      for await (const resourceGroup of this.resourceClient.resourceGroups.list()) {
        if (resourceGroup.name) {
          resourceGroups.push(resourceGroup.name)
        }
      }
      return resourceGroups
    } catch (error) {
      console.error('Error fetching resource groups:', error)
      return ['production-rg', 'development-rg', 'testing-rg'] // Mock fallback
    }
  }

  async getResources(subscriptionId: string): Promise<AzureResource[]> {
    try {
      await this.initializeResourceClient(subscriptionId)
      if (!this.resourceClient) return this.getMockResources()

      const resources: AzureResource[] = []
      for await (const resource of this.resourceClient.resources.list()) {
        if (resource.id && resource.name && resource.type) {
          resources.push({
            id: resource.id,
            name: resource.name,
            type: resource.type,
            location: resource.location || 'Unknown',
            resourceGroup: this.extractResourceGroup(resource.id),
            status: this.getRandomStatus() // In real app, check actual health
          })
        }
      }
      return resources
    } catch (error) {
      console.error('Error fetching resources:', error)
      return this.getMockResources()
    }
  }

  async getMetrics(resourceId: string, metricNames: string[]): Promise<AzureMetric[]> {
    try {
      // For demo purposes, always return mock data
      // In production, you would implement the actual Azure Monitor API calls
      console.log(`Fetching metrics for ${resourceId}:`, metricNames)
      return this.getMockMetrics()
    } catch (error) {
      console.error('Error fetching metrics:', error)
      return this.getMockMetrics()
    }
  }



  private extractResourceGroup(resourceId: string): string {
    const match = resourceId.match(/\/resourceGroups\/([^\/]+)/)
    return match ? match[1] : 'Unknown'
  }

  private getRandomStatus(): 'healthy' | 'warning' | 'error' | 'unknown' {
    const statuses = ['healthy', 'healthy', 'healthy', 'warning', 'error'] // Bias towards healthy
    return statuses[Math.floor(Math.random() * statuses.length)] as any
  }

  private getMockResources(): AzureResource[] {
    return [
      {
        id: '/subscriptions/mock/resourceGroups/production-rg/providers/Microsoft.Sql/servers/proddb',
        name: 'Production Database',
        type: 'Microsoft.Sql/servers',
        location: 'East US',
        resourceGroup: 'production-rg',
        status: 'healthy'
      },
      {
        id: '/subscriptions/mock/resourceGroups/production-rg/providers/Microsoft.Network/applicationGateways/prod-gateway',
        name: 'Production Gateway',
        type: 'Microsoft.Network/applicationGateways',
        location: 'East US',
        resourceGroup: 'production-rg',
        status: 'healthy'
      },
      {
        id: '/subscriptions/mock/resourceGroups/production-rg/providers/Microsoft.Cache/Redis/prod-cache',
        name: 'Production Cache',
        type: 'Microsoft.Cache/Redis',
        location: 'East US',
        resourceGroup: 'production-rg',
        status: 'warning'
      }
    ]
  }

  private getMockMetrics(): AzureMetric[] {
    return [
      {
        name: 'CPU Percentage',
        value: Math.random() * 100,
        unit: 'Percent',
        timestamp: new Date()
      },
      {
        name: 'Memory Percentage',
        value: Math.random() * 100,
        unit: 'Percent',
        timestamp: new Date()
      },
      {
        name: 'Network In',
        value: Math.random() * 1000,
        unit: 'Bytes',
        timestamp: new Date()
      }
    ]
  }
}

// Singleton instance
export const azureService = new AzureService() 