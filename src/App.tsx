import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { theme } from './theme/theme';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Incomes from './pages/Incomes';
import Aldi from './pages/Aldi';
import AldiDetail from './pages/AldiDetail';

function App() {
  const location = useLocation();
  const currentPath = location.pathname.slice(1) || 'dashboard';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout activeTab={currentPath}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/incomes" element={<Incomes />} />
          <Route path="/aldi" element={<Aldi />} />
          <Route path="/aldi/:sku" element={<AldiDetail />} />
          <Route path="/inventory" element={<div className="p-8 text-center text-gray-500">Inventario - In sviluppo</div>} />
          <Route path="/reports" element={<div className="p-8 text-center text-gray-500">Report - In sviluppo</div>} />
          <Route path="/profile" element={<div className="p-8 text-center text-gray-500">Profilo - In sviluppo</div>} />
          <Route path="/settings" element={<div className="p-8 text-center text-gray-500">Impostazioni - In sviluppo</div>} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
