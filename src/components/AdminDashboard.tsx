import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Tutorial } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, EyeOff, MoreVertical, Search, Filter, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate, cn } from '../utils';
import SettingsManager from './SettingsManager';

type AdminTab = 'tutorials' | 'settings';

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('tutorials');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      return;
    }

    const tutorialsRef = collection(db, 'tutorials');
    const q = query(tutorialsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Tutorial[];
        setTutorials(data);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tutorials');
      }
    );

    return () => unsubscribe();
  }, [isAdmin, authLoading, navigate]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tutorial? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'tutorials', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `tutorials/${id}`);
      }
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'tutorials', id), {
        published: !currentStatus,
        updatedAt: new Date(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tutorials/${id}`);
    }
  };

  const filteredTutorials = tutorials.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your tutorials and documentation.</p>
        </div>
        {activeTab === 'tutorials' && (
          <Link
            to="/ex-admin/new"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Tutorial
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('tutorials')}
          className={cn(
            "flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'tutorials' 
              ? "bg-white text-emerald-600 shadow-sm" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Tutorials
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            "flex items-center px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === 'settings' 
              ? "bg-white text-emerald-600 shadow-sm" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <SettingsIcon className="w-4 h-4 mr-2" />
          App Settings
        </button>
      </div>

      {activeTab === 'tutorials' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Total: {tutorials.length}</span>
              <span>Published: {tutorials.filter(t => t.published).length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Tutorial</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence>
                  {filteredTutorials.map((tutorial) => (
                    <motion.tr
                      key={tutorial.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{tutorial.title}</p>
                            <p className="text-xs text-gray-500">{tutorial.steps.length} steps</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded uppercase tracking-wider">
                          {tutorial.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePublished(tutorial.id!, tutorial.published)}
                          className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold transition-all",
                            tutorial.published
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                          )}
                        >
                          {tutorial.published ? (
                            <><Eye className="w-3 h-3 mr-1" /> Published</>
                          ) : (
                            <><EyeOff className="w-3 h-3 mr-1" /> Draft</>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(tutorial.updatedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/tutorial/${tutorial.id}`}
                            className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/ex-admin/edit/${tutorial.id}`}
                            className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(tutorial.id!)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            
            {filteredTutorials.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-gray-500">No tutorials found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <SettingsManager />
      )}
    </div>
  );
}
