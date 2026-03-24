import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { LogOut, LayoutDashboard, BookOpen, Menu, X, ChevronRight, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './Sidebar';
import SidebarContent from './SidebarContent';
import { testConnection } from '../firebase';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, logout, isAdmin } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [dbStatus, setDbStatus] = React.useState<'checking' | 'connected' | 'error'>('checking');

  React.useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await testConnection();
      setDbStatus(isConnected ? 'connected' : 'error');
    };
    checkConnection();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Documentation', path: '/', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight group-hover:text-emerald-600 transition-colors">{settings.appName}</span>
                <span className="hidden sm:inline text-2xl font-light text-gray-400">Documentation</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {/* Database Status Indicator */}
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                {dbStatus === 'checking' ? (
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
                ) : dbStatus === 'connected' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  {dbStatus === 'checking' ? 'Connecting...' : dbStatus === 'connected' ? 'Database Connected' : 'Connection Error'}
                </span>
              </div>

              {profile && (
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-100">
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900">{profile.displayName}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{profile.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center space-x-2 border border-gray-100"
              >
                <span className="text-sm font-bold uppercase tracking-wider">Menu</span>
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-50 md:hidden shadow-2xl flex flex-col"
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-gray-900">{settings.appName}</span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto">
                  <div className="p-4 space-y-6">
                    {/* Main Nav */}
                    <div className="space-y-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all ${
                            location.pathname === item.path
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-50" />
                        </Link>
                      ))}
                    </div>

                    <div className="h-px bg-gray-100 mx-2" />

                    {/* Tutorial Navigation */}
                    <div>
                      <h3 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tutorials</h3>
                      <SidebarContent onItemClick={() => setIsMenuOpen(false)} />
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  {profile && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs uppercase">
                          {profile.displayName[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{profile.displayName}</p>
                          <p className="text-[10px] text-gray-400 uppercase">{profile.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      <div className="flex flex-grow max-w-[1600px] mx-auto w-full">
        <Sidebar />
        <main className="flex-grow p-4 sm:p-8 md:p-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
