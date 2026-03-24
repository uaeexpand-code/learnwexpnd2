import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Tutorial, Category, TutorialStep } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Plus, Trash2, ArrowLeft, Save, GripVertical, Info, Image as ImageIcon, Video } from 'lucide-react';
import { motion, Reorder } from 'motion/react';
import { cn } from '../utils';

export default function TutorialForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Tutorial>>({
    title: '',
    category: settings.categories[0] || '',
    description: '',
    published: false,
    steps: [{ title: '', content: '' }],
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      return;
    }

    if (id) {
      const fetchTutorial = async () => {
        try {
          const docRef = doc(db, 'tutorials', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFormData(docSnap.data() as Tutorial);
          } else {
            navigate('/admin');
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `tutorials/${id}`);
        } finally {
          setLoading(false);
        }
      };
      fetchTutorial();
    }
  }, [id, isAdmin, authLoading, navigate]);

  const handleStepChange = (index: number, field: keyof TutorialStep, value: string) => {
    const newSteps = [...(formData.steps || [])];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...(formData.steps || []), { title: '', content: '' }],
    });
  };

  const removeStep = (index: number) => {
    const newSteps = (formData.steps || []).filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        updatedAt: serverTimestamp(),
        createdAt: formData.createdAt || serverTimestamp(),
      };

      if (id) {
        await setDoc(doc(db, 'tutorials', id), dataToSave);
      } else {
        await addDoc(collection(db, 'tutorials'), dataToSave);
      }
      navigate('/admin');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, id ? `tutorials/${id}` : 'tutorials');
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/admin"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Edit Tutorial' : 'Create New Tutorial'}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Tutorial'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-4">General Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., How to add a new product"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A brief overview of what this tutorial covers..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Tutorial Steps</h2>
              <button
                type="button"
                onClick={addStep}
                className="inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Step
              </button>
            </div>

            <Reorder.Group
              axis="y"
              values={formData.steps || []}
              onReorder={(newSteps) => setFormData({ ...formData, steps: newSteps })}
              className="space-y-4"
            >
              {(formData.steps || []).map((step, index) => (
                <Reorder.Item
                  key={index}
                  value={step}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative group"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-2 text-gray-300 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-grow space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Step {index + 1}</span>
                        {formData.steps && formData.steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        value={step.title}
                        onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                        placeholder="Step Title"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                      />

                      <textarea
                        required
                        rows={4}
                        value={step.content}
                        onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                        placeholder="Step instructions (Markdown supported)..."
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none text-sm"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="url"
                            value={step.image_url || ''}
                            onChange={(e) => handleStepChange(index, 'image_url', e.target.value)}
                            placeholder="Image URL (optional)"
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="relative">
                          <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="url"
                            value={step.drive_url || ''}
                            onChange={(e) => handleStepChange(index, 'drive_url', e.target.value)}
                            placeholder="Google Drive Link (optional)"
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <Info className="absolute left-3 top-3 w-4 h-4 text-amber-400" />
                        <textarea
                          rows={2}
                          value={step.tip || ''}
                          onChange={(e) => handleStepChange(index, 'tip', e.target.value)}
                          placeholder="Pro Tip (optional)..."
                          className="w-full pl-10 pr-4 py-2 bg-amber-50/50 border border-amber-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500 resize-none italic"
                        />
                      </div>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            
            <button
              type="button"
              onClick={addStep}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex items-center justify-center font-bold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Step
            </button>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-4">Metadata</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {settings.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-50">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    />
                    <div className={cn(
                      "w-10 h-6 rounded-full transition-colors",
                      formData.published ? "bg-emerald-600" : "bg-gray-200"
                    )} />
                    <div className={cn(
                      "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
                      formData.published ? "translate-x-4" : "translate-x-0"
                    )} />
                  </div>
                  <span className="ml-3 text-sm font-bold text-gray-700 uppercase tracking-wider">Published Status</span>
                </label>
                <p className="mt-2 text-xs text-gray-400 italic">
                  Drafts are only visible to administrators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
