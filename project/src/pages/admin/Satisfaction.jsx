import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, AlertTriangle, Loader2 } from 'lucide-react';
import { fetchFeedbacks } from '../../api/requests';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const Satisfaction = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const data = await fetchFeedbacks();
        console.log('Données reçues :', data); // Debug log
        setFeedbacks(data);
      } catch (err) {
        console.error('Erreur chargement feedbacks :', err);
        setError(err.message || 'Impossible de charger les évaluations');
      } finally {
        setLoading(false);
      }
    };
    loadFeedbacks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 size={20} className="animate-spin mr-2 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-500 dark:text-gray-400">Chargement des évaluations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 transition-opacity duration-300">
        <AlertTriangle size={18} className="mr-2 inline" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 animate-slide-in max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8 flex items-center gap-2 tracking-tight">
        <MessageSquare size={20} className="text-blue-500 dark:text-blue-400" />
        Évaluations des clients
      </h2>

      {feedbacks.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-6 border border-gray-200 dark:border-gray-700 text-center transition-transform duration-300 hover:scale-105">
          <p className="text-sm text-gray-500 dark:text-gray-400">Aucune évaluation disponible.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="relative p-6 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            >
              {/* Quote-like decoration */}
              <div className="absolute top-4 left-4 text-blue-500 dark:text-blue-400 opacity-20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.996-2.151c2.54-.893 4.727-3.108 5.978-5.679.885-1.853.922-3.976.922-5.169v-5.001h3.079zm10.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.557-.893 4.744-3.108 5.979-5.679.884-1.853.921-3.976.921-5.169v-5.001h3.096z"/>
                </svg>
              </div>
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">{fb.request_title}</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">ID: {fb.request_id}</span>
              </div>

              <div className="flex items-center mb-4 gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={16}
                    className={index < fb.rating ? 'text-yellow-500 dark:text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
                    fill={index < fb.rating ? 'currentColor' : 'none'}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">{fb.rating}/5</span>
              </div>

              <p className="mb-4 text-sm text-gray-700 dark:text-gray-300 italic line-clamp-3">
                "{fb.comment || 'Aucun commentaire'}"
              </p>

              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Client : {fb.client_name || 'Inconnu'}</span>
                <span>Posté le : {formatDate(fb.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Satisfaction;