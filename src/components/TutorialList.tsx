import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Info, BookOpen, Zap, ShieldCheck, LifeBuoy } from 'lucide-react';

export default function TutorialList() {
  const { profile } = useAuth();

  return (
    <div className="max-w-4xl space-y-12">
      <section className="space-y-6">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Introduction</h1>
        
        <p className="text-lg text-gray-600 leading-relaxed">
          Thank you for choosing WooGuides for your store management. We are delighted to have you as one of our valued customers, and we are committed to ensuring your satisfaction with our products and services.
        </p>

        <div className="bg-emerald-50/50 border-l-4 border-emerald-500 p-6 rounded-r-xl">
          <div className="flex items-start">
            <Info className="w-6 h-6 text-emerald-600 mr-4 mt-1" />
            <div>
              <p className="text-sm font-bold text-emerald-900 uppercase tracking-widest mb-1">Quick Note</p>
              <p className="text-emerald-800">
                This documentation is designed to help you navigate your WordPress dashboard and WooCommerce settings efficiently. Use the sidebar on the left to find specific guides.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8 pt-8 border-t border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900">What's Included</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Quick Setup</h3>
            <p className="text-gray-600">Learn how to configure your store settings and get your first products live in minutes.</p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Best Practices</h3>
            <p className="text-gray-600">Follow our industry-standard guides to ensure your store is secure and optimized for performance.</p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Detailed Guides</h3>
            <p className="text-gray-600">Step-by-step instructions for every feature, from inventory management to custom page building.</p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <LifeBuoy className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Dedicated Support</h3>
            <p className="text-gray-600">Can't find what you're looking for? Our support team is always ready to help you with custom requests.</p>
          </div>
        </div>
      </section>

      <section className="pt-12">
        <div className="bg-gray-900 rounded-3xl p-10 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl font-bold">Ready to start?</h2>
            <p className="text-gray-400 max-w-md">Select a category from the sidebar to begin your journey with WooGuides.</p>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
        </div>
      </section>
    </div>
  );
}
