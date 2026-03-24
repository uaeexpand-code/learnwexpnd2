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
  MousePointer2,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  Signpost,
  LifeBuoy,
  Wrench,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

const categoryIcons: Record<string, any> = {
  'Introduction': Signpost,
  'Products': Package,
  'Orders': ShoppingCart,
  'Pages & Content': FileText,
  'Settings': Settings,
  'Help and Support': LifeBuoy,
  'Installation': Wrench,
  'Theme Options': Palette,
};

export default function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const { isAdmin } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

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

        // Initialize all categories as expanded by default
        const initialExpanded: Record<string, boolean> = {};
        settings.categories.forEach(cat => {
          initialExpanded[cat] = true;
        });
        setExpandedCategories(initialExpanded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tutorials');
      }
    );

    return () => unsubscribe();
  }, [isAdmin, settings.categories]);

  const filteredTutorials = tutorials.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTutorials = filteredTutorials.reduce((acc, tutorial) => {
    if (!acc[tutorial.category]) {
      acc[tutorial.category] = [];
    }
    acc[tutorial.category].push(tutorial);
    return acc;
  }, {} as Record<string, Tutorial[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const categories = settings.categories;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search Bar */}
      <div className="p-6 pb-2 sticky top-0 bg-white z-10">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search the docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-8">
        {/* Dynamic Categories */}
        {categories.map((category) => {
          const Icon = categoryIcons[category] || BookOpen;
          const items = groupedTutorials[category] || [];
          const isExpanded = expandedCategories[category];
          
          if (items.length === 0 && !isAdmin && !searchQuery) return null;

          return (
            <section key={category} className="space-y-1">
              <div className="flex items-center justify-between group/header px-2">
                <button 
                  onClick={() => toggleCategory(category)}
                  className="flex items-center space-x-2.5 flex-grow text-left py-2"
                >
                  <Icon className={cn(
                    "w-4 h-4 transition-colors",
                    isExpanded ? "text-emerald-500" : "text-gray-400"
                  )} />
                  <span className={cn(
                    "font-bold text-[13px] tracking-tight transition-colors font-display",
                    isExpanded ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                  )}>
                    {category}
                  </span>
                </button>
                
                <div className="flex items-center space-x-1">
                  {isAdmin && (
                    <Link
                      to={`/ex-admin/new?category=${encodeURIComponent(category)}`}
                      className="p-1 text-gray-300 hover:text-emerald-600 rounded transition-all"
                      title={`Add tutorial to ${category}`}
                    >
                      <Plus className="w-3 h-3" />
                    </Link>
                  )}
                  <button 
                    onClick={() => toggleCategory(category)}
                    className="p-1 text-gray-300 hover:text-gray-600 transition-all"
                  >
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", !isExpanded && "-rotate-90")} />
                  </button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.ul 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-0.5 ml-6.5"
                  >
                    {items.map((item) => {
                      const isActive = location.pathname === `/tutorial/${item.id}`;
                      return (
                        <li key={item.id}>
                          <Link
                            to={`/tutorial/${item.id}`}
                            onClick={onItemClick}
                            className={cn(
                              "flex items-center justify-between px-3 py-1.5 text-[13px] rounded-lg transition-all group/item",
                              isActive 
                                ? "bg-emerald-50 text-emerald-700 font-bold" 
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )}
                          >
                            <span className="truncate">{item.title}</span>
                            <div className="flex items-center space-x-2">
                              {isAdmin && !item.published && (
                                <span className="px-1 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-bold uppercase tracking-tighter rounded border border-amber-100 flex-shrink-0">
                                  Draft
                                </span>
                              )}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                    {items.length === 0 && isAdmin && (
                      <li className="px-3 py-1.5 text-[11px] text-gray-400 italic">
                        No tutorials yet
                      </li>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </div>
  );
}
