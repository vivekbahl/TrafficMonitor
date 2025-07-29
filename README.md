# Azure Traffic Monitor

A modern React-based dashboard for monitoring Azure traffic, data flow, and connection health between Azure components and remote sites.

## Features

🚀 **Real-time Traffic Monitoring**: Monitor data flow and traffic patterns across Azure resources
📊 **Interactive Charts**: Visualize metrics with responsive charts using Recharts
🔍 **Connection Health**: Track connection status and issues between Azure components
⚡ **Azure Integration**: Direct integration with Azure Monitor APIs for live data
🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
📱 **Mobile Responsive**: Works seamlessly across desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with custom Azure theme
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for beautiful icons
- **Azure APIs**: Azure Monitor, ARM, and Identity SDKs

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Azure subscription (for live data)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd azure-traffic-monitor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Azure Integration

### Setting up Azure Authentication

To connect to your Azure subscription:

1. Register an application in Azure Active Directory
2. Grant necessary permissions for Monitor and Resource Management
3. Configure environment variables:

```env
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_AZURE_CLIENT_SECRET=your-client-secret
```

### Supported Azure Resources

- Azure SQL Database
- Application Gateway
- Redis Cache
- Storage Accounts
- Service Bus
- Virtual Networks
- Load Balancers

## Usage

1. **Select Subscription**: Use the sidebar to select your Azure subscription
2. **View Metrics**: Monitor real-time traffic and performance metrics
3. **Check Health**: Review connection status of your Azure resources
4. **Analyze Trends**: Use the charts to identify traffic patterns and issues

## Project Structure

```
src/
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Header.tsx       # Navigation header
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── MetricCard.tsx   # Metric display cards
│   ├── TrafficChart.tsx # Traffic visualization
│   └── ConnectionStatus.tsx # Resource health
├── index.css           # Global styles
├── main.tsx           # App entry point
└── App.tsx            # Main app component
```

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 