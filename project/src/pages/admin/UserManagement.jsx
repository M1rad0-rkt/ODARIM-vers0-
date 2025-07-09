import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, EyeOff, AlertCircle, CheckCircle, X, Edit2, Trash2 } from 'lucide-react';

async function makeAuthenticatedRequest(url, options = {}) {
  let accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    throw new Error('Aucun token d’authentification trouvé.');
  }

  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  let response = await fetch(url, options);

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('Aucun token de rafraîchissement disponible.');
    }

    try {
      const refreshResponse = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Échec du rafraîchissement du token.');
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access;
      localStorage.setItem('access_token', accessToken);

      options.headers.Authorization = `Bearer ${accessToken}`;
      response = await fetch(url, options);
    } catch (refreshError) {
      console.error('Erreur lors du rafraîchissement du token:', refreshError);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      throw refreshError;
    }
  }

  return response;
}

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newUser, setNewUser] = useState({ first_name: '', email: '', password: '', role: 'client' });
  const [editingUser, setEditingUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const usersPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setNotification({ type: 'error', message: 'Aucun token d’authentification trouvé. Veuillez vous reconnecter.' });
      return;
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest('http://localhost:8000/api/users/', {
        method: 'GET',
      });
      const data = await response.json();
      console.log('Users API response:', data);
      setUsers(data);
      setFilteredUsers(data);
      setNotification(null);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      setNotification({ type: 'error', message: 'Erreur lors de la récupération des utilisateurs.' });
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = () => {
    return newUser.password.length >= 6;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setNotification(null);

    if (!newUser.first_name || !newUser.email || !newUser.password) {
      setNotification({ type: 'error', message: 'Veuillez remplir tous les champs.' });
      return;
    }

    if (!validatePassword()) {
      setNotification({ type: 'error', message: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          name: newUser.first_name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
        }),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        setNotification({ type: 'error', message: data.detail || JSON.stringify(data) || 'Erreur lors de la création de l’utilisateur.' });
        return;
      }

      setNewUser({ first_name: '', email: '', password: '', role: 'client' });
      fetchUsers();
      setNotification({ type: 'success', message: 'Utilisateur créé avec succès !' });
    } catch (error) {
      console.error('Erreur lors de la création de l’utilisateur:', error);
      setNotification({ type: 'error', message: 'Erreur de communication avec le serveur.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (id) => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest(`http://localhost:8000/api/users/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({
          first_name: editingUser.first_name,
          email: editingUser.email,
          role: editingUser.role,
          username: editingUser.email,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erreur lors de la mise à jour.');
      }
      setEditingUser(null);
      fetchUsers();
      setNotification({ type: 'success', message: 'Utilisateur mis à jour avec succès !' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l’utilisateur:', error);
      setNotification({ type: 'error', message: error.message || 'Erreur lors de la mise à jour de l’utilisateur.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    setUserToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest(`http://localhost:8000/api/users/${userToDelete}/`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erreur lors de la suppression.');
      }
      fetchUsers();
      setNotification({ type: 'success', message: 'Utilisateur supprimé avec succès !' });
    } catch (error) {
      console.error('Erreur lors de la suppression de l’utilisateur:', error);
      setNotification({ type: 'error', message: error.message || 'Erreur lors de la suppression de l’utilisateur.' });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredUsers(
      users.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          (user?.first_name && user.first_name.toLowerCase().includes(query))
      )
    );
    setCurrentPage(1);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Notification */}
        {notification && (
          <div
            className={`flex items-center p-4 rounded-xl text-sm font-medium shadow-lg transform transition-all duration-300 ease-in-out animate-slide ${
              notification.type === 'success'
                ? 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-800 dark:to-green-900 text-green-800 dark:text-green-100 border border-green-300 dark:border-green-700'
                : 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-800 dark:to-red-900 text-red-800 dark:text-red-100 border border-red-300 dark:border-red-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle size={20} className="mr-3 flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-current hover:text-green-900 dark:hover:text-green-50"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Chargement...</span>
          </div>
        )}

        {/* Delete Confirmation Popup */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Confirmer la suppression
                </h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 rounded-md bg-red-600 dark:bg-red-700 text-white text-sm font-medium hover:bg-red-700 dark:hover:bg-red-800 transition-all duration-300"
                  disabled={isLoading}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center space-x-3">
          <Users size={24} className="text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Gestion des utilisateurs
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Rechercher par email ou nom..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 pl-10 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm placeholder:font-light group-hover:shadow-md"
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Create User Form */}
        <form
          onSubmit={handleCreateUser}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Créer un nouvel utilisateur
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                placeholder="Nom complet"
                value={newUser.first_name}
                onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm group-hover:shadow-md focus:shadow-lg placeholder:font-light"
                required
              />
            </div>
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm group-hover:shadow-md focus:shadow-lg placeholder:font-light"
                required
              />
            </div>
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Rôle
              </label>
              <div className="relative">
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm group-hover:shadow-md focus:shadow-lg appearance-none cursor-pointer"
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm group-hover:shadow-md focus:shadow-lg placeholder:font-light"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <span className={newUser.password.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                  {newUser.password.length >= 6 ? <CheckCircle size={14} className="inline mr-1" /> : <AlertCircle size={14} className="inline mr-1" />}
                  Au moins 6 caractères
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Créer un utilisateur
            </button>
            <button
              type="button"
              onClick={() => setNewUser({ first_name: '', email: '', password: '', role: 'client' })}
              className="inline-flex items-center px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              Réinitialiser
            </button>
          </div>
        </form>

        {/* Users List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Liste des utilisateurs</h3>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentUsers.map((user) => (
                  <tr 
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {user.first_name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          disabled={isLoading}
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                          disabled={isLoading}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {currentUsers.map((user) => (
              <div
                key={user.id}
                className="py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <div className="flex-1 px-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {user.first_name || 'N/A'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 px-2">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={isLoading}
                    title="Modifier"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    disabled={isLoading}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </div>

        {/* Edit User Form */}
        {editingUser && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Modifier l'utilisateur
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser(editingUser.id);
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={editingUser.first_name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm group-hover:shadow-md focus:shadow-lg placeholder:font-light"
                  required
                />
              </div>
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm group-hover:shadow-md focus:shadow-lg placeholder:font-light"
                  required
                />
              </div>
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Rôle
                </label>
                <div className="relative">
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm group-hover:shadow-md focus:shadow-lg appearance-none cursor-pointer"
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;