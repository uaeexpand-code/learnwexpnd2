import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AppSettings } from '../types';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  loading: boolean;
}

const defaultSettings: AppSettings = {
  appName: 'WooGuides',
  categories: ['Products', 'Orders', 'Pages & Content', 'Settings'],
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'app');
    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setSettings(snapshot.data() as AppSettings);
        } else if (isAdmin) {
          // Initialize settings only if admin
          setDoc(settingsRef, defaultSettings).catch(err => {
            console.error('Failed to initialize settings:', err);
          });
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/app');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const settingsRef = doc(db, 'settings', 'app');
      await setDoc(settingsRef, { ...settings, ...newSettings });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/app');
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
