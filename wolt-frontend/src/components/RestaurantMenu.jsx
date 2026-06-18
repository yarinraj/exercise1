import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Toast from './Toast';
import { useCart } from '../context/cart';
import { navigate } from 'react-router-dom';
const rateRestaurantAPI = async (restaurantId, ratingValue) => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error("Only logged in users can rate restaurants. Please log in.");
    }

    const response = await fetch(`/api/restaurants/${restaurantId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rating: ratingValue })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to submit rating");
    }

    return data;

  } catch (error) {
    console.error("Error in rateRestaurant API call:", error.message);
    throw error;
  }
};
const RestaurantMenu = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const [isDark, setIsDark] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Theme detection logic
  useEffect(() => {
    const determineTheme = () => {
      const htmlAttr = document.documentElement.getAttribute('data-bs-theme') || document.documentElement.getAttribute('data-theme') || '';
      const bodyAttr = document.body.getAttribute('data-bs-theme') || document.body.getAttribute('data-theme') || '';
      const classes = [...document.body.classList, ...document.documentElement.classList];
      const hasDarkClass = classes.some(c => c.toLowerCase().includes('dark'));

      setIsDark(htmlAttr.includes('dark') || bodyAttr.includes('dark') || hasDarkClass);
    };

    determineTheme();

    const observer = new MutationObserver(determineTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-bs-theme', 'data-theme'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-bs-theme', 'data-theme'] });

    return () => observer.disconnect();
  }, []);

  // Fetch restaurant and menu data
  useEffect(() => {
    const fetchMenuData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');

      try {
        const [restaurantRes, productsRes] = await Promise.all([
          fetch(`/api/restaurants/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/restaurants/${id}/products`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (restaurantRes.status === 404) {
          setToast({ show: true, message: 'The requested restaurant could not be found.', type: 'warning' });
          setTimeout(() => navigate('/restaurants'), 3000);
          return;
        }

        if (!restaurantRes.ok || !productsRes.ok) {
          setToast({ show: true, message: 'Failed to load restaurant menu details.', type: 'error' });
          setTimeout(() => navigate('/restaurants'), 3000);
          return;
        }

        const restaurantData = await restaurantRes.json();
        const productsData = await productsRes.json();

        setRestaurant(restaurantData);
        setProducts(productsData);
      } catch (err) {
        setToast({ show: true, message: 'A server error occurred. Please try again later.', type: 'error' });
        setTimeout(() => navigate('/restaurants'), 3000);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMenuData();
  }, [id, navigate]);
  const handleRatingSubmit = async (ratingValue) => {
    // check if user is logged in by verifying the presence of a token in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setToast({
        show: true,
        message: 'Only logged in users can rate restaurants. Redirecting to login...',
        type: 'error'
      });

      // navigate to the login page after a short delay to allow the user to read the toast message
      setTimeout(() => {
        navigate('/login');
      }, 2500);

      return;
    }
    try {
      const data = await rateRestaurantAPI(id, ratingValue);

      // Update local state dynamically so the UI updates without a full page reload
      setRestaurant(prev => ({
        ...prev,
        averageRating: data.averageRating,
        ratings: data.ratings// increment total ratings count visually
      }));

      setToast({ show: true, message: 'Thank you! Rating submitted successfully.', type: 'success' });
    } catch (error) {
      setToast({ show: true, message: error.message, type: 'error' });
    }
  };
  // Loading State
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status" style={{ color: '#00c2e8' }}>
          <span className="visually-hidden">Loading menu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-page-wrapper pb-5">
      {/* Toast Notification positioned absolutely */}
      {toast.show && (
        <div className="position-fixed top-0 start-50 translate-middle-x p-3" style={{ zIndex: 1060 }}>
          <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
        </div>
      )}

      {restaurant && (
        <>
          {/* HERO BANNER SECTION
            Takes 1/3 of the screen height (33vh) and spans full width.
            Implements the fallback logo logic if the restaurant has no image.
          */}
          <div
            className="w-100 shadow-sm"
            style={{
              height: '33vh',
              backgroundColor: (restaurant.image && restaurant.image.trim() !== '') ? 'transparent' : (isDark ? '#1a1d24' : '#f8f9fa'),
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            <img
              src={(restaurant.image && restaurant.image.trim() !== '') ? restaurant.image : '/icon.svg'}
              alt={restaurant.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: (restaurant.image && restaurant.image.trim() !== '') ? 'cover' : 'contain',
                padding: (restaurant.image && restaurant.image.trim() !== '') ? '0' : '2rem'
              }}
            />
          </div>

          {/* MAIN CONTENT CONTAINER */}
          <div className="container mt-4">

            {/* Restaurant Title & Info */}
            <div className="text-center mb-5">
              <h1 className="fw-bold display-5" style={{ color: isDark ? '#fff' : '#212529' }}>{restaurant.name}</h1>
              <p className="mb-0" style={{ color: isDark ? '#adb5bd' : '#6c757d', fontSize: '1.1rem' }}>
                {restaurant.cuisine} • {restaurant.address}
              </p>
              <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                <div className="d-flex align-items-center">
                  {[1, 2, 3, 4, 5].map((star) => {
                    // 1. Calculate how much this specific star should be filled (0 to 100%)
                    let fillPercentage = 0;

                    if (hoverRating) {
                      // If hovering, behave normally with whole stars
                      fillPercentage = hoverRating >= star ? 100 : 0;
                    } else {
                      // If not hovering, calculate precise decimal fill
                      const avg = restaurant.averageRating || 0;
                      if (avg >= star) {
                        fillPercentage = 100; // Fully filled star
                      } else if (avg > star - 1) {
                        fillPercentage = (avg - (star - 1)) * 100; // Partially filled star (e.g., 0.3 -> 30%)
                      }
                    }

                    return (
                      <div
                        key={star}
                        style={{
                          position: 'relative',
                          display: 'inline-block',
                          cursor: 'pointer',
                          fontSize: '1.6rem',
                          // Base background color (the empty gray star)
                          color: isDark ? 'rgba(255,255,255,0.2)' : '#e4e5e9',
                          userSelect: 'none',
                          lineHeight: '1'
                        }}
                        onClick={() => handleRatingSubmit(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        {/* Background Layer: Empty Star */}
                        <span>★</span>

                        {/* Foreground Layer: Filled Star (Clipped by width percentage) */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: `${fillPercentage}%`,
                            overflow: 'hidden',
                            color: '#ffc107', // Gold color
                            whiteSpace: 'nowrap',
                            transition: hoverRating ? 'none' : 'width 0.2s ease' // Smooth animation only when rating loads
                          }}
                        >
                          ★
                        </div>
                      </div>
                    );
                  })}
                </div>

                <span className="fw-bold" style={{ color: isDark ? '#fff' : '#212529', fontSize: '1.05rem', lineHeight: '1' }}>
                  {restaurant.averageRating ? restaurant.averageRating.toFixed(1) : "0.0"}
                </span>
                <span style={{ color: isDark ? '#747a80' : '#8c9399', fontSize: '0.95rem', lineHeight: '1' }}>
                  ({restaurant.ratings ? restaurant.ratings.length : 0} ratings)
                </span>
              </div>
            </div>

            <h3 className="fw-bold mb-4" style={{ color: isDark ? '#fff' : '#212529' }}>Menu</h3>

            {/* Menu Products Grid */}
            <div className="row">
              {products.map((product) => {
                const hasImage = product.image && product.image.trim() !== "";
                const cartItem = cartItems.find(item =>
                  (product._id && item._id === product._id) || (product.id && item.id === product.id)
                );

                return (
                  <div key={product._id || product.id || Math.random().toString()} className="col-md-6 mb-3">
                    <div className="card h-100 shadow-sm p-3 content-card"
                      style={{
                        borderRadius: '16px',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}>
                      <div className="d-flex justify-content-between align-items-start gap-2 h-100">

                        <div className="d-flex flex-column h-100 flex-grow-1" style={{ maxWidth: hasImage ? '72%' : '100%' }}>
                          <h5 className="fw-bold mb-1" style={{ color: isDark ? '#fff' : '#212529' }}>{product.name}</h5>
                          <p className="text-muted small mb-3 text-truncate-3" style={{ lineHeight: '1.4' }}>
                            {product.description}
                          </p>
                          <div className="fw-bold mt-auto fs-5" style={{ color: '#00c2e8' }}>₪{product.price}</div>
                        </div>

                        <div className="d-flex flex-column align-items-center justify-content-between flex-shrink-0" style={{ width: '110px' }}>

                          {/* Product Image or Fallback Logo */}
                          <div className="position-relative mb-2 d-flex align-items-center justify-content-center"
                            style={{
                              width: '110px',
                              height: '110px',
                              backgroundColor: hasImage ? 'transparent' : (isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa'),
                              borderRadius: '12px',
                              boxShadow: hasImage ? '0 4px 10px rgba(0,0,0,0.15)' : 'inset 0 0 0 1px rgba(0,0,0,0.05)'
                            }}>
                            <img
                              src={hasImage ? product.image : '/icon.svg'}
                              alt={product.name}
                              style={{
                                width: hasImage ? '100%' : '50%', // Logo is slightly smaller to sit nicely in the box
                                height: hasImage ? '100%' : '50%',
                                objectFit: hasImage ? 'cover' : 'contain',
                                borderRadius: hasImage ? '12px' : '0'
                              }}
                            />
                          </div>
                          <div className="w-100 mt-auto d-flex justify-content-center">
                            {cartItem ? (
                              <div className="d-flex align-items-center justify-content-between rounded-pill p-1 w-100"
                                style={{
                                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                  border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)'
                                }}>
                                <button
                                  className="btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center fw-bold"
                                  style={{ width: '28px', height: '28px', backgroundColor: 'transparent', border: 'none', color: isDark ? '#fff' : '#212529' }}
                                  onClick={() => updateQuantity(cartItem._id || cartItem.id, cartItem.quantity - 1)}
                                >
                                  —
                                </button>
                                <span className="fw-bold small px-1" style={{ color: isDark ? '#fff' : '#212529' }}>{cartItem.quantity}</span>
                                <button
                                  className="btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center fw-bold"
                                  style={{ width: '28px', height: '28px', backgroundColor: 'transparent', border: 'none', color: '#00c2e8' }}
                                  onClick={() => updateQuantity(cartItem._id || cartItem.id, cartItem.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm"
                                style={{ width: '36px', height: '36px', backgroundColor: '#00c2e8', border: 'none', color: '#fff', fontSize: '1.2rem', transition: 'transform 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                onClick={() => addToCart(product, id)}
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantMenu;