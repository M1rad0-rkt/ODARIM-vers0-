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
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('active');
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [newClientDetected, setNewClientDetected] = useState(null);
  const requestsPerPage = 6;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getAllRequests();
        setRequests(data);
        setFilteredRequests(data.filter((req) => !req.is_updated && !['resolue', 'rejetee'].includes(req.status)));
      } catch (err) {
        console.error('Erreur lors de la récupération des demandes:', err);
        setError('Impossible de charger les demandes. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    const updateClients = () => {
      let filteredData = [...requests];
      const lowerSearch = searchTerm.toLowerCase();

      if (searchTerm) {
        filteredData = filteredData.filter(
          (req) =>
            (req.first_name?.toLowerCase().includes(lowerSearch) || req.user_name?.toLowerCase().includes(lowerSearch))
        );
      }

      const uniqueClients = [...new Set(filteredData.map(req => req.first_name || req.user_name || 'N/A'))]
        .map(name => ({
          name,
          requests: filteredData.filter(req => (req.first_name || req.user_name || 'N/A') === name),
          isNew: !filteredData.filter(req => (req.first_name || req.user_name || 'N/A') === name).some(
            req => req.is_updated || ['resolue', 'rejetee'].includes(req.status)
          ),
        }))
        .filter(client => {
          if (viewMode === 'active') {
            return client.requests.some(req => !req.is_updated && !['resolue', 'rejetee'].includes(req.status));
          }
          return client.requests.some(req => req.is_updated || ['resolue', 'rejetee'].includes(req.status));
        });

      // Détecter un nouveau client
      const newClients = uniqueClients.filter(client => client.isNew);
      if (newClients.length > 0 && viewMode === 'active') {
        setNewClientDetected(newClients[0].name);
        setTimeout(() => setNewClientDetected(null), 3000); // Notification temporaire
      }

      setClients(uniqueClients);

      if (selectedClient && !uniqueClients.some(client => client.name === selectedClient)) {
        setSelectedClient(null);
        setCurrentPage(0);
      }
    };

    updateClients();
  }, [viewMode, requests, searchTerm, selectedClient]);

  useEffect(() => {
    let result = [...requests];

    if (selectedClient) {
      result = result.filter(req => (req.first_name || req.user_name || 'N/A') === selectedClient);
    }

    if (viewMode === 'active') {
      result = result.filter((req) => !req.is_updated && !['resolue', 'rejetee'].includes(req.status));
    } else {
      result = result.filter((req) => req.is_updated || ['resolue', 'rejetee'].includes(req.status));
    }

    if (statusFilter !== 'all') {
      result = result.filter((req) => req.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter((req) => req.category === categoryFilter);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (req) =>
          req.title?.toLowerCase().includes(lowerSearch) ||
          req.description?.toLowerCase().includes(lowerSearch) ||
          req.first_name?.toLowerCase().includes(lowerSearch) ||
          req.user_name?.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredRequests(result);
    setCurrentPage(0); // Réinitialiser la pagination lors du filtrage
  }, [requests, searchTerm, statusFilter, categoryFilter, viewMode, selectedClient]);

  const getUniqueCategories = () => {
    const categories = requests.map((req) => req.category).filter(Boolean);
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

  const handleClientSelect = (name) => {
    setSelectedClient(name);
    setCurrentPage(0);
  };

  const handleBackToClients = () => {
    setSelectedClient(null);
    setCurrentPage(0);
  };

  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);
  const startIndex = currentPage * requestsPerPage;
  const visibleRequests = filteredRequests.slice(startIndex, startIndex + requestsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-pulse text-gray-600 dark:text-gray-300 text-sm">Chargement des demandes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Notification Toast for New Client */}
        {newClientDetected && viewMode === 'active' && (
          <div className="fixed top-4 right-4 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
            Nouveau client détecté : {newClientDetected}
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Gestion des Demandes Clients
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organisez et suivez les demandes de vos clients avec facilité
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center text-sm">
            <AlertTriangle size={14} className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3">
            {/* View Mode Toggle */}
            <div className="flex justify-between items-center">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                <button
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    viewMode === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setViewMode('active')}
                >
                  Demandes Actives
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    viewMode === 'old'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setViewMode('old')}
                >
                  Demandes Archivées
                </button>
              </div>
              <Filter size={16} className="text-gray-500 dark:text-gray-400" />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un client ou une demande..."
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les Statuts</option>
                <option value="en_attente">En attente</option>
                <option value="en_cours">En cours</option>
                <option value="resolue">Résolue</option>
                <option value="rejetee">Rejetée</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Toutes les Catégories</option>
                {getUniqueCategories()
                  .filter((c) => c !== 'all')
                  .map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Affichage conditionnel : Liste des clients ou demandes d'un client */}
        {selectedClient ? (
          <div>
            <button
              onClick={handleBackToClients}
              className="mb-4 flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
            >
              <ChevronLeft size={16} className="mr-1" />
              Retour à la liste des clients
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Demandes de {selectedClient}
            </h2>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Aucune demande trouvée pour ce client.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                  {visibleRequests.map((request) => {
                    const isOld = request.is_updated || ['resolue', 'rejetee'].includes(request.status);
                    return (
                      <div
                        key={request.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                              {request.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              {isOld && (
                                <Lock size={12} className="text-gray-400 dark:text-gray-500" title="Demande non modifiable" />
                              )}
                              <button
                                onClick={() => handleViewRequest(request.id, isOld)}
                                className={`p-1 rounded-full ${
                                  isOld
                                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                }`}
                                title={isOld ? 'Demande non modifiable' : 'Voir les détails'}
                                disabled={isOld}
                              >
                                <Eye size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                            <p>ID: {request.id}</p>
                            <p>Client: {request.first_name || request.user_name || 'N/A'}</p>
                            <p>Date: {formatDate(request.created_at)}</p>
                          </div>
                          <div className="mt-2">
                            <StatusBadge status={request.status} />
                          </div>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700">
                          <button
                            className="w-full flex justify-between items-center px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => toggleRequest(request.id)}
                          >
                            <span>Détails</span>
                            {expandedRequest === request.id ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </button>
                          {expandedRequest === request.id && (
                            <div className="px-4 pb-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
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
                  <div className="flex justify-center items-center gap-3 mt-6">
                    <button
                      onClick={() => setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1))}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={totalPages <= 1}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage + 1} sur {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1))}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={totalPages <= 1}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Liste des Clients
            </h2>
            {clients.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Aucun client trouvé pour ce filtre.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                {clients.map((client) => (
                  <div
                    key={client.name}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 p-4 cursor-pointer ${
                      client.isNew && viewMode === 'active' ? 'animate-pulse border-blue-500 dark:border-blue-400' : ''
                    }`}
                    onClick={() => handleClientSelect(client.name)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                      {client.isNew && viewMode === 'active' && (
                        <span className="text-xs bg-blue-600 dark:bg-blue-500 text-white px-2 py-1 rounded-full">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {client.requests.length} demande{client.requests.length > 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Demandes;