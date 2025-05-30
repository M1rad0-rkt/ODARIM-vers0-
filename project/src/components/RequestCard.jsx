import React from 'react';
import { Clock, MessageCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useNavigate } from 'react-router-dom';

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

const RequestCard = ({ request }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/client/details-demandes/${request.id}`);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-fade-in"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{request.title}</h3>
        <StatusBadge status={request.status} />
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{request.description}</p>

      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center text-gray-500">
          <Clock size={14} className="mr-1" />
          <span>{formatDate(request.created_at)}</span>
        </div>

        <div className="flex items-center">
          <span className="text-gray-500 mr-2">{request.category}</span>
          {request.admin_comment && (
            <span className="text-indigo-600">
              <MessageCircle size={14} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestCard;