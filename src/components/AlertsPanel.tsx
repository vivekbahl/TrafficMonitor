import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Bell } from 'lucide-react'
import { format } from 'date-fns'

interface Alert {
  id: string
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info'
  timestamp: Date
  resource?: string
  resolved: boolean
}

interface AlertsPanelProps {
  subscriptionId: string | null
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ subscriptionId }) => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved')

  useEffect(() => {
    if (subscriptionId) {
      // Simulate fetching alerts from Azure Monitor
      const mockAlerts: Alert[] = [
        {
          id: '1',
          title: 'High CPU Usage',
          description: 'CPU usage has exceeded 85% for the last 15 minutes',
          severity: 'warning',
          timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          resource: 'Production Database',
          resolved: false
        },
        {
          id: '2',
          title: 'Connection Timeout',
          description: 'Multiple connection timeouts detected on Application Gateway',
          severity: 'critical',
          timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
          resource: 'Production Gateway',
          resolved: false
        },
        {
          id: '3',
          title: 'Storage Quota Warning',
          description: 'Storage account usage is at 90% capacity',
          severity: 'warning',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          resource: 'Storage Account',
          resolved: true
        },
        {
          id: '4',
          title: 'Network Latency Spike',
          description: 'Unusual network latency detected between regions',
          severity: 'info',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          resource: 'Virtual Network',
          resolved: false
        }
      ]
      setAlerts(mockAlerts)
    }
  }, [subscriptionId])

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-50'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'info':
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || !alert.resolved
  )

  const unresolvedCount = alerts.filter(alert => !alert.resolved).length

  if (!subscriptionId) {
    return (
      <div className="card p-6">
        <div className="text-center text-gray-500">
          <Bell className="mx-auto h-12 w-12 mb-4" />
          <p>Select a subscription to view alerts</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Alerts & Issues</h3>
          {unresolvedCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unresolvedCount} active
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unresolved')}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-azure-500 focus:border-azure-500"
          >
            <option value="unresolved">Unresolved</option>
            <option value="all">All Alerts</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="mx-auto h-12 w-12 mb-4 text-green-500" />
            <p>No {filter === 'unresolved' ? 'active' : ''} alerts found</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(alert.severity)} ${
                alert.resolved ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      {alert.resolved && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{format(alert.timestamp, 'MMM dd, HH:mm')}</span>
                      {alert.resource && <span>• {alert.resource}</span>}
                    </div>
                  </div>
                </div>
                
                {!alert.resolved && (
                  <button
                    onClick={() => {
                      setAlerts(prev => 
                        prev.map(a => 
                          a.id === alert.id ? { ...a, resolved: true } : a
                        )
                      )
                    }}
                    className="text-sm text-azure-600 hover:text-azure-700 font-medium"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {filteredAlerts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Alerts:</span>
            <span className="font-medium">{alerts.length}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Critical:</span>
            <span className="font-medium text-red-600">
              {alerts.filter(a => a.severity === 'critical' && !a.resolved).length}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AlertsPanel 