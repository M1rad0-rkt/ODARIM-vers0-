import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getStats } from '../../api/requests';
import { 
  MessageSquare, CheckCircle, Clock, Loader2, ArrowUpRight, 
  AlertTriangle, Star
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const Dashboard = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Appliquer la classe .dark au <html> en fonction de darkMode
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        console.log('Stats data:', data); // Debug: inspecter les données
        if (!data || !data.statusCounts) {
          throw new Error('Données incomplètes reçues');
        }
        setStats(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des statistiques:', err);
        let errorMessage = 'Impossible de charger les statistiques';
        if (err.message.includes('401')) {
          errorMessage = 'Veuillez vous reconnecter';
        } else if (err.message.includes('403')) {
          errorMessage = 'Accès non autorisé';
        } else if (err.message.includes('404')) {
          errorMessage = 'Service indisponible';
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Couleurs adaptées au mode sombre
  const statusData = stats ? [
    { name: 'En attente', count: stats.statusCounts.en_attente || 0, color: darkMode ? 'rgb(var(--color-warning))' : '#f59e0b' },
    { name: 'Résolues', count: stats.statusCounts.resolue || 0, color: darkMode ? 'rgb(var(--color-success))' : '#22c55e' },
    { name: 'Rejetées', count: stats.statusCounts.rejetee || 0, color: darkMode ? 'rgb(var(--color-error))' : '#ef4444' },
  ] : [];

  // Debug: vérifier avgRating et rejetee
  console.log('Average Rating:', stats?.avgRating);
  console.log('Rejected Requests:', stats?.statusCounts?.rejetee);

  // Calculer le pourcentage pour la progression circulaire
  const ratingPercentage = stats?.avgRating ? (stats.avgRating / 5) * 100 : 0;
  const strokeDasharray = `${ratingPercentage} ${100 - ratingPercentage}`;
  const strokeColor = stats?.avgRating >= 3.5 ? 'rgb(var(--color-success))' : 'rgb(var(--color-warning))';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 size={20} className="animate-spin mr-2 text-text" />
        <div className="text-text">Chargement du tableau de bord...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="p-4 rounded-md bg-error/10 text-error border border-error/20">
          <AlertTriangle size={18} className="mr-2 inline" />
          <span>{error}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-6 animate-slide-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text mb-2 tracking-tight">
          Tableau de bord administrateur
        </h1>
        <p className="text-sm text-text/60">
          Bienvenue, {user?.name || 'Utilisateur'}. Voici un aperçu de l'activité du système.
        </p>
      </div>
      
      {/* Fallback UI if stats is null */}
      {!stats ? (
        <div className="p-4 rounded-md bg-warning/10 text-warning border border-warning/20">
          <AlertTriangle size={18} className="mr-2 inline" />
          <span>Aucune donnée disponible pour le moment.</span>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card hover:scale-105">
              <div className="flex items-center">
                <div className="mr-3 p-2 rounded-full bg-primary/10 text-primary">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-text/60">Total demandes</p>
                  <h3 className="text-xl font-bold text-text">{stats.total || 0}</h3>
                </div>
              </div>
            </div>
            
            <div className="card hover:scale-105">
              <div className="flex items-center">
                <div className="mr-3 p-2 rounded-full bg-primary/10 text-primary">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-text/60">Demandes en cours</p>
                  <h3 className="text-xl font-bold text-text">{stats.statusCounts.en_attente || 0}</h3>
                </div>
              </div>
            </div>
            
            <div className="card hover:scale-105">
              <div className="flex items-center">
                <div className="mr-3 p-2 rounded-full bg-success/10 text-success">
                  <CheckCircle size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-text/60">Demandes résolues</p>
                  <h3 className="text-xl font-bold text-text">{stats.statusCounts.resolue || 0}</h3>
                </div>
              </div>
            </div>
            
            <div className="card hover:scale-105">
              <div className="flex items-center">
                <div className="mr-3 p-2 rounded-full bg-error/10 text-error">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-text/60">Demandes rejetées</p>
                  <h3 className="text-xl font-bold text-text">{stats.statusCounts.rejetee || 0}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Satisfaction moyenne */}
          <div className="card mb-6">
            <h2 className="text-base font-semibold text-text mb-4">Satisfaction moyenne</h2>
            {stats.avgRating ? (
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="rgb(var(--color-text)/0.1)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="4"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset="25"
                      transform="rotate(-90 18 18)"
                      className="transition-all duration-500 ease-in-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base font-semibold text-text">
                      {stats.avgRating.toFixed(1)}/5
                    </span>
                  </div>
                </div>
                <p className="text-sm text-text/60">
                  Évaluation moyenne des demandes résolues
                </p>
              </div>
            ) : (
              <p className="text-sm text-text/60">Aucune donnée de satisfaction disponible</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Stats par statut (Bar Chart) */}
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-text">Vue d'ensemble des demandes</h2>
              </div>
              
              <div className="h-64">
                {statusData.length === 0 ? (
                  <p className="text-sm text-text/60 text-center">Aucune donnée de statut disponible</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid stroke="rgb(var(--color-border))" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fill: 'rgb(var(--color-text))' }} />
                      <YAxis tick={{ fill: 'rgb(var(--color-text))' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgb(var(--color-background))', 
                          border: '1px solid rgb(var(--color-border))',
                          color: 'rgb(var(--color-text))'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="count" name="Nombre de demandes">
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-text mb-2">Autres indicateurs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card">
                    <p className="text-xs text-text/60">Temps moyen de résolution</p>
                    <h4 className="text-lg font-semibold text-text mt-1">
                      {stats.avgResolutionTime ? `${stats.avgResolutionTime.toFixed(1)} jours` : 'N/A'}
                    </h4>
                  </div>
                  <div className="card">
                    <p className="text-xs font-medium text-text/60">Taux de résolution</p>
                    <h4 className="text-lg font-semibold text-text mt-1">
                      {stats.total > 0
                        ? `${Math.round((stats.statusCounts.resolue / stats.total) * 100)}%`
                        : '0%'}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dernières demandes */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-text">Demandes récentes</h2>
                <Link to="/admin/demandes" className="text-sm text-primary flex items-center hover:text-primary-dark transition-colors duration-200">
                  Voir toutes
                  <ArrowUpRight size={14} className="ml-1" />
                </Link>
              </div>
              
              <div className="space-y-3">
                {stats.recentRequests?.length === 0 ? (
                  <p className="text-sm text-text/60">Aucune demande disponible</p>
                ) : (
                  stats.recentRequests?.map((request) => (
                    <Link 
                      key={request.id} 
                      to={`/admin/demandes/${request.id}`}
                      className="block p-3 rounded-md hover:bg-card-muted transition-colors duration-200"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-sm text-text line-clamp-1">{request.title}</h3>
                        <StatusBadge status={request.status} />
                      </div>
                      <div className="flex justify-between items-center text-xs text-text/60">
                        <span>{formatDate(request.created_at)}</span>
                        <span>{request.category}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;