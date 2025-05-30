import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { getUserRequests } from '../../api/requests';
import { PlusCircle, AlertCircle } from 'lucide-react';
import RequestCard from '../../components/RequestCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) {
        setzenLoading(false);
        return;
      }
      try {
        const data = await getUserRequests(user.id);
        setRequests(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des demandes:', err);
        setError('Impossible de charger vos demandes.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const stats = useMemo(() => {
    const total = requests.length;
    const acceptedCount = requests.filter(r => r.status === 'resolue').length;
    const pendingCount = requests.filter(r => r.status === 'en_attente').length;
    const rejectedCount = requests.filter(r => r.status === 'rejetee').length;

    return {
      accepted: {
        count: acceptedCount,
        percent: total > 0 ? Math.round((acceptedCount / total) * 100) : 0
      },
      pending: {
        count: pendingCount,
        percent: total > 0 ? Math.round((pendingCount / total) * 100) : 0
      },
      rejected: {
        count: rejectedCount,
        percent: total > 0 ? Math.round((rejectedCount / total) * 100) : 0
      },
      total
    };
  }, [requests]);

  const { accepted, pending, rejected, total } = stats;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 animate-pulse text-gray-600 dark:text-gray-300" aria-busy="true">
        Chargement des demandes...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-300 mt-12 text-sm">
        Veuillez vous connecter pour voir vos demandes.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-6 space-y-6 animate-slide-in">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between animate-slide-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vous avez <strong>{total}</strong> demande(s) enregistrée(s)
          </p>
        </div>
        <Link
          to="/client/nouvelle-demande"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg font-medium text-sm hover:bg-green-700 dark:hover:bg-green-800 transition-transform duration-200 hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Créer une nouvelle demande"
          title="Créer une nouvelle demande"
        >
          <PlusCircle size={16} className="mr-2" />
          Nouvelle demande
        </Link>
      </div>

      {/* Statistiques des demandes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-in">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600 transition-transform duration-300 hover:scale-105">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">Acceptées</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{accepted.percent}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{accepted.count} demande(s)</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600 transition-transform duration-300 hover:scale-105">
          <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">En attente</p>
          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{pending.percent}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{pending.count} demande(s)</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600 transition-transform duration-300 hover:scale-105">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Rejetées</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{rejected.percent}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{rejected.count} demande(s)</p>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-700 flex items-start transition-opacity duration-300 animate-slide-in">
          <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Liste des demandes */}
      {requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-600 shadow-md hover:shadow-lg transition-transform duration-300 animate-slide-in">
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
            Aucune demande trouvée. Cliquez sur <strong>"Nouvelle demande"</strong> pour commencer.
          </p>
          <Link
            to="/client/nouvelle-demande"
            className="inline-flex items-center px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg font-medium text-sm hover:bg-green-700 dark:hover:bg-green-800 transition-transform duration-200 hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Créer une demande
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-in">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;