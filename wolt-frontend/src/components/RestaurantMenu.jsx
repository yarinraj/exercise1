import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Toast from './Toast';
import { useCart } from '../context/cart';

const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity } = useCart();
  
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const [isDark, setIsDark] = useState(false);

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
    <div className="container mt-5">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      {restaurant && (
        <>
          <div className="text-center mb-5 pt-3">
            <h1 className="fw-bold">{restaurant.name}</h1>
            <p className="restaurant-data mb-0">{restaurant.cuisine} • {restaurant.address}</p>
          </div>

          <h3 className="fw-bold mb-5">Menu</h3>

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
                        {hasImage ? (
                          <div className="position-relative mb-2">
                            <img src={product.image} alt={product.name} style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }} />
                          </div>
                        ) : (
                          <div style={{ height: '70px' }}></div>
                        )}

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
        </>
      )}
    </div>
  );
};

export default RestaurantMenu;