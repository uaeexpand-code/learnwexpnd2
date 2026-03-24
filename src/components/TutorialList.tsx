import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { motion } from 'motion/react';
import { Info, BookOpen, Zap, ShieldCheck, LifeBuoy, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TutorialList() {
  const { profile } = useAuth();
  const { settings } = useSettings();

  return (
    <div className="max-w-4xl space-y-12">
      <section className="space-y-6">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Welcome to {settings.appName}</h1>
        
        <p className="text-lg text-gray-600 leading-relaxed">
          Your central hub for all documentation and guides. Select a category from the sidebar to explore detailed tutorials and best practices for managing your store.
        </p>

        <div className="bg-emerald-50/50 border-l-4 border-emerald-500 p-6 rounded-r-xl">
          <div className="flex items-start">
            <Info className="w-6 h-6 text-emerald-600 mr-4 mt-1" />
            <div>
              <p className="text-sm font-bold text-emerald-900 uppercase tracking-widest mb-1">Quick Tip</p>
              <p className="text-emerald-800">
                You can find specific guides for products, orders, and content management in the sidebar. Each guide includes step-by-step instructions and visual aids.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8 pt-8 border-t border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900">Explore Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings.categories.map((category) => (
            <div key={category} className="group p-6 bg-white border border-gray-100 rounded-2xl hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{category}</h3>
              <p className="text-sm text-gray-500">Explore all tutorials and guides related to {category.toLowerCase()}.</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
