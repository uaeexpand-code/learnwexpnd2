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
  'Introduction': Zap,
  'Products': Package,
  'Orders': ShoppingCart,
  'Pages & Content': FileText,
  'Settings': Settings,
  'Help and Support': HelpCircle,
};

export default function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const { isAdmin } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  useEffect(() => {
    const tutorialsRef = collection(db, 'tutorials');
    let q = query(tutorialsRef);

    if (!isAdmin) {
      q = query(tutorialsRef, where('published', '==', true));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Tutorial[];
        
        // Sort in memory to avoid composite index requirements
        const sortedData = [...data].sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateA - dateB;
        });
        
        setTutorials(sortedData);
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
      {/* Home Link */}
      <section>
        <ul className="space-y-1">
          <li>
            <Link 
              to="/" 
              onClick={onItemClick}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-bold transition-all",
                location.pathname === '/' 
                  ? "bg-emerald-50 text-emerald-600 shadow-sm" 
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <LayoutIcon className="w-5 h-5" />
              <span>Overview</span>
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
                      "flex items-center justify-between py-1.5 text-sm transition-colors group/item",
                      location.pathname === `/tutorial/${item.id}` 
                        ? "text-emerald-600 font-medium" 
                        : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    <span className="truncate">{item.title}</span>
                    {isAdmin && !item.published && (
                      <span className="ml-2 px-1.5 py-0.5 bg-yellow-50 text-yellow-600 text-[8px] font-bold uppercase tracking-tighter rounded border border-yellow-100 flex-shrink-0">
                        Draft
                      </span>
                    )}
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
    </div>
  );
}
