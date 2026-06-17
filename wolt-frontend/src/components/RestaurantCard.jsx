import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RestaurantCard.css'; 

const RestaurantCard = ({ restaurant }) => {
    const navigate = useNavigate();
    const defaultImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=60";

    const restaurantId = restaurant._id || restaurant.id;
    
    return (
        <div className="col-md-4 col-sm-6 mb-4">
            <div 
                className="card h-100 shadow-sm hover-card" 
                onClick={() => navigate(`/restaurant/${restaurantId}`)}
            >
                <img 
                    src={restaurant.image || defaultImage} 
                    className="card-img-top restaurant-card-img" 
                    alt={restaurant.name}
                />
                
                <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="card-title mb-0 restaurant-card-title fw-bold">{restaurant.name}</h5>
                        <span className="badge bg-primary text-wrap">{restaurant.cuisine || 'General'}</span>
                    </div>
                    
                    <p className="card-text text-muted small flex-grow-1 mb-2">
                        📍 {restaurant.address || 'Address not specified'}
                    </p>
                    
                    <div className="border-top pt-2 mt-auto d-flex justify-content-between align-items-center text-secondary small">
                        <span>📞 {restaurant.phone || 'No phone'}</span>
                        <span className="text-success fw-bold">Open</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantCard;