import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BackgroundDoodles from '../common/BackgroundDoodles';
import '../common/auth.css';

const RestaurantMenuManager = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

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

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this dish?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/restaurants/${id}/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setProducts(products.filter(p => p._id !== productId));
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    return (
        <div className="manager-page-container min-vh-100 py-5">
            <BackgroundDoodles />
            <div className="container position-relative">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-10 col-lg-8">
                        
                        <div className="text-center mb-4">
                            <h1 className="fw-bold">Menu Management</h1>
                            <p className="text-muted">Manage the dishes available at your restaurant.</p>
                        </div>

                        <section className="card p-4 p-md-5 shadow-sm border-0 rounded-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="fw-bold m-0">Dishes</h3>
                                <button
                                    className="btn btn-primary rounded-pill px-4 fw-bold"
                                    onClick={() => navigate(`/owner/edit/${id}/menu/add`)}
                                >
                                    + Add New Dish
                                </button>
                            </div>

                            <div className="list-group list-group-flush">
                                {products.length > 0 ? (
                                    products.map(product => (
                                        <div key={product._id} className="list-group-item d-flex justify-content-between align-items-center py-3 bg-transparent border-bottom">
                                            
                                           
                                            <div className="d-flex align-items-center">
                                                
                                                <img 
                                                    src={product.image || 'https://via.placeholder.com/60?text=No+Image'} 
                                                    alt={product.name} 
                                                    className="rounded-3 me-3" 
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', border: '1px solid #eaeaea' }} 
                                                />
                                                <div>
                                                    <h5 className="mb-1 fw-bold" style={{ color: 'inherit' }}>{product.name}</h5>
                                                    <small className="text-muted">{product.price} ₪</small>
                                                </div>
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
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-muted mb-0">No dishes found. Click "+ Add New Dish" to get started.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="mt-4 text-center">
                            <button
                                className="btn btn-link text-decoration-none fw-bold"
                                style={{ color: 'inherit' }}
                                onClick={() => navigate('/owner/dashboard')}
                            >
                                ← Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantMenuManager;