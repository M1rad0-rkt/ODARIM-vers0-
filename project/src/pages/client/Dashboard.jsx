import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { getUserRequests } from '../../api/requests';
import { PlusCircle, AlertCircle, Eye, Grid, Table, Circle, ChevronRight } from 'lucide-react';
import RequestCard from '../../components/RequestCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' ou 'list'
  const requestsPerPage = 9; // 3x3 grille pour la vue cartes

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await getUserRequests(user.id);
        console.log('Données des demandes:', data); // Pour déboguer
        if (!Array.isArray(data)) {
          console.error('Les données reçues ne sont pas un tableau:', data);
          setError('Format de données invalide.');
          setRequests([]);
        } else {
          setRequests(data);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des demandes:', err);
        setError('Impossible de charger vos demandes.');
        setRequests([]);
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
    const inProgressCount = requests.filter(r => r.status === 'en_cours').length;
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
      inProgress: {
        count: inProgressCount,
        percent: total > 0 ? Math.round((inProgressCount / total) * 100) : 0
      },
      rejected: {
        count: rejectedCount,
        percent: total > 0 ? Math.round((rejectedCount / total) * 100) : 0
      },
      total
    };
  }, [requests]);

  // Pagination
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(requests.length / requestsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { accepted, pending, inProgress, rejected, total } = stats;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-in">
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
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">En cours</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{inProgress.percent}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{inProgress.count} demande(s)</p>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 animate-slide-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Vos demandes</h3>
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'cards'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Vue cartes"
                aria-label="Vue cartes"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Vue liste"
                aria-label="Vue liste"
              >
                <Table size={20} />
              </button>
            </div>
          </div>

          {/* Desktop : Cartes ou Liste */}
          <div className="hidden md:block">
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="space-y-3 p-4">
                  {currentRequests.map((request) => (
                    <Link
                      key={request.id}
                      to={`/client/details-demandes/${request.id}`}
                      className="block bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      aria-label={`Voir détails de la demande ${request.title || request.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-sm">
                            {request.title || 'Sans titre'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                request.status === 'resolue'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                                  : request.status === 'en_attente'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                                  : request.status === 'en_cours'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                  : request.status === 'rejetee'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200'
                              }`}
                            >
                              <Circle
                                size={8}
                                className={`${
                                  request.status === 'resolue'
                                    ? 'text-green-500'
                                    : request.status === 'en_attente'
                                    ? 'text-yellow-500'
                                    : request.status === 'en_cours'
                                    ? 'text-blue-500'
                                    : request.status === 'rejetee'
                                    ? 'text-red-500'
                                    : 'text-gray-500'
                                }`}
                              />
                              {request.status === 'resolue'
                                ? 'Résolue'
                                : request.status === 'en_attente'
                                ? 'En attente'
                                : request.status === 'en_cours'
                                ? 'En cours'
                                : request.status === 'rejetee'
                                ? 'Rejetée'
                                : 'Inconnu'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {request.created_at
                                ? new Date(request.created_at).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'N/A'}
                            </span>
                            {request.category && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {request.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/client/details-demandes/${request.id}`}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Voir détails"
                            aria-label={`Voir détails de la demande ${request.title || request.id}`}
                          >
                            <Eye size={16} />
                          </Link>
                          <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile : Liste compacte */}
          <div className="md:hidden space-y-3">
            {currentRequests.map((request) => (
              <Link
                key={request.id}
                to={`/client/details-demandes/${request.id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                aria-label={`Voir détails de la demande ${request.title || request.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {request.title || 'Sans titre'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          request.status === 'resolue'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                            : request.status === 'en_attente'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                            : request.status === 'en_cours'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : request.status === 'rejetee'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                      >
                        <Circle
                          size={8}
                          className={`${
                            request.status === 'resolue'
                              ? 'text-green-500'
                              : request.status === 'en_attente'
                              ? 'text-yellow-500'
                              : request.status === 'en_cours'
                              ? 'text-blue-500'
                              : request.status === 'rejetee'
                              ? 'text-red-500'
                              : 'text-gray-500'
                          }`}
                        />
                        {request.status === 'resolue'
                          ? 'Résolue'
                          : request.status === 'en_attente'
                          ? 'En attente'
                          : request.status === 'en_cours'
                          ? 'En cours'
                          : request.status === 'rejetee'
                          ? 'Rejetée'
                          : 'Inconnu'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {request.created_at
                          ? new Date(request.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center items-center gap-2">
              <button
                type="button"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;