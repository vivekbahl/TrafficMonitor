
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend: string
  trendType: 'positive' | 'negative' | 'neutral'
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendType 
}) => {
  const getTrendColor = () => {
    switch (trendType) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTrendIcon = () => {
    if (trendType === 'positive') return TrendingUp
    if (trendType === 'negative') return TrendingDown
    return null
  }

  const TrendIcon = getTrendIcon()

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-azure-100 rounded-lg">
            <Icon className="h-6 w-6 text-azure-600" />
          </div>
        </div>
        <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
          {TrendIcon && <TrendIcon className="h-4 w-4" />}
          <span>{trend}</span>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  )
}

export default MetricCard 