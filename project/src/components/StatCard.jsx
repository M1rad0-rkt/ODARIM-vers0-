import React from 'react';

const StatCard = ({ title, value, icon: Icon, color }) => {
  const bgColorClass = `bg-${color}-100 dark:bg-${color}-900`;
  const textColorClass = `text-${color}-800 dark:text-${color}-300`;
  
  return (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${bgColorClass} ${textColorClass} mr-4`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
};

export default StatCard;