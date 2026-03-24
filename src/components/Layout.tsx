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

  const navItems: any[] = [];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-16 flex items-center">
        <div className="max-w-[1600px] mx-auto px-6 w-full flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-[#27ae60] rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                <span className="text-white font-black text-lg">E</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 tracking-tight leading-none font-display">{settings.appName}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Documentation</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            {/* Database Status Indicator - Admin Only */}
            {isAdmin && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                {dbStatus === 'checking' ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" />
                ) : dbStatus === 'connected' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                  {dbStatus === 'checking' ? 'Connecting...' : dbStatus === 'connected' ? 'Connected' : 'Error'}
                </span>
              </div>
            )}

            {profile && (
              <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
                <div className="hidden xs:flex flex-col items-end">
                  <p className="text-xs font-bold text-gray-900 leading-none">{profile.displayName}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">{profile.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
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
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-50 md:hidden shadow-2xl flex flex-col"
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
                  <SidebarContent onItemClick={() => setIsMenuOpen(false)} />
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
