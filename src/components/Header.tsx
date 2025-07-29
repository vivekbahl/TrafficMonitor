
import { Menu, Bell, Settings, User } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
  selectedSubscription: string | null
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, selectedSubscription }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-azure-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AZ</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Azure Traffic Monitor
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {selectedSubscription && (
            <div className="hidden md:flex items-center px-3 py-1 bg-azure-50 text-azure-700 rounded-full text-sm">
              <span className="font-medium">Subscription:</span>
              <span className="ml-1 truncate max-w-48">{selectedSubscription}</span>
            </div>
          )}
          
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Bell className="h-5 w-5" />
          </button>
          
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Settings className="h-5 w-5" />
          </button>
          
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header 