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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      setSuccess('Demande créée ou évaluée avec succès');
    }
    if (params.get('refresh') === 'true') {
      fetchRequests();
    }
  }, [location]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

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

  const debouncedFilter = useCallback(
    debounce((term, status, category, reqs, showArchived) => {
      let result = [...reqs];
      result = result.filter((request) =>
        showArchived ? 
          (request.feedback || request.status === 'rejetee') : 
          (!request.feedback && request.status !== 'rejetee')
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
    {
      name: 'Rejetées',
      value: requests.filter((r) => r.status === 'rejetee').length,
    },
  ];

  console.log('Satisfaction Data:', satisfactionData);

  const chartData = {
    labels: ['Satisfaits', 'Non satisfaits', 'Rejetées'],
    datasets: [
      {
        data: [satisfactionData[0].value, satisfactionData[1].value, satisfactionData[2].value],
        backgroundColor: ['rgb(34, 197, 94)', 'rgb(239, 68, 68)', 'rgb(107, 114, 128)'],
        hoverBackgroundColor: ['rgb(22, 163, 74)', 'rgb(220, 38, 38)', 'rgb(75, 85, 99)'],
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
              {showArchived ? 'Consultez vos demandes archivées et rejetées' : 'Gérez vos demandes en cours et consultez leur statut'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={toggleArchived}
              className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <Archive size={16} className="mr-2" />
              {showArchived ? 'Demandes Actives' : 'Anciennes Demandes'}
            </button>
            {!showArchived && (
              <Link
                to="/client/nouvelle-demande"
                className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white text-sm font-medium hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                <PlusCircle size={16} className="mr-2" />
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-6 animate-slide-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400 dark:text-gray-500 group-focus-within:text-green-500 dark:group-focus-within:text-green-400 transition-colors duration-200" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une demande..."
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-300 text-sm shadow-sm hover:shadow-md placeholder:font-light"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  aria-label="Effacer la recherche"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <ListFilter size={16} className="mr-2" />
              Filtres
              {isFilterOpen ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}
            </button>
          </div>
          {isFilterOpen && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-slide-in">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ListFilter size={16} className="text-gray-400 dark:text-gray-500 group-focus-within:text-green-500 dark:group-focus-within:text-green-400 transition-colors duration-200" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-300 text-sm shadow-sm hover:shadow-md appearance-none cursor-pointer"
                >
                  <option value="all">Tous Statuts</option>
                  <option value="en_attente">En attente</option>
                  <option value="en_cours">En cours</option>
                  <option value="resolue">Résolue</option>
                  <option value="rejetee">Rejetée</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              <div className="relative group">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-300 text-sm shadow-sm hover:shadow-md appearance-none cursor-pointer"
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
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Satisfaction Chart */}
        {showArchived && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 mb-6 animate-slide-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Analyse des Demandes Archivées</h2>
            {satisfactionData.reduce((sum, d) => sum + d.value, 0) === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Aucune demande archivée ou rejetée enregistrée
              </p>
            ) : (
              <div className="h-64">
                <Pie data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
        )}

        {/* Requests Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 animate-slide-in overflow-x-auto max-h-[400px] overflow-y-auto">
          {filteredRequests.length === 0 ? (
            <div className="p-6 text-center">
              {requests.filter((req) => (showArchived ? (req.feedback || req.status === 'rejetee') : (!req.feedback && req.status !== 'rejetee'))).length === 0 ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {showArchived
                      ? 'Vous n\'avez aucune demande archivée ou rejetée.'
                      : 'Vous n\'avez aucune demande active enregistrée.'}
                  </p>
                  {!showArchived && (
                    <Link
                      to="/client/nouvelle-demande"
                      className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white text-sm font-medium hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
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