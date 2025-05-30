import React from 'react';

const statusLabels = {
  en_attente: 'En attente',
  en_cours: 'En cours',
  resolue: 'Résolue',
  rejetee: 'Rejetée'
};

const StatusBadge = ({ status }) => {
  let badgeClass = '';
  
  switch (status) {
    case 'en_attente':
      badgeClass = 'badge-attente';
      break;
    case 'en_cours':
      badgeClass = 'badge-cours';
      break;
    case 'resolue':
      badgeClass = 'badge-resolue';
      break;
    case 'rejetee':
      badgeClass = 'badge-rejetee';
      break;
    default:
      badgeClass = 'badge-attente';
  }
  
  return (
    <span className={`badge ${badgeClass}`}>
      {statusLabels[status] || status}
    </span>
  );
};

export default StatusBadge;