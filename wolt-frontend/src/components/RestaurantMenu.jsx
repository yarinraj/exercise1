import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Toast from './Toast';

const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management for API data
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  
  // UX states for loading and elegant toast notifications
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    const fetchMenuData = async () => {
      setLoading(true);
      
      const token = localStorage.getItem('token');

      try {
        // Fetch both restaurant details and products concurrently
        const [restaurantRes, productsRes] = await Promise.all([
          fetch(`/api/restaurants/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`/api/restaurants/${id}/products`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // Handle Case: Restaurant ID not found in database (e.g., test-123)
        if (restaurantRes.status === 404) {
          setToast({
            show: true,
            message: 'The requested restaurant could not be found.',
            type: 'warning'
          });
          // Redirect back to the feed after 3 seconds
          setTimeout(() => navigate('/restaurants'), 3000);
          return;
        }

        if (!restaurantRes.ok || !productsRes.ok) {
          setToast({
            show: true,
            message: 'Failed to load restaurant menu details.',
            type: 'error'
          });
          setTimeout(() => navigate('/restaurants'), 3000);
          return;
        }

        const restaurantData = await restaurantRes.json();
        const productsData = await productsRes.json();

        setRestaurant(restaurantData);
        setProducts(productsData);
      } catch (err) {
        setToast({
          show: true,
          message: 'A server error occurred. Please try again later.',
          type: 'error'
        });
        setTimeout(() => navigate('/restaurants'), 3000);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMenuData();
    }
  }, [id, navigate]);

  // Render Loading Spinner state while fetching data
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({ ...toast, show: false })} 
          />
        )}
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading menu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {/* Render our custom Toast notification if an error occurs */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      {/* Render the restaurant view layout only if data was fetched successfully */}
      {restaurant && (
        <>
          <div className="card shadow-sm p-4 bg-white rounded-3 mb-4">
            <h1 className="fw-bold text-dark">{restaurant.name}</h1>
            <p className="text-muted">{restaurant.cuisine} • {restaurant.address}</p>
          </div>

          <h3 className="fw-bold mb-3">Menu Items ({products.length})</h3>
          
          <div className="row">
            {products.map((product) => (
              <div key={product._id || product.id} className="col-md-6 mb-3">
                <div className="card h-100 shadow-sm p-3">
                  <h5 className="fw-bold">{product.name}</h5>
                  <p className="text-muted small">{product.description}</p>
                  <div className="text-info fw-bold mt-auto">${product.price}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantMenu;