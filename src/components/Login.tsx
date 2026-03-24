import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { BookOpen, LogIn, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const { login } = useAuth();
  const { settings } = useSettings();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setIsLoggingIn(true);
    try {
      await login();
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase. Please add "learn.expand-ae.com" to your Firebase Authorized Domains.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login popup was closed before completion.');
      } else {
        setError(err.message || 'An unexpected error occurred during login.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-2xl mb-8 shadow-lg shadow-emerald-100">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">{settings.appName}</h1>
        <p className="text-gray-500 mb-10 text-lg">
          The ultimate documentation platform for WordPress and WooCommerce store owners.
        </p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start text-left"
            >
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 leading-relaxed">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 hover:border-emerald-200 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mr-3"></div>
          ) : (
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="w-6 h-6 mr-3"
              referrerPolicy="no-referrer"
            />
          )}
          {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
          {!isLoggingIn && <LogIn className="w-5 h-5 ml-3 text-gray-300 group-hover:text-emerald-600 transition-colors" />}
        </button>

        <p className="mt-8 text-xs text-gray-400">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </motion.div>
    </div>
  );
}
