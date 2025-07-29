import { useState, useEffect } from 'react'
import { Cloud, Database, Network, Shield, HardDrive, MessageSquare } from 'lucide-react'
import { azureService, AzureResource } from '../services/azureService'

interface AzureResourceListProps {
  subscriptionId: string | null
}

const AzureResourceList: React.FC<AzureResourceListProps> = ({ subscriptionId }) => {
  const [resources, setResources] = useState<AzureResource[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (subscriptionId) {
      fetchResources()
    }
  }, [subscriptionId])

  const fetchResources = async () => {
    if (!subscriptionId) return

    setLoading(true)
    setError(null)
    
    try {
      const resourceList = await azureService.getResources(subscriptionId)
      setResources(resourceList)
    } catch (err) {
      setError('Failed to fetch Azure resources')
      console.error('Error fetching resources:', err)
    } finally {
      setLoading(false)
    }
  }

  const getResourceIcon = (resourceType: string) => {
    if (resourceType.includes('Sql') || resourceType.includes('Database')) {
      return Database
    } else if (resourceType.includes('Network') || resourceType.includes('Gateway')) {
      return Network
    } else if (resourceType.includes('Storage')) {
      return HardDrive
    } else if (resourceType.includes('ServiceBus')) {
      return MessageSquare
    } else if (resourceType.includes('Security')) {
      return Shield
    }
    return Cloud
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (!subscriptionId) {
    return (
      <div className="card p-6">
        <div className="text-center text-gray-500">
          <Cloud className="mx-auto h-12 w-12 mb-4" />
          <p>Select a subscription to view resources</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Azure Resources</h3>
        <button
          onClick={fetchResources}
          disabled={loading}
          className="px-3 py-1 text-sm text-azure-600 hover:text-azure-700 font-medium disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => {
            const IconComponent = getResourceIcon(resource.type)
            return (
              <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-azure-100 rounded-lg">
                    <IconComponent className="h-5 w-5 text-azure-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{resource.name}</div>
                    <div className="text-sm text-gray-500">
                      {resource.type.split('/').pop()} • {resource.location}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-xs text-gray-500">
                    {resource.resourceGroup}
                  </div>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                    {resource.status}
                  </span>
                </div>
              </div>
            )
          })}
          
          {resources.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <Cloud className="mx-auto h-12 w-12 mb-4" />
              <p>No resources found in this subscription</p>
            </div>
          )}
        </div>
      )}

      {resources.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Resources:</span>
              <span className="font-medium">{resources.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Healthy:</span>
              <span className="font-medium text-green-600">
                {resources.filter(r => r.status === 'healthy').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AzureResourceList 