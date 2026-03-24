import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Tutorial } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Clock, Info, ChevronUp, List, Monitor, Smartphone } from 'lucide-react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { getGoogleDriveEmbedUrl, cn } from '../utils';
import ReactMarkdown from 'react-markdown';

export default function TutorialDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [platform, setPlatform] = useState<'desktop' | 'mobile'>('desktop');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!id) return;

    const tutorialRef = doc(db, 'tutorials', id);
    const unsubscribe = onSnapshot(
      tutorialRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() } as Tutorial;
          if (!data.published && !isAdmin) {
            navigate('/');
            return;
          }
          setTutorial(data);
        } else {
          navigate('/');
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `tutorials/${id}`);
      }
    );

    return () => unsubscribe();
  }, [id, isAdmin, navigate]);

  const scrollToStep = (index: number) => {
    const element = document.getElementById(`step-${index + 1}`);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setShowToc(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!tutorial) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 pb-20">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-16 left-0 right-0 h-1 bg-emerald-500 z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* Draft Banner */}
      {isAdmin && !tutorial.published && (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Draft Mode</p>
              <p className="text-xs text-amber-700">This tutorial is only visible to administrators.</p>
            </div>
          </div>
          <Link
            to={`/ex-admin/edit/${tutorial.id}`}
            className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors"
          >
            Publish Now
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 sm:space-y-4">
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">{tutorial.title}</h1>
            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl">{tutorial.description}</p>
          </div>
          
          {isAdmin && (
            <Link
              to={`/ex-admin/edit/${tutorial.id}`}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-all text-sm self-start md:self-auto"
            >
              Edit Guide
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-gray-50">
          <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-widest">
            {tutorial.category}
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setPlatform('desktop')}
              className={cn(
                "flex items-center px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                platform === 'desktop' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Monitor className="w-3 h-3 mr-1.5" />
              Desktop
            </button>
            <button
              onClick={() => setPlatform('mobile')}
              className={cn(
                "flex items-center px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                platform === 'mobile' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Smartphone className="w-3 h-3 mr-1.5" />
              Mobile
            </button>
          </div>
        </div>
      </header>

      {/* Mobile TOC Button */}
      <div className="md:hidden sticky top-20 z-40">
        <button
          onClick={() => setShowToc(!showToc)}
          className="w-full bg-white/80 backdrop-blur-md border border-gray-100 p-3 rounded-xl shadow-sm flex items-center justify-between text-sm font-bold text-gray-600"
        >
          <div className="flex items-center space-x-2">
            <List className="w-4 h-4 text-emerald-600" />
            <span>Jump to Step</span>
          </div>
          <span className="text-xs text-gray-400">{tutorial.steps.length} Steps</span>
        </button>

        <AnimatePresence>
          {showToc && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 space-y-2 z-50 max-h-[60vh] overflow-y-auto"
            >
              {tutorial.steps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => scrollToStep(i)}
                  className="w-full text-left p-3 hover:bg-emerald-50 rounded-xl transition-colors flex items-center space-x-3 group"
                >
                  <span className="text-xs font-bold text-emerald-500">0{i + 1}</span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700 truncate">{step.title}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Steps as Sections */}
      <div className="space-y-12 sm:space-y-20">
        {tutorial.steps.map((step, index) => {
          const driveEmbedUrl = step.drive_url ? getGoogleDriveEmbedUrl(step.drive_url) : null;
          
          return (
            <motion.section 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-6 sm:space-y-8 scroll-mt-24"
              id={`step-${index + 1}`}
            >
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                  <span className="text-emerald-500 mr-3 sm:mr-4 font-light">0{index + 1}.</span>
                  {step.title}
                </h2>
                
                <div className="prose prose-base sm:prose-lg max-w-none text-gray-600 leading-relaxed">
                  <ReactMarkdown>
                    {platform === 'desktop' ? step.content_desktop : step.content_mobile}
                  </ReactMarkdown>
                </div>

                {step.tip && (
                  <div className="bg-emerald-50/50 border-l-4 border-emerald-500 p-4 sm:p-6 rounded-r-xl mt-4 sm:mt-6">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-emerald-600 mr-3 sm:mr-4 mt-1" />
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold text-emerald-900 uppercase tracking-widest mb-1">Pro Tip</p>
                        <p className="text-sm sm:text-base text-emerald-800 italic">{step.tip}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Media Display */}
              {(driveEmbedUrl || step.image_url) && (
                <div className="rounded-xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl shadow-emerald-100/50 border border-gray-100 bg-gray-50">
                  {driveEmbedUrl ? (
                    <div className="aspect-video relative">
                      <iframe
                        src={driveEmbedUrl}
                        className="absolute inset-0 w-full h-full border-0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title={`Video for ${step.title}`}
                      />
                    </div>
                  ) : (
                    <img
                      src={step.image_url}
                      alt={step.title}
                      className="w-full h-auto object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              )}
            </motion.section>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <footer className="pt-16 border-t border-gray-100 flex items-center justify-between">
        <Link
          to="/"
          className="text-sm font-bold text-gray-400 hover:text-emerald-600 transition-colors flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Introduction
        </Link>
        <p className="text-xs text-gray-300 font-medium uppercase tracking-widest">
          End of Guide
        </p>
      </footer>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 p-4 bg-gray-900 text-white rounded-full shadow-2xl z-50 hover:bg-emerald-600 transition-colors"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
