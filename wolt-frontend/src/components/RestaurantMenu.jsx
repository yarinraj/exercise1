import React from 'react';
import { useParams } from 'react-router-dom';

const RestaurantMenu = () => {
  const { id } = useParams();

  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4 bg-white rounded">
        <h2 className="fw-bold mb-3">Restaurant Menu View</h2>
        <p className="text-muted">
          Currently displaying structured digital food menu for Restaurant ID: <strong className="text-info">{id}</strong>
        </p>
      </div>
    </div>
  );
};

export default RestaurantMenu;