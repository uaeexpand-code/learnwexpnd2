import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Plus, Trash2, Save, RotateCcw, GripVertical, Edit2, Check, X } from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

export default function SettingsManager() {
  const { settings, updateSettings } = useSettings();
  const [appName, setAppName] = useState(settings.appName);
  const [categories, setCategories] = useState<string[]>(settings.categories);
  const [newCategory, setNewCategory] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAppName(settings.appName);
    setCategories(settings.categories);
  }, [settings]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingValue(categories[index]);
  };

  const saveEditing = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const newCategories = [...categories];
      newCategories[editingIndex] = editingValue.trim();
      setCategories(newCategories);
      setEditingIndex(null);
    }
  };

  const cancelEditing = () => {
    setEditingIndex(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ 
        appName, 
        categories
      });
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to update settings. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setAppName(settings.appName);
    setCategories(settings.categories);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-4">General Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Application Name</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g., WooGuides"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
            <p className="mt-2 text-xs text-gray-400">This name appears in the header and login screen.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-50 pb-4">Tutorial Categories</h2>
        
        <div className="space-y-6">
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add new category..."
              className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="space-y-2">
            <Reorder.Group axis="y" values={categories} onReorder={setCategories} className="space-y-2">
              <AnimatePresence initial={false}>
                {categories.map((category, index) => (
                  <Reorder.Item
                    key={category}
                    value={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group cursor-grab active:cursor-grabbing",
                      editingIndex === index && "ring-2 ring-emerald-500 bg-white"
                    )}
                  >
                    <div className="flex items-center flex-grow mr-4">
                      <GripVertical className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      {editingIndex === index ? (
                        <input
                          autoFocus
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditing();
                            if (e.key === 'Escape') cancelEditing();
                          }}
                          className="w-full bg-transparent outline-none text-sm font-medium text-gray-700"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-700">{category}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {editingIndex === index ? (
                        <>
                          <button
                            onClick={saveEditing}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(index)}
                            className="p-1 text-gray-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveCategory(index)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
            {categories.length === 0 && (
              <p className="text-sm text-gray-400 italic text-center py-4">No categories defined.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </button>
      </div>
    </div>
  );
}
