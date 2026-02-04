
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { User, UserRole } from './types';
import { api } from './services/api';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import Login from './pages/Login';
import BillingPackages from './pages/BillingPackages';
import BillingWizard from './pages/BillingWizard';
import CompanyManagement from './pages/CompanyManagement';

const Layout: React.FC<{ user: User; onLogout: () => void; children: React.ReactNode }> = ({ user, onLogout, children }) => {
  const location = useLocation();
  const navItems = [
    { name: 'Dashboard', path: '/', roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FINANCE] },
    { name: 'Projects', path: '/projects', roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER] },
    { name: 'Clients', path: '/clients', roles: [UserRole.ADMIN] },
    { name: 'Billing Packages', path: '/packages', roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FINANCE] },
    { name: 'Company Profiles', path: '/companies', roles: [UserRole.ADMIN] },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">CB</div>
            ConstrucBill
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.filter(item => item.roles.includes(user.role)).map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2.5 rounded-lg transition-colors ${
                location.pathname === item.path ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate capitalize tracking-wider uppercase">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(api.getCurrentUser());

  const handleLogin = async (email: string) => {
    try {
      const data = await api.login(email);
      setUser(data.user);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route
          path="/*"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Dashboard user={user} />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/packages" element={<BillingPackages user={user} />} />
                  <Route path="/packages/new" element={<BillingWizard user={user} />} />
                  <Route path="/packages/:id" element={<BillingWizard user={user} />} />
                  <Route path="/companies" element={<CompanyManagement />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
