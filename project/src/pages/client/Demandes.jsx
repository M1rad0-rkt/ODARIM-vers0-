import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserRequests } from '../../api/requests';
import StatusBadge from '../../components/StatusBadge';
import { PlusCircle, Search, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, X, ListFilter, Archive } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import debounce from 'lodash/debounce';

ChartJS.register(ArcElement, Tooltip, Legend);

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
};

const Demandes = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Handle query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      setSuccess('Demande créée ou évaluée avec succès');
    }
    if (params.get('refresh') === 'true') {
      fetchRequests();
    }
  }, [location]);

  // Clear success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch requests
  const fetchRequests = async () => {
    try {
      if (user) {
        setLoading(true);
        const data = await getUserRequests();
        console.log('Raw Requests:', data);
        console.log('Feedback Structures:', data.map(r => ({ id: r.id, feedback: r.feedback })));
        setRequests(data);
        setFilteredRequests(data);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des demandes:', err);
      setError('Impossible de charger vos demandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  // Debounced filter
  const debouncedFilter = useCallback(
    debounce((term, status, category, reqs, showArchived) => {
      let result = [...reqs];
      result = result.filter((request) =>
        showArchived ? request.feedback : !request.feedback
      );
      if (status !== 'all') {
        result = result.filter((request) => request.status === status);
      }
      if (category !== 'all') {
        result = result.filter((request) => request.category === category);
      }
      if (term) {
        const lower = term.toLowerCase().trim();
        result = result.filter(
          (request) =>
            (request.title || '').toLowerCase().includes(lower) ||
            (request.description || '').toLowerCase().includes(lower)
        );
      }
      console.log('Filtered Requests:', result);
      console.log('Filter Conditions:', { term, status, category, showArchived });
      setFilteredRequests(result);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFilter(searchTerm, statusFilter, categoryFilter, requests, showArchived);
  }, [searchTerm, statusFilter, categoryFilter, requests, showArchived, debouncedFilter]);

  const getUniqueCategories = () => {
    const categories = requests.map((req) => req.category).filter(Boolean);
    return ['all', ...new Set(categories)];
  };

  const satisfactionData = [
    {
      name: 'Satisfaits',
      value: requests.filter((r) => r.feedback && r.feedback.rating >= 3).length,
    },
    {
      name: 'Non satisfaits',
      value: requests.filter((r) => r.feedback && r.feedback.rating > 0 && r.feedback.rating < 3).length,
    },
  ];

  console.log('Satisfaction Data:', satisfactionData);

  const chartData = {
    labels: ['Satisfaits', 'Non satisfaits'],
    datasets: [
      {
        data: [satisfactionData[0].value, satisfactionData[1].value],
        backgroundColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
        hoverBackgroundColor: ['rgb(22, 163, 74)', 'rgb(220, 38, 38)'],
        borderColor: ['rgb(229, 231, 235)'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 14 },
          color: 'rgb(17, 24, 39)',
        },
      },
      tooltip: {
        backgroundColor: 'rgb(255, 255, 255)',
        titleColor: 'rgb(17, 24, 39)',
        bodyColor: 'rgb(17, 24, 39)',
        borderColor: 'rgb(229, 231, 235)',
        borderWidth: 1,
      },
    },
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const toggleArchived = () => {
    setShowArchived(!showArchived);
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {showArchived ? 'Mes Anciennes Demandes' : 'Mes Demandes'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {showArchived ? 'Consultez vos demandes archivées' : 'Gérez vos demandes en cours et consultez leur statut'}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={toggleArchived}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Archive size={18} className="mr-2" />
              {showArchived ? 'Voir mes demandes actives' : 'Voir mes anciennes demandes'}
            </button>
            {!showArchived && (
              <Link
                to="/client/nouvelle-demande"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 dark:bg-green-700 text-white text-sm font-medium hover:bg-green-700 dark:hover:bg-green-800 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <PlusCircle size={18} className="mr-2" />
                Nouvelle Demande
              </Link>
            )}
          </div>
        </div>

        {/* Success Notification */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 dark:bg-green-900/80 text-green-700 dark:text-green-200 border border-green-300 dark:border-green-700 flex items-center animate-slide-in">
            <CheckCircle2 size={20} className="mr-3 flex-shrink-0" />
            <span className="text-sm font-medium">{success}</span>
            <button
              onClick={() => setSuccess('')}
              className="ml-auto text-green-700 dark:text-green-200 hover:text-green-900 dark:hover:text-green-100"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-200 border border-red-300 dark:border-red-700 flex items-center animate-slide-in">
            <AlertTriangle size={20} className="mr-3 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-700 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 mb-6 animate-slide-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Rechercher une demande..."
                className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors duration-200 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  aria-label="Effacer la recherche"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            <button
              className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <ListFilter size={18} className="mr-2" />
              Filtres
              {isFilterOpen ? <ChevronUp size={18} className="ml-2" /> : <ChevronDown size={18} className="ml-2" />}
            </button>
          </div>
          {isFilterOpen && (
            <div className="mt-4 flex flex-col sm:flex-row gap-4 animate-slide-in">
              <div className="relative w-full sm:w-60">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors duration-200 text-sm"
                >
                  <option value="all">Tous Statuts</option>
                  <option value="en_attente">En attente</option>
                  <option value="en_cours">En cours</option>
                  <option value="resolue">Résolue</option>
                  <option value="rejetee">Rejetée</option>
                </select>
                <ListFilter size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
              </div>
              <div className="w-full sm:w-60">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors duration-200 text-sm"
                >
                  <option value="all">Toutes Catégories</option>
                  {getUniqueCategories()
                    .filter((cat) => cat !== 'all')
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Satisfaction Chart */}
        {showArchived && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 mb-6 animate-slide-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Analyse de Satisfaction</h2>
            {satisfactionData.reduce((sum, d) => sum + d.value, 0) === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Aucune évaluation enregistrée pour vos demandes
              </p>
            ) : (
              <div className="h-64">
                <Pie data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
        )}

        {/* Requests Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 animate-slide-in overflow-x-auto">
          {filteredRequests.length === 0 ? (
            <div className="p-6 text-center">
              {requests.filter((req) => (showArchived ? req.feedback : !req.feedback)).length === 0 ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {showArchived
                      ? 'Vous n\'avez aucune demande archivée.'
                      : 'Vous n\'avez aucune demande enregistrée.'}
                  </p>
                  {!showArchived && (
                    <Link
                      to="/client/nouvelle-demande"
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 dark:bg-green-700 text-white text-sm font-medium hover:bg-green-700 dark:hover:bg-green-800 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Créer une demande
                    </Link>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Aucune demande correspondante trouvée.
                </p>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Titre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Catégorie</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Créée</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{request.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{request.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{request.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{formatDate(request.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        to={`/client/details-demandes/${request.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-semibold"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Demandes;