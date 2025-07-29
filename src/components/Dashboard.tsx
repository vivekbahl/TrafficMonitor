import { useState, useEffect } from 'react'
import { Activity, AlertCircle, Zap, Network, Cloud } from 'lucide-react'
import TrafficChart from './TrafficChart'
import ConnectionStatus from './ConnectionStatus'
import MetricCard from './MetricCard'
import AzureResourceList from './AzureResourceList'
import AlertsPanel from './AlertsPanel'

interface DashboardProps {
  selectedSubscription: string | null
}

const Dashboard: React.FC<DashboardProps> = ({ selectedSubscription }) => {
  const [metrics, setMetrics] = useState({
    totalTraffic: 0,
    activeConnections: 0,
    errorRate: 0,
    latency: 0
  })

  // Mock data for demonstration
  useEffect(() => {
    if (selectedSubscription) {
      const mockMetrics = {
        totalTraffic: Math.floor(Math.random() * 1000) + 500,
        activeConnections: Math.floor(Math.random() * 50) + 25,
        errorRate: Math.random() * 5,
        latency: Math.floor(Math.random() * 100) + 50
      }
      setMetrics(mockMetrics)
    }
  }, [selectedSubscription])

  if (!selectedSubscription) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Cloud className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Subscription Selected
          </h3>
          <p className="text-gray-500">
            Please select an Azure subscription from the sidebar to view traffic monitoring data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Traffic Overview</h2>
          <p className="text-gray-600">Real-time monitoring of Azure resources</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Data</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Traffic"
          value={`${metrics.totalTraffic} GB/h`}
          icon={Activity}
          trend="+12%"
          trendType="positive"
        />
        <MetricCard
          title="Active Connections"
          value={metrics.activeConnections.toString()}
          icon={Network}
          trend="+5%"
          trendType="positive"
        />
        <MetricCard
          title="Error Rate"
          value={`${metrics.errorRate.toFixed(2)}%`}
          icon={AlertCircle}
          trend="-2%"
          trendType="negative"
        />
        <MetricCard
          title="Avg Latency"
          value={`${metrics.latency}ms`}
          icon={Zap}
          trend="+8ms"
          trendType="neutral"
        />
      </div>

      {/* Charts and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrafficChart />
        </div>
        <div>
          <ConnectionStatus />
        </div>
      </div>

      {/* Azure Resources and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <AzureResourceList subscriptionId={selectedSubscription} />
        <AlertsPanel subscriptionId={selectedSubscription} />
      </div>
    </div>
  )
}

export default Dashboard 