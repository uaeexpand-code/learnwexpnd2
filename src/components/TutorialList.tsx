import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { motion } from 'motion/react';
import { Info, BookOpen, Zap, ShieldCheck, LifeBuoy, ChevronRight, Plus, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Tutorial } from '../types';

export default function TutorialList() {
  const { isAdmin } = useAuth();
  const { settings } = useSettings();
  const [recentTutorials, setRecentTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const q = query(
          collection(db, 'tutorials'),
          where('published', '==', true),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        setRecentTutorials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tutorial)));
      } catch (err) {
        console.error('Error fetching recent tutorials:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gray-900 p-6 sm:p-16 text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-6 sm:space-y-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest"
          >
            <Zap className="w-3 h-3" />
            <span>Knowledge Base</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-6xl font-bold tracking-tight leading-tight sm:leading-[1.1]"
          >
            Master your store with <span className="text-emerald-400">{settings.appName}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 leading-relaxed"
          >
            Everything you need to know about managing your products, orders, and content. 
            Step-by-step guides designed to help you grow your business.
          </motion.p>
        </div>
      </section>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tutorials */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Recently Added</h2>
            <div className="h-px flex-grow mx-4 bg-gray-100 hidden sm:block" />
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
              ))
            ) : recentTutorials.length > 0 ? (
              recentTutorials.map((tutorial) => (
                <Link 
                  key={tutorial.id} 
                  to={`/tutorial/${tutorial.id}`}
                  className="group flex items-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50/50 transition-all"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors mr-4">
                    <Clock className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{tutorial.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">{tutorial.title}</h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 ml-4 transition-colors" />
                </Link>
              ))
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No tutorials found yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Info Card */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Need Help?</h2>
          <div className="bg-emerald-600 rounded-[2rem] p-8 text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <LifeBuoy className="w-10 h-10 text-emerald-200" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Support Center</h3>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Can't find what you're looking for? Our support team is here to help you with any questions.
              </p>
            </div>
            <button className="w-full py-3 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center group">
              Contact Support
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      </div>

      {/* Categories Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
          <div className="h-px flex-grow mx-4 bg-gray-100 hidden sm:block" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {settings.categories.map((category) => (
            <div key={category} className="group p-8 bg-white border border-gray-100 rounded-[2rem] hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all relative flex flex-col items-start text-left">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:scale-110 transition-all duration-300">
                <BookOpen className="w-7 h-7 text-emerald-600 group-hover:text-white" />
              </div>
              
              <div className="flex-grow space-y-2">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{category}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Master everything about {category.toLowerCase()} with our detailed guides.</p>
              </div>

              <div className="mt-8 flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  {isAdmin && (
                    <Link
                      to={`/ex-admin/new?category=${encodeURIComponent(category)}`}
                      className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                      title={`Add tutorial to ${category}`}
                    >
                      <Plus className="w-4 h-4" />
                    </Link>
                  )}
                </div>
                <div className="flex items-center text-emerald-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                  Explore
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
