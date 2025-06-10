import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'approved':
        return 'bg-info text-white';
      case 'completed':
        return 'bg-success text-white';
      case 'cancelled':
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  return (
    <span className={`badge ${getBadgeClass()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;