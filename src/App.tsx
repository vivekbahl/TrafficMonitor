import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        selectedSubscription={selectedSubscription}
        onSubscriptionChange={setSelectedSubscription}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          selectedSubscription={selectedSubscription}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Dashboard selectedSubscription={selectedSubscription} />
        </main>
      </div>
    </div>
  )
}

export default App 