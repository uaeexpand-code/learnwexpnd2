import React, { useEffect, useState } from 'react';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TutorialList from './TutorialList';

export default function HomeRedirect() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tutorialsRef = collection(db, 'tutorials');
    let q = query(tutorialsRef, limit(1));

    if (!isAdmin) {
      q = query(tutorialsRef, where('published', '==', true), limit(1));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const firstId = snapshot.docs[0].id;
        navigate(`/tutorial/${firstId}`, { replace: true });
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return <TutorialList />;
}
