import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import Expenses from './pages/Expenses';
import { TabType } from './types';
import Incomes from './pages/Incomes';
import Aldi from './pages/Aldi';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <Expenses />;
      case 'incomes':
        return <Incomes />;
      case 'users':
        return <Aldi />;
      case 'inventory':
        return <div className="p-8 text-center text-gray-500">Inventario - In sviluppo</div>;
      case 'reports':
        return <div className="p-8 text-center text-gray-500">Report - In sviluppo</div>;
      case 'profile':
        return <div className="p-8 text-center text-gray-500">Profilo - In sviluppo</div>;
      case 'settings':
        return <div className="p-8 text-center text-gray-500">Impostazioni - In sviluppo</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout activeTab={activeTab} onTabChange={handleTabChange}>
        {renderContent()}
      </Layout>
    </ThemeProvider>
  );
}

export default App;
