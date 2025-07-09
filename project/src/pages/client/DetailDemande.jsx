import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRequestById, addFeedback, updateRequest } from '../../api/requests';
import StatusBadge from '../../components/StatusBadge';
import { Clock, ArrowLeft, MessageSquare, AlertTriangle, Star, CheckCircle2, Pencil, X } from 'lucide-react';

const formatDate = (dateString) => {
  const date = new Date(dateString);
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const data = await getRequestById(id);
        console.log('Request data:', data);
        setRequest(data);
        setEditTitle(data.title || '');
        setEditDescription(data.description || '');
        setEditCategory(data.category || 'Autre');
      } catch (err) {
        console.error('Erreur lors de la récupération de la demande:', err);
        setError('Impossible de charger les détails de la demande');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Veuillez attribuer une note');
      return;
    }
    try {
      setSubmittingFeedback(true);
      const updatedRequest = await addFeedback(id, rating, feedbackComment);
      console.log('Updated request:', updatedRequest);
      setRequest(updatedRequest);
      setSuccess('Évaluation envoyée avec succès. La demande a été archivée.');
      setShowFeedbackModal(false);
      setError(null);
      setTimeout(() => {
        navigate('/client/demandes?refresh=true&success=true');
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de l’envoi du feedback:', err);
      setError(err.message || 'Erreur lors de l’envoi du feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editCategory.trim()) {
      setError('Le titre et la catégorie sont requis');
      return;
    }
    try {
      setSubmittingEdit(true);
      await updateRequest(id, {
        title: editTitle,
        description: editDescription,
        category: editCategory,
      });
      const updatedRequest = await getRequestById(id);
      setRequest(updatedRequest);
      setSuccess('Demande modifiée avec succès');
      setShowEditForm(false);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la modification de la demande:', err);
      setError('Impossible de modifier la demande');
    } finally {
      setSubmittingEdit(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

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

  if (error && !request) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-100 dark:bg-gray-900">
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-200 border border-red-300 dark:border-red-700 flex items-center animate-fade-in">
          <AlertTriangle size={20} className="mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-700 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-100 dark:bg-gray-900">
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-200 border border-red-300 dark:border-red-700 flex items-center animate-fade-in">
          <AlertTriangle size={20} className="mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">Demande introuvable</span>
          <button
            onClick={() => navigate('/client/demandes')}
            className="ml-auto text-red-700 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/client/demandes')}
                className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                <ArrowLeft size={16} className="mr-2" />
                Retour
              </button>
              {request.status !== 'resolue' && user.role !== 'admin' && request.status !== 'rejetee' && (
                <button
                  onClick={() => setShowEditForm(true)}
                  className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  <Pencil size={16} className="mr-2" />
                  Modifier
                </button>
              )}
            </div>
            <div className="flex items-center justify-end">
              {request.status === 'resolue' && user.role !== 'admin' && (
                request.feedback?.rating ? (
                  <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
                    <CheckCircle2 size={16} className="mr-2" />
                    Merci pour votre évaluation
                  </span>
                ) : (
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white text-sm font-medium hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  >
                    <Star size={16} className="mr-2" />
                    Évaluer
                  </button>
                )
              )}
            </div>
          </div>
        </header>

        {/* Success Notification */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 dark:bg-green-900/80 text-green-700 dark:text-green-200 border border-green-300 dark:border-green-700 flex items-center animate-fade-in">
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
          <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-200 border border-red-300 dark:border-red-700 flex items-center animate-fade-in">
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

        {/* Feedback Modal */}
        {showFeedbackModal && !request.feedback?.rating && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Évaluer la résolution</h2>
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setError(null);
                  }}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Satisfaction (1-5 étoiles)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className={`p-1 rounded-full transition-transform duration-200 hover:scale-110 ${
                          rating >= value ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                        }`}
                        aria-label={`${value} étoile${value > 1 ? 's' : ''}`}
                      >
                        <Star size={24} fill={rating >= value ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative group">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-300 text-sm group-hover:shadow-md focus:shadow-lg placeholder:font-light resize-none"
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Votre retour sur la résolution..."
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFeedbackModal(false);
                      setError(null);
                    }}
                    className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white text-sm font-medium hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingFeedback ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scrollable Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Form */}
            {showEditForm && user.role !== 'admin' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-blue-100 dark:border-blue-800 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Modifier la demande</h2>
                <form onSubmit={handleSubmitEdit} className="space-y-4">
                  <div className="relative group">
                    <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Titre
                    </label>
                    <input
                      id="editTitle"
                      type="text"
                      className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm group-hover:shadow-md focus:shadow-lg placeholder:font-light"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Titre de la demande"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <label htmlFor="editCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Catégorie
                    </label>
                    <div className="relative">
                      <select
                        id="editCategory"
                        className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm group-hover:shadow-md focus:shadow-lg appearance-none cursor-pointer"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        required
                      >
                        <option value="Technique">Technique</option>
                        <option value="Administratif">Administratif</option>
                        <option value="Financier">Financier</option>
                        <option value="Autre">Autre</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none top-1/2 transform -translate-y-1/2">
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="relative group">
                    <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Description
                    </label>
                    <textarea
                      id="editDescription"
                      rows={4}
                      className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm group-hover:shadow-md focus:shadow-lg placeholder:font-light resize-none"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description de la demande..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submittingEdit}
                      className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingEdit ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setError(null);
                      }}
                      className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Title and Metadata */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{request.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <StatusBadge status={request.status} />
                <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">{request.category}</span>
                <span className="flex items-center">
                  <Clock size={16} className="mr-2" />
                  {formatDate(request.created_at)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Détails</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{request.description || 'Aucune description fournie'}</p>
            </div>

            {/* Admin Comment */}
            {request.admin_comment && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Réponse de l'administrateur</h2>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 dark:bg-green-700 text-white flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{request.admin_comment}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{formatDate(request.updated_at)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 sticky top-24 animate-fade-in">
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">Informations</h3>
              <dl className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
                <div>
                  <dt className="font-medium text-gray-900 dark:text-gray-100">ID</dt>
                  <dd>{request.id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900 dark:text-gray-100">Catégorie</dt>
                  <dd>{request.category}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900 dark:text-gray-100">Statut</dt>
                  <dd><StatusBadge status={request.status} /></dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900 dark:text-gray-100">Créée</dt>
                  <dd>{formatDate(request.created_at)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900 dark:text-gray-100">Mise à jour</dt>
                  <dd>{formatDate(request.updated_at)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          {request.status !== 'resolue' && user.role !== 'admin' && request.status !== 'rejetee' && (
            <button
              onClick={() => setShowEditForm(true)}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-lg"
              title="Modifier la demande"
            >
              <Pencil size={16} className="mr-2" />
              Modifier
            </button>
          )}
          {request.status === 'resolue' && !request.feedback?.rating && user.role !== 'admin' && (
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white text-sm font-medium hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-lg"
              title="Évaluer la résolution"
            >
              <Star size={16} className="mr-2" />
              Évaluer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailDemande;