import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Tutorial, Category } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  BookOpen, 
  Package, 
  ShoppingCart, 
  FileText, 
  Settings, 
  HelpCircle,
  Zap,
  Layout as LayoutIcon,
  MousePointer2
} from 'lucide-react';
import { cn } from '../utils';

const categoryIcons: Record<string, any> = {
  'Products': Package,
  'Orders': ShoppingCart,
  'Pages & Content': FileText,
  'Settings': Settings,
};

export default function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const { isAdmin } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  useEffect(() => {
    const tutorialsRef = collection(db, 'tutorials');
    let q = query(tutorialsRef, orderBy('createdAt', 'asc'));

    if (!isAdmin) {
      q = query(tutorialsRef, where('published', '==', true), orderBy('createdAt', 'asc'));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Tutorial[];
        setTutorials(data);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tutorials');
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  const groupedTutorials = tutorials.reduce((acc, tutorial) => {
    if (!acc[tutorial.category]) {
      acc[tutorial.category] = [];
    }
    acc[tutorial.category].push(tutorial);
    return acc;
  }, {} as Record<string, Tutorial[]>);

  const categories = settings.categories;

  return (
    <div className="p-4 space-y-8">
      {/* Introduction Section */}
      <section>
        <div className="flex items-center space-x-2 text-emerald-600 mb-4 px-2">
          <Zap className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wider">Introduction</span>
        </div>
        <ul className="space-y-1 ml-9">
          <li>
            <Link 
              to="/" 
              onClick={onItemClick}
              className={cn(
                "block py-1.5 text-sm transition-colors",
                location.pathname === '/' ? "text-emerald-600 font-medium" : "text-gray-500 hover:text-gray-900"
              )}
            >
              Welcome
            </Link>
          </li>
        </ul>
      </section>

      {/* Dynamic Categories */}
      {categories.map((category) => {
        const Icon = categoryIcons[category] || BookOpen;
        const items = groupedTutorials[category] || [];
        
        if (items.length === 0 && !isAdmin) return null;

        return (
          <section key={category}>
            <div className="flex items-center space-x-2 text-gray-400 mb-4 px-2">
              <Icon className="w-5 h-5" />
              <span className="font-bold text-sm uppercase tracking-wider text-gray-600">{category}</span>
            </div>
            <ul className="space-y-1 ml-9">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/tutorial/${item.id}`}
                    onClick={onItemClick}
                    className={cn(
                      "block py-1.5 text-sm transition-colors",
                      location.pathname === `/tutorial/${item.id}` 
                        ? "text-emerald-600 font-medium" 
                        : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
              {items.length === 0 && isAdmin && (
                <li className="text-xs text-gray-400 italic py-1.5">No tutorials yet</li>
              )}
            </ul>
          </section>
        );
      })}

      {/* Support Section */}
      <section>
        <div className="flex items-center space-x-2 text-gray-400 mb-4 px-2">
          <HelpCircle className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-wider text-gray-600">Help and Support</span>
        </div>
        <ul className="space-y-1 ml-9">
          <li>
            <a 
              href="#" 
              onClick={onItemClick}
              className="block py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Contact Support
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
