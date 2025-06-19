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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';

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
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        console.log('Stats data:', data);
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

  const statusData = stats ? [
    { name: 'En attente', count: stats.statusCounts.en_attente || 0, color: darkMode ? 'rgb(var(--color-warning))' : '#f59e0b', icon: Clock },
    { name: 'En cours', count: stats.statusCounts.en_cours || 0, color: darkMode ? 'rgb(var(--color-blue))' : '#3b82f6', icon: Clock },
    { name: 'Résolues', count: stats.statusCounts.resolue || 0, color: darkMode ? 'rgb(var(--color-success))' : '#22c55e', icon: CheckCircle },
    { name: 'Rejetées', count: stats.statusCounts.rejetee || 0, color: darkMode ? 'rgb(var(--color-error))' : '#ef4444', icon: AlertTriangle },
  ] : [];

  console.log('Average Rating:', stats?.avgRating);
  console.log('Rejected Requests:', stats?.statusCounts?.rejetee);

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
      
      {!stats ? (
        <div className="p-4 rounded-md bg-warning/10 text-warning border border-warning/20">
          <AlertTriangle size={18} className="mr-2 inline" />
          <span>Aucune donnée disponible pour le moment.</span>
        </div>
      ) : (
        <>
          {/* Barre de statistiques */}
          <div className="card mb-6 p-6 relative">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full font-medium text-sm shadow-md">
                <MessageSquare size={16} className="mr-2" />
                Total demandes : <span className="ml-1 font-bold">{stats.total || 0}</span>
              </div>
            </div>
            <div className="flex h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-inner">
              {statusData.map((item, index) => {
                const width = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                const isSmall = width < 10;
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-center transition-all duration-500 ease-out relative min-w-[50px]"
                    style={{ width: `${width}%`, backgroundColor: item.color }}
                    aria-label={`${item.name}: ${item.count} demande(s)`}
                    aria-describedby={`status-label-${index}`}
                  >
                    <div className={`flex items-center gap-1 text-white font-semibold ${isSmall ? 'text-xs' : 'text-base'} text-shadow-sm`}>
                      <Icon size={isSmall ? 14 : 16} />
                      {item.count}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-text/60">
              {statusData.map((item, index) => (
                <span
                  key={item.name}
                  id={`status-label-${index}`}
                  className={
                    item.name === 'En attente' || item.name === 'En cours' || item.name === 'Résolues'
                      ? 'font-bold'
                      : ''
                  }
                >
                  {item.name}
                </span>
              ))}
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
              
              <div className="h-80">
                {statusData.length === 0 ? (
                  <p className="text-sm text-text/60 text-center">Aucune donnée de statut disponible</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={statusData} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid stroke="rgb(var(--color-border))" strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: 'rgb(var(--color-text))', fontSize: 14 }} 
                        interval={0}
                      />
                      <YAxis 
                        tick={{ fill: 'rgb(var(--color-text))', fontSize: 14 }} 
                        interval={0}
                        domain={[0, dataMax => Math.ceil(dataMax * 1.1)]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgb(var(--color-background))', 
                          border: '1px solid rgb(var(--color-border))',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          color: 'rgb(var(--color-text))',
                          padding: '8px'
                        }} 
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar 
                        dataKey="count" 
                        name="Nombre de demandes" 
                        rx={4} 
                        ry={4}
                        animationDuration={800}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <LabelList 
                          dataKey="count" 
                          position="top" 
                          fill="rgb(var(--color-text))" 
                          fontSize={12}
                        />
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