import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

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
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'client' });
  const [editingUser, setEditingUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setNotification({ type: 'error', message: 'Aucun token d’authentification trouvé. Veuillez vous reconnecter.' });
      return;
    }
    fetchUsers();
  }, []);

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

    if (!newUser.name || !newUser.email || !newUser.password) {
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
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setNotification({ type: 'error', message: data.detail || 'Erreur lors de la création de l’utilisateur.' });
        return;
      }

      setNewUser({ name: '', email: '', password: '', role: 'client' });
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
    if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      setLoading(true);
      try {
        const response = await makeAuthenticatedRequest(`http://localhost:8000/api/users/${id}/`, {
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
      }
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
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {notification && (
        <div
          className={`p-4 rounded-lg text-sm font-medium shadow-lg transform transition-all duration-300 ease-in-out animate-slide ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
          }`}
        >
          {notification.message}
        </div>
      )}

      {isLoading && (
        <div className="text-center text-gray-600 dark:text-gray-300 flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span>Chargement...</span>
        </div>
      )}

      <div className="flex items-center space-x-3">
        <Users size={28} className="text-blue-600 dark:text-blue-400" />
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
          Gestion des utilisateurs
        </h1>
      </div>

      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Rechercher par email ou nom..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-all duration-300"
        />
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400" />
      </div>

      <form
        onSubmit={handleCreateUser}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-800"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Créer un nouvel utilisateur
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              placeholder="Nom complet"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rôle
            </label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors duration-300"
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors duration-300"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span className={newUser.password.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                {newUser.password.length >= 6 ? <CheckCircle size={14} className="inline mr-1" /> : <AlertCircle size={14} className="inline mr-1" />}
                Au moins 6 caractères
              </span>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-400 transition-colors duration-200 shadow-md disabled:bg-gray-600 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Créer un utilisateur
        </button>
      </form>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                Date de création
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user.id}
                className={`${
                  index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
              >
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{user.email}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{user.first_name || '-'}</td>
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                      Client
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                  {new Date(user.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-400 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-300 dark:focus:ring-red-400 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Modifier l'utilisateur
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateUser(editingUser.id);
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={editingUser.first_name || ''}
                onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rôle
              </label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors duration-300"
              >
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-400 transition-colors duration-200 shadow-md disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-400 transition-colors duration-200 shadow-md disabled:bg-gray-600 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;