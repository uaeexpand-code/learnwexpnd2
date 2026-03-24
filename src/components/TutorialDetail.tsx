import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Tutorial } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Clock, Info, ChevronUp, Monitor, Smartphone, CheckCircle2, ArrowRight, ExternalLink, Link as LinkIcon, Menu, X, ChevronRight, Edit2 } from 'lucide-react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { getGoogleDriveEmbedUrl, cn } from '../utils';
import ReactMarkdown from 'react-markdown';

const markdownComponents = {
  a: (props: any) => (
    <a
      {...props}
      className="text-[#3498db] font-bold hover:text-[#2980b9] underline underline-offset-4 decoration-[#3498db]/30 hover:decoration-[#3498db] transition-all inline-flex items-center gap-1"
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children}
      <ExternalLink className="w-3 h-3 opacity-50" />
    </a>
  ),
  strong: (props: any) => (
    <strong className="font-bold text-gray-900" {...props} />
  ),
  p: (props: any) => (
    <p className="mb-4 last:mb-0" {...props} />
  )
};

export default function TutorialDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [nextTutorial, setNextTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [platform, setPlatform] = useState<'desktop' | 'mobile'>('desktop');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      
      // Update active step based on scroll position
      const sections = document.querySelectorAll('section[id^="step-"]');
      let currentActive = 0;
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150) {
          currentActive = index;
        }
      });
      setActiveStep(currentActive);
    };
    const checkPlatform = () => {
      setPlatform(window.innerWidth < 768 ? 'mobile' : 'desktop');
    };
    
    checkPlatform();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkPlatform);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkPlatform);
    };
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

  const CTAButton = ({ text, link }: { text?: string; link?: string }) => {
    if (!link) return null;
    return (
      <div className="my-6">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 group no-underline"
        >
          <LinkIcon className="w-4 h-4" />
          {text || 'Open Link'}
          <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    );
  };

  const renderContent = (content: string, step: any) => {
    if (!content) return null;
    
    // First, replace any {{link:text|url}} with markdown [text](url)
    const processedContent = content.replace(/\{\{link:([^|]+)\|([^}]+)\}\}/g, '[$1]($2)');

    if (!processedContent.includes('{{cta}}')) {
      return (
        <div className="prose prose-sm max-w-none prose-emerald">
          <ReactMarkdown components={markdownComponents}>{processedContent}</ReactMarkdown>
        </div>
      );
    }

    const parts = processedContent.split('{{cta}}');
    return (
      <div className="space-y-4">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part.trim() && (
              <div className="prose prose-sm max-w-none prose-emerald">
                <ReactMarkdown components={markdownComponents}>{part.trim()}</ReactMarkdown>
              </div>
            )}
            {i < parts.length - 1 && <CTAButton text={step.cta_text} link={step.cta_link} />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!tutorial) return null;

  const currentSteps = platform === 'desktop' 
    ? (tutorial.steps_desktop?.length > 0 && tutorial.steps_desktop[0].content ? tutorial.steps_desktop : (tutorial as any).steps || []) 
    : (tutorial.steps_mobile?.length > 0 && tutorial.steps_mobile[0].content ? tutorial.steps_mobile : (tutorial.steps_desktop || (tutorial as any).steps || []));

  return (
    <div className="max-w-5xl mx-auto pb-20 px-6 sm:px-12">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 z-[100] origin-left"
        style={{ scaleX }}
      />

      {/* Draft Banner */}
      {isAdmin && !tutorial.published && (
        <div className="mb-8 bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-between">
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
      <header className="mb-16 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
            <span>{tutorial.category}</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-400">Guide</span>
          </div>
          {isAdmin && (
            <Link
              to={`/ex-admin/edit/${tutorial.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 uppercase tracking-wider"
            >
              <Edit2 className="w-4 h-4" />
              Edit Tutorial
            </Link>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight font-display">{tutorial.title}</h1>
        <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{tutorial.description}</p>
        
        {tutorial.cta_link && tutorial.cta_text && (
          <div className="pt-4">
            <a
              href={tutorial.cta_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-[#27ae60] text-white font-bold rounded-lg hover:bg-[#219150] transition-all shadow-lg shadow-emerald-100 group"
            >
              {tutorial.cta_text}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        )}
      </header>

      {/* Steps */}
      <div className="space-y-12 sm:space-y-16">
        {currentSteps.map((step, index) => {
          const driveEmbedUrl = step.drive_url ? getGoogleDriveEmbedUrl(step.drive_url) : null;
          
          return (
            <motion.section 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={cn(
                "scroll-mt-32 space-y-6 pb-10 sm:pb-12",
                index !== currentSteps.length - 1 && "border-b border-gray-200"
              )}
              id={`step-${index + 1}`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                    {index + 1}
                  </span>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight leading-tight font-display">
                    {step.title}
                  </h2>
                </div>
                
                {step.content && (
                  <div className="text-gray-700 leading-relaxed">
                    {renderContent(step.content, step)}
                  </div>
                )}

                {step.cta_link && !step.content?.includes('{{cta}}') && (
                  <div className="mt-6">
                    <CTAButton text={step.cta_text} link={step.cta_link} />
                  </div>
                )}

                {step.tip && (
                  <div className="bg-[#f8fafd] border-l-4 border-[#3498db] p-8 rounded-r-lg mt-12 mb-8">
                    <div className="flex items-center gap-2 mb-3 text-[#3498db]">
                      <Info className="w-5 h-5" />
                      <span className="text-sm font-bold uppercase tracking-wider">Note</span>
                    </div>
                    <div className="text-[#2c3e50] leading-relaxed prose prose-sm max-w-none prose-info">
                      <ReactMarkdown components={markdownComponents}>{step.tip}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              {/* Media Display */}
              {(driveEmbedUrl || step.image_url) && (
                <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm mt-8">
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

              {/* Section Divider */}
              {index < currentSteps.length - 1 && (
                <div className="pt-24 sm:pt-32">
                  <div className="h-px bg-gray-100 w-full" />
                </div>
              )}
            </motion.section>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <footer className="mt-32 pt-16 border-t border-gray-100 space-y-12">
        {nextTutorial && (
          <Link
            to={`/tutorial/${nextTutorial.id}`}
            className="group block p-8 bg-gray-50 border border-gray-100 rounded-2xl relative overflow-hidden transition-all hover:bg-emerald-50 hover:border-emerald-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">Up Next</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{nextTutorial.title}</h3>
                <p className="text-gray-500 text-sm max-w-md line-clamp-1">{nextTutorial.description}</p>
              </div>
              <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center group-hover:bg-[#27ae60] group-hover:border-[#27ae60] transition-all">
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </div>
            </div>
          </Link>
        )}

        <div className="flex items-center justify-between pt-8 pb-12">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Documentation Hub
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors">Support</a>
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors">Contact</a>
          </div>
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
            className="fixed bottom-8 right-8 p-4 bg-gray-900 text-white rounded-xl shadow-2xl z-50 hover:bg-[#27ae60] transition-all active:scale-95"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
