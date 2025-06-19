import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRequests } from '../../api/requests';
import StatusBadge from '../../components/StatusBadge';
import { Search, AlertTriangle, Filter, ChevronDown, ChevronUp, Eye, Lock, ChevronLeft, ChevronRight } from 'lucide-react';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const Demandes = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('active');
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const requestsPerPage = 6; // 3 columns x 2 rows

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getAllRequests();
        console.log('Requests data:', data);
        setRequests(data);
        setFilteredRequests(data.filter((req) => !req.is_updated && !['resolue', 'rejetee'].includes(req.status)));
      } catch (err) {
        console.error('Erreur lors de la récupération des demandes:', err);
        setError('Impossible de charger les demandes');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    let result = [...requests];
    if (viewMode === 'active') {
      result = result.filter((req) => !req.is_updated && !['resolue', 'rejetee'].includes(req.status));
    } else {
      result = result.filter((req) => req.is_updated || ['resolue', 'rejetee'].includes(req.status));
    }
    if (statusFilter !== 'all') {
      result = result.filter((request) => request.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter((request) => request.category === categoryFilter);
    }
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(lowerSearch) ||
          r.description.toLowerCase().includes(lowerSearch)
      );
    }
    setFilteredRequests(result);
  }, [requests, searchTerm, statusFilter, categoryFilter, viewMode]);

  const getUniqueCategories = () => {
    const categories = requests.map((req) => req.category);
    return ['all', ...new Set(categories)];
  };

  const handleViewRequest = (id, isUpdated) => {
    if (!isUpdated) {
      navigate(`/admin/demandes/${id}`);
    }
  };

  const toggleRequest = (id) => {
    setExpandedRequest(expandedRequest === id ? null : id);
  };

  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);
  const startIndex = currentPage * requestsPerPage;
  const visibleRequests = filteredRequests.slice(startIndex, startIndex + requestsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-pulse text-gray-600 dark:text-gray-400 text-sm">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Gestion des Demandes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Supervisez et gérez les demandes clients
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center">
            <AlertTriangle size={16} className="mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  viewMode === 'active'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => setViewMode('active')}
              >
                Actives
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  viewMode === 'old'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => setViewMode('old')}
              >
                Anciennes
              </button>
            </div>

            {/* Filters */}
            <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Rechercher par titre ou description..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tous Statuts</option>
                <option value="en_attente">En attente</option>
                <option value="en_cours">En cours</option>
                <option value="resolue">Résolue</option>
                <option value="rejetee">Rejetée</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Toutes Catégories</option>
                {getUniqueCategories()
                  .filter((c) => c !== 'all')
                  .map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Aucune demande trouvée.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleRequests.map((request) => {
                const isOld = request.is_updated || ['resolue', 'rejetee'].includes(request.status);
                return (
                  <div
                    key={request.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
                  >
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {request.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {isOld && (
                            <Lock size={14} className="text-gray-400 dark:text-gray-500" title="Demande non modifiable" />
                          )}
                          <button
                            onClick={() => handleViewRequest(request.id, isOld)}
                            className={`p-1 rounded-full ${
                              isOld
                                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                            }`}
                            title={isOld ? 'Demande non modifiable' : 'Voir les détails'}
                            disabled={isOld}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <p>ID: {request.id}</p>
                        <p>Client: {request.user_name || 'N/A'}</p>
                        <p>Date: {formatDate(request.created_at)}</p>
                      </div>

                      {/* Status */}
                      <div className="mt-3">
                        <StatusBadge status={request.status} />
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <button
                        className="w-full flex justify-between items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => toggleRequest(request.id)}
                      >
                        <span>Détails</span>
                        {expandedRequest === request.id ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                      {expandedRequest === request.id && (
                        <div className="px-4 pb-4 text-sm text-gray-700 dark:text-gray-300">
                          <p className="line-clamp-3">{request.description || 'Aucune description'}</p>
                          {request.admin_comment && (
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                              <strong>Commentaire admin :</strong> {request.admin_comment}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={handlePrevPage}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  disabled={totalPages <= 1}
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage + 1} sur {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  disabled={totalPages <= 1}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Demandes;