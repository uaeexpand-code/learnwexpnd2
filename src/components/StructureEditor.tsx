import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Tutorial } from '../types';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Edit2, 
  Check, 
  X, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Folder,
  Eye,
  EyeOff,
  ExternalLink
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { cn } from '../utils';
import { Link, useNavigate } from 'react-router-dom';

export default function StructureEditor() {
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [categories, setCategories] = useState<string[]>(settings.categories);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [editingCategory, setEditingCategory] = useState<{ index: number; value: string } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCategories(settings.categories);
  }, [settings.categories]);

  useEffect(() => {
    const tutorialsRef = collection(db, 'tutorials');
    const unsubscribe = onSnapshot(
      query(tutorialsRef),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Tutorial[];
        
        // Sort by order
        const sortedData = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
        setTutorials(sortedData);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tutorials');
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      const updated = [...categories, newCategoryName.trim()];
      setCategories(updated);
      updateSettings({ categories: updated });
      setNewCategoryName('');
    }
  };

  const handleRemoveCategory = async (category: string) => {
    const categoryTutorials = tutorials.filter(t => t.category === category);
    if (categoryTutorials.length > 0) {
      alert(`Cannot delete category "${category}" because it contains tutorials. Please move or delete them first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the category "${category}"?`)) {
      const updated = categories.filter(c => c !== category);
      setCategories(updated);
      await updateSettings({ categories: updated });
    }
  };

  const handleRenameCategory = async () => {
    if (editingCategory && editingCategory.value.trim()) {
      const oldName = categories[editingCategory.index];
      const newName = editingCategory.value.trim();

      if (oldName === newName) {
        setEditingCategory(null);
        return;
      }

      const updated = [...categories];
      updated[editingCategory.index] = newName;
      setCategories(updated);

      // Update all tutorials in this category
      const batch = writeBatch(db);
      tutorials.forEach(t => {
        if (t.category === oldName) {
          batch.update(doc(db, 'tutorials', t.id!), { category: newName });
        }
      });

      await batch.commit();
      await updateSettings({ categories: updated });
      setEditingCategory(null);
    }
  };

  const handleReorderCategories = (newOrder: string[]) => {
    setCategories(newOrder);
    updateSettings({ categories: newOrder });
  };

  const handleReorderTutorials = async (category: string, reorderedTutorials: Tutorial[]) => {
    // Update local state first for smooth UI
    const otherTutorials = tutorials.filter(t => t.category !== category);
    const updatedTutorials = [...otherTutorials, ...reorderedTutorials.map((t, i) => ({ ...t, order: i }))];
    setTutorials(updatedTutorials.sort((a, b) => (a.order || 0) - (b.order || 0)));

    // Save to Firestore
    const batch = writeBatch(db);
    reorderedTutorials.forEach((t, index) => {
      batch.update(doc(db, 'tutorials', t.id!), { order: index });
    });
    await batch.commit();
  };

  const handleDeleteTutorial = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tutorial?')) {
      await deleteDoc(doc(db, 'tutorials', id));
    }
  };

  const togglePublished = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'tutorials', id), { published: !current });
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Structure Editor</h1>
          <p className="text-gray-500">Manage your documentation hierarchy and content.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name..."
              className="pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm w-64"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button 
              onClick={handleAddCategory}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Reorder.Group axis="y" values={categories} onReorder={handleReorderCategories} className="divide-y divide-gray-50">
          {categories.map((category, index) => {
            const categoryTutorials = tutorials.filter(t => t.category === category);
            const isExpanded = expandedCategories[category] ?? true;

            return (
              <Reorder.Item key={category} value={category} className="bg-white">
                <div className="group flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center flex-grow">
                    <GripVertical className="w-4 h-4 text-gray-300 mr-3 cursor-grab active:cursor-grabbing" />
                    <button 
                      onClick={() => toggleCategory(category)}
                      className="p-1 hover:bg-gray-100 rounded-lg mr-2 transition-colors text-gray-400"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    
                    {editingCategory?.index === index ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={editingCategory.value}
                          onChange={(e) => setEditingCategory({ ...editingCategory, value: e.target.value })}
                          className="px-2 py-1 border border-emerald-500 rounded-lg text-sm font-bold outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameCategory();
                            if (e.key === 'Escape') setEditingCategory(null);
                          }}
                        />
                        <button onClick={handleRenameCategory} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingCategory(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold text-gray-900">{category}</span>
                        <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                          {categoryTutorials.length}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingCategory({ index, value: category })}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      title="Rename Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <Link 
                      to={`/ex-admin/new?category=${encodeURIComponent(category)}`}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      title="Add Tutorial to Category"
                    >
                      <Plus className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleRemoveCategory(category)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-gray-50/30"
                    >
                      <Reorder.Group 
                        axis="y" 
                        values={categoryTutorials} 
                        onReorder={(newTutorials) => handleReorderTutorials(category, newTutorials)}
                        className="pl-12 pr-4 pb-4 space-y-1"
                      >
                        {categoryTutorials.map((tutorial) => (
                          <Reorder.Item 
                            key={tutorial.id} 
                            value={tutorial}
                            className="group/item flex items-center justify-between p-2 bg-white border border-gray-100 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center flex-grow">
                              <GripVertical className="w-3 h-3 text-gray-300 mr-3 cursor-grab active:cursor-grabbing" />
                              <FileText className="w-3.5 h-3.5 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-700">{tutorial.title}</span>
                              {!tutorial.published && (
                                <span className="ml-2 px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded border border-amber-100">
                                  Draft
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <button 
                                onClick={() => togglePublished(tutorial.id!, tutorial.published)}
                                className={cn(
                                  "p-1.5 rounded-lg transition-colors",
                                  tutorial.published ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100"
                                )}
                                title={tutorial.published ? "Unpublish" : "Publish"}
                              >
                                {tutorial.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>
                              <Link 
                                to={`/ex-admin/edit/${tutorial.id}`}
                                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Edit Tutorial"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Link>
                              <Link 
                                to={`/tutorial/${tutorial.id}`}
                                target="_blank"
                                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="View Tutorial"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              <button 
                                onClick={() => handleDeleteTutorial(tutorial.id!)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Tutorial"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </Reorder.Item>
                        ))}
                        {categoryTutorials.length === 0 && (
                          <div className="text-center py-4 border border-dashed border-gray-200 rounded-xl">
                            <p className="text-xs text-gray-400 italic">No tutorials in this category.</p>
                            <Link 
                              to={`/ex-admin/new?category=${encodeURIComponent(category)}`}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-1 inline-block"
                            >
                              + Create First Tutorial
                            </Link>
                          </div>
                        )}
                      </Reorder.Group>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>
    </div>
  );
}
