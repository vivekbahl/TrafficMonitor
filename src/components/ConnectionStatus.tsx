
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react'

interface ConnectionItem {
  id: string
  name: string
  type: string
  status: 'healthy' | 'warning' | 'error' | 'checking'
  latency?: number
  lastChecked: string
}

const ConnectionStatus: React.FC = () => {
  const connections: ConnectionItem[] = [
    {
      id: '1',
      name: 'Azure SQL Database',
      type: 'Database',
      status: 'healthy',
      latency: 45,
      lastChecked: '2 min ago'
    },
    {
      id: '2',
      name: 'Application Gateway',
      type: 'Load Balancer',
      status: 'healthy',
      latency: 28,
      lastChecked: '1 min ago'
    },
    {
      id: '3',
      name: 'Redis Cache',
      type: 'Cache',
      status: 'warning',
      latency: 120,
      lastChecked: '3 min ago'
    },
    {
      id: '4',
      name: 'Storage Account',
      type: 'Storage',
      status: 'error',
      lastChecked: '5 min ago'
    },
    {
      id: '5',
      name: 'Service Bus',
      type: 'Messaging',
      status: 'checking',
      lastChecked: 'checking...'
    }
  ]

  const getStatusIcon = (status: ConnectionItem['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'checking':
        return <Clock className="h-5 w-5 text-gray-400 animate-spin" />
    }
  }

  const getStatusBadge = (status: ConnectionItem['status']) => {
    switch (status) {
      case 'healthy':
        return 'status-healthy'
      case 'warning':
        return 'status-warning'
      case 'error':
        return 'status-error'
      case 'checking':
        return 'bg-gray-50 text-gray-600'
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Connection Status</h3>
        <button className="text-sm text-azure-600 hover:text-azure-700 font-medium">
          Refresh All
        </button>
      </div>

      <div className="space-y-4">
        {connections.map((connection) => (
          <div key={connection.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(connection.status)}
              <div>
                <div className="font-medium text-gray-900">{connection.name}</div>
                <div className="text-sm text-gray-500">{connection.type}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(connection.status)}`}>
                {connection.status}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {connection.latency && `${connection.latency}ms • `}
                {connection.lastChecked}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total Resources</span>
          <span className="font-medium text-gray-900">{connections.length}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-500">Healthy</span>
          <span className="font-medium text-green-600">
            {connections.filter(c => c.status === 'healthy').length}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ConnectionStatus 