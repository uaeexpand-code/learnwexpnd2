import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Tutorial } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Clock, Info, ChevronUp, Monitor, Smartphone, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { getGoogleDriveEmbedUrl, cn } from '../utils';
import ReactMarkdown from 'react-markdown';

export default function TutorialDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [nextTutorial, setNextTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
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
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() } as Tutorial;
          if (!data.published && !isAdmin) {
            navigate('/');
            return;
          }
          setTutorial(data);

          // Fetch next tutorial in same category
          try {
            const tutorialsRef = collection(db, 'tutorials');
            const q = query(
              tutorialsRef,
              where('category', '==', data.category),
              where('published', '==', true),
              orderBy('createdAt', 'asc')
            );
            const nextSnapshot = await getDocs(q);
            const allTutorials = nextSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Tutorial));
            const currentIndex = allTutorials.findIndex(t => t.id === data.id);
            if (currentIndex !== -1 && currentIndex < allTutorials.length - 1) {
              setNextTutorial(allTutorials[currentIndex + 1]);
            } else {
              setNextTutorial(null);
            }
          } catch (err) {
            console.error('Error fetching next tutorial:', err);
          }
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
      <header className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-widest"
            >
              {tutorial.category}
            </motion.div>
            <h1 className="text-3xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight sm:leading-[1.1]">{tutorial.title}</h1>
            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-3xl">{tutorial.description}</p>
          </div>
          
          {isAdmin && (
            <Link
              to={`/ex-admin/edit/${tutorial.id}`}
              className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all text-sm text-center shadow-lg shadow-gray-200"
            >
              Edit Guide
            </Link>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-8 border-t border-gray-100 gap-6">
          <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-400 font-medium">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{tutorial.steps.length} Steps</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
              <span>Verified Guide</span>
            </div>
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setPlatform('desktop')}
              className={cn(
                "flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                platform === 'desktop' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Monitor className="w-3.5 h-3.5 sm:w-4 h-4 mr-1.5 sm:mr-2" />
              Desktop
            </button>
            <button
              onClick={() => setPlatform('mobile')}
              className={cn(
                "flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                platform === 'mobile' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Smartphone className="w-3.5 h-3.5 sm:w-4 h-4 mr-1.5 sm:mr-2" />
              Mobile
            </button>
          </div>
        </div>
      </header>

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
              className="space-y-4 sm:space-y-8 scroll-mt-24"
              id={`step-${index + 1}`}
            >
              <div className="space-y-2 sm:space-y-4">
                <h2 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center">
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
      <footer className="pt-16 space-y-12">
        {nextTutorial && (
          <Link
            to={`/tutorial/${nextTutorial.id}`}
            className="group block p-8 bg-gray-900 rounded-[2.5rem] text-white relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-colors" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Next Tutorial</p>
                <h3 className="text-2xl sm:text-3xl font-bold group-hover:text-emerald-400 transition-colors">{nextTutorial.title}</h3>
                <p className="text-gray-400 text-sm max-w-md line-clamp-1">{nextTutorial.description}</p>
              </div>
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-all">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        )}

        <div className="flex items-center justify-between border-t border-gray-100 pt-8">
          <Link
            to="/"
            className="text-sm font-bold text-gray-400 hover:text-emerald-600 transition-colors flex items-center group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Overview
          </Link>
          <p className="text-xs text-gray-300 font-bold uppercase tracking-[0.2em]">
            Documentation Hub
          </p>
        </div>
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
