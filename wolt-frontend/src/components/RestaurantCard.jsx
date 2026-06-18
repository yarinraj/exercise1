import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant }) => {
    const navigate = useNavigate();
    const restaurantId = restaurant._id || restaurant.id;

    const displayRating = restaurant.averageRating ? restaurant.averageRating.toFixed(1) : "0.0";
    const totalRatings = restaurant.ratings ? restaurant.ratings.length : 0;

    return (
        <div className="col-md-4 col-sm-6 mb-4">
            <div
                className="card h-100 shadow-sm hover-card"
                style={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative'
                }}
                onClick={() => navigate(`/restaurant/${restaurantId}`)}
            >
                {/* Dynamic Theme-Aware Rating Badge */}
                <div
                    className="restaurant-rating-badge"
                    style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        padding: '5px 10px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        zIndex: 2
                    }}
                >
                    <span style={{ color: '#ffc107', fontSize: '0.95rem' }}>★</span>
                    <span>{displayRating}</span>

                    {totalRatings > 0 && (
                        <span
                            className="restaurant-rating-count" 
                            style={{ fontSize: '0.75rem', fontWeight: '400' }} 
                        >
                            ({totalRatings})
                        </span>
                    )}
                </div>

                <img
                    src={(restaurant.image && restaurant.image.trim() !== '') ? restaurant.image : '/icon.svg'}
                    alt={restaurant.name}
                    className="card-img-top restaurant-card-img border-bottom"
                    style={{
                        height: '180px',
                        objectFit: (restaurant.image && restaurant.image.trim() !== '') ? 'cover' : 'contain',
                        backgroundColor: (restaurant.image && restaurant.image.trim() !== '')
                            ? 'transparent'
                            : 'rgba(0, 0, 0, 0.04)',
                        padding: (restaurant.image && restaurant.image.trim() !== '') ? '0' : '28px'
                    }}
                />

                <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="card-title mb-0 restaurant-card-title fw-bold">
                            {restaurant.name}
                        </h5>
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