import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequestById, updateRequestStatus } from '../../api/requests';
import StatusBadge from '../../components/StatusBadge';
import {
  Clock, ArrowLeft, User, AlertTriangle, Star, CheckCircle
} from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'Date indisponible';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Date invalide';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const DetailDemande = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newStatus, setNewStatus] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const data = await getRequestById(id);
        console.log("Données reçues pour la demande:", data);
        setRequest(data);
        setNewStatus(data.status);
        setAdminComment(data.admin_comment || '');
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les détails de la demande");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setUpdateSuccess(false);
    setUpdatingStatus(true);

    try {
      await updateRequestStatus(id, newStatus, adminComment);
      const updatedRequest = await getRequestById(id);
      setRequest(updatedRequest);
      setUpdateSuccess(true);

      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Chargement...</div>;

  if (error) return (
    <div className="bg-red-100 p-4 rounded text-red-700 flex items-center">
      <AlertTriangle className="mr-2" /> {error}
    </div>
  );

  if (!request) return <div className="text-center mt-10">Demande introuvable</div>;

  return (
    <div className="p-4">
      <button onClick={() => navigate('/admin/demandes')} className="flex items-center mb-6 text-blue-600">
        <ArrowLeft className="mr-2" size={16} />
        Retour à la liste
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Demande de {request.user_name}</h1>
        <div className="flex gap-4 mt-2">
          <StatusBadge status={request.status} />
          <div className="text-sm text-gray-500 flex items-center">
            <Clock size={14} className="mr-1" />
            {formatDate(request.created_at)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT PANEL */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-4 border">
            <h2 className="font-semibold text-lg mb-2">{request.title}</h2>
            <div className="text-sm text-gray-600 mb-2 flex items-center">
              <User size={14} className="mr-1" />
              Client: {request.user_name || 'Nom indisponible'}
            </div>
            <p className="text-sm whitespace-pre-line">{request.description}</p>
          </div>

          <div className="card p-4 border border-primary">
            <h2 className="font-semibold text-lg mb-4">Gérer cette demande</h2>

            {error && (
              <div className="text-red-700 bg-red-100 p-3 rounded mb-3">
                <AlertTriangle size={16} className="inline-block mr-2" />
                {error}
              </div>
            )}

            {updateSuccess && (
              <div className="text-green-700 bg-green-100 p-3 rounded mb-3">
                <CheckCircle size={16} className="inline-block mr-2" />
                La demande a été mise à jour avec succès.
              </div>
            )}

            <form onSubmit={handleStatusUpdate}>
              <div className="mb-4">
                <label className="text-sm font-medium">Statut</label>
                <select
                  className="select w-full mt-1"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  <option value="en_attente">En attente</option>
                  <option value="en_cours">En cours</option>
                  <option value="resolue">Résolue</option>
                  <option value="rejetee">Rejetée</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium">Commentaire administrateur</label>
                <textarea
                  className="textarea w-full mt-1"
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  rows={4}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={updatingStatus}
              >
                {updatingStatus ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-6">
          <div className="card border p-4">
            <h2 className="font-semibold text-lg mb-4">Informations</h2>
            <div className="text-sm space-y-2">
              <p><strong>Catégorie :</strong> {request.category}</p>
              <p><strong>Créée le :</strong> {formatDate(request.created_at)}</p>
              <p><strong>Mis à jour le :</strong> {formatDate(request.updated_at)}</p>
              <p><strong>Client :</strong> {request.user_name || 'Nom indisponible'}</p>
            </div>
          </div>

          {request.feedback && (
            <div className="card border p-4">
              <h2 className="font-semibold text-lg mb-4 flex items-center">
                <Star size={18} className="text-yellow-500 mr-2" />
                Feedback client
              </h2>

              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="text-yellow-500"
                    fill={i < request.feedback.rating ? 'currentColor' : 'none'}
                  />
                ))}
                <span className="ml-2 font-medium">{request.feedback.rating}/5</span>
              </div>

              {request.feedback.comment ? (
                <p className="italic text-sm">"{request.feedback.comment}"</p>
              ) : (
                <p className="text-sm text-gray-500">Aucun commentaire</p>
              )}
              <p className="text-xs text-gray-400 mt-3">
                Soumis le {formatDate(request.feedback.created_at)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailDemande;