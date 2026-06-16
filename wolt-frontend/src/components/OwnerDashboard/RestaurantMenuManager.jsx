import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BackgroundDoodles from '../common/BackgroundDoodles';

/**
 * RestaurantMenuManager Component
 * Allows owners to view, edit, add, or delete menu items for a specific restaurant.
 */
const RestaurantMenuManager = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    // Fetch all products for the selected restaurant
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/restaurants/${id}/products`);
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, [id]);

    // Function to handle product deletion
    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this dish?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/restaurants/${id}/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // Remove product from state to update UI immediately
                setProducts(products.filter(p => p._id !== productId));
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

  return (
        <div className="manager-page-container">
            <BackgroundDoodles />
            <div className="container" style={{ maxWidth: '800px' }}>
                
                {/* Header that adapts to theme */}
                <h1 className="fw-bold mb-4 text-body">Menu Management</h1>

                <section className="card p-4 shadow-sm border-0 rounded-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="fw-bold text-body">Dishes</h3>
                        <button
                            className="btn btn-primary rounded-pill px-4 fw-bold"
                            onClick={() => navigate(`/owner/edit/${id}/menu/add`)}
                        >
                            + Add New Dish
                        </button>
                    </div>

                    <div className="list-group list-group-flush">
                        {products.map(product => (
                            <div key={product._id} className="list-group-item d-flex justify-content-between align-items-center py-3 bg-transparent border-bottom">
                                <div className="text-body">
                                    <h5 className="mb-1 fw-bold">{product.name}</h5>
                                    <small className="text-muted">{product.price} ₪</small>
                                </div>
                                <div className="d-flex">
                                    <button
                                        className="btn btn-sm btn-outline-primary rounded-pill me-2 px-3"
                                        onClick={() => navigate(`/owner/edit/${id}/menu/edit/${product._id}`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                        onClick={() => handleDeleteProduct(product._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="mt-4">
                    <button
                        className="btn btn-link text-body text-decoration-none fw-bold"
                        onClick={() => navigate('/owner/dashboard')}
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};


export default RestaurantMenuManager;