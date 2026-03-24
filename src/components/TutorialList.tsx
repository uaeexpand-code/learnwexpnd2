import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { motion } from 'motion/react';
import { Info, BookOpen, Zap, ShieldCheck, LifeBuoy, ChevronRight, Plus, Clock, ArrowRight, Edit2 } from 'lucide-react';
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
      <section className="py-12 sm:py-20 border-b border-gray-100">
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
            <Zap className="w-3 h-3" />
            <span>Knowledge Base</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-tight font-display">
            Master your store with <span className="text-[#27ae60]">{settings.appName}</span>
          </h1>
          
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            Everything you need to know about managing your products, orders, and content. 
            Step-by-step guides designed to help you grow your business.
          </p>
        </div>
      </section>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Tutorials */}
        <section className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight font-display">Recently Added</h2>
            <div className="h-px flex-grow mx-6 bg-gray-100 hidden sm:block" />
          </div>

          <div className="grid gap-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />
              ))
            ) : recentTutorials.length > 0 ? (
              recentTutorials.map((tutorial) => (
                <Link 
                  key={tutorial.id} 
                  to={`/tutorial/${tutorial.id}`}
                  className="group flex items-center p-5 bg-white border border-gray-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-all"
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-white transition-colors mr-4 border border-gray-100">
                    <Clock className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{tutorial.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">{tutorial.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {isAdmin && (
                      <Link
                        to={`/ex-admin/edit/${tutorial.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No tutorials found yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Info Card */}
        <section className="space-y-8">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight font-display">Need Help?</h2>
          <div className="bg-gray-900 rounded-2xl p-8 text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
            <LifeBuoy className="w-10 h-10 text-emerald-400" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Support Center</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Can't find what you're looking for? Our support team is here to help you with any questions.
              </p>
            </div>
            <button className="w-full py-3 bg-[#27ae60] text-white font-bold rounded-lg hover:bg-[#219150] transition-all flex items-center justify-center group shadow-lg shadow-emerald-900/20">
              Contact Support
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      </div>

      {/* Categories Section */}
      <section className="space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight font-display">Browse by Category</h2>
          <div className="h-px flex-grow mx-6 bg-gray-100 hidden sm:block" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {settings.categories.map((category) => (
            <Link 
              key={category} 
              to={`/?category=${encodeURIComponent(category)}`}
              className="group p-8 bg-white border border-gray-100 rounded-2xl hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/20 transition-all flex flex-col items-start text-left"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#27ae60] transition-all duration-300">
                <BookOpen className="w-6 h-6 text-[#27ae60] group-hover:text-white" />
              </div>
              
              <div className="flex-grow space-y-2">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{category}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Master everything about {category.toLowerCase()} with our detailed guides.</p>
              </div>

              <div className="mt-8 flex items-center justify-between w-full">
                <div className="flex items-center text-emerald-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                  Explore
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
