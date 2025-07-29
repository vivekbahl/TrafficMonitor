
import { X, Activity, BarChart3, AlertTriangle, Cloud, Database, Network } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedSubscription: string | null
  onSubscriptionChange: (subscription: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  selectedSubscription, 
  onSubscriptionChange 
}) => {
  const mockSubscriptions = [
    'Production-Subscription-001',
    'Development-Subscription-002',
    'Testing-Subscription-003'
  ]

  const navigationItems = [
    { icon: Activity, label: 'Overview', active: true },
    { icon: BarChart3, label: 'Traffic Analytics' },
    { icon: Network, label: 'Network Health' },
    { icon: AlertTriangle, label: 'Alerts & Issues' },
    { icon: Cloud, label: 'Azure Resources' },
    { icon: Database, label: 'Data Sources' },
  ]

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <span className="text-lg font-semibold text-gray-900">Navigation</span>
        <button
          onClick={onClose}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Azure Subscription
          </label>
          <select
            value={selectedSubscription || ''}
            onChange={(e) => onSubscriptionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-azure-500 focus:border-azure-500"
          >
            <option value="">Select Subscription</option>
            {mockSubscriptions.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                item.active
                  ? 'bg-azure-100 text-azure-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar 