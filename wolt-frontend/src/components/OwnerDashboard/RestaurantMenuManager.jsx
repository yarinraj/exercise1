import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BackgroundDoodles from '../common/BackgroundDoodles';
import Toast from '../Toast';
import '../common/auth.css';

/**
 * RestaurantMenuManager Component
 * Lists all dishes for a restaurant. Uses the app's logo as a fallback image.
 */
const RestaurantMenuManager = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);

    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'info'
    });

    const [deleteTargetId, setDeleteTargetId] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({
            show: true,
            message,
            type
        });
    };

    const closeToast = () => {
        setToast((prev) => ({
            ...prev,
            show: false
        }));
    };

    // Fetch all products on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/restaurants/${id}/products`);

                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }

                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
                showToast('Failed to load dishes.', 'error');
            }
        };

        fetchProducts();
    }, [id]);

    const handleDeleteClick = (productId) => {
        setDeleteTargetId(productId);
    };

    const cancelDelete = () => {
        setDeleteTargetId(null);
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                showToast('You are not logged in.', 'error');
                setDeleteTargetId(null);
                return;
            }

            showToast('Deleting dish...', 'info');

            const response = await fetch(`http://localhost:8080/api/restaurants/${id}/products/${deleteTargetId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok || response.status === 204) {
                setProducts((prevProducts) =>
                    prevProducts.filter((product) => product._id !== deleteTargetId)
                );

                setDeleteTargetId(null);
                showToast('Dish deleted successfully!', 'success');
                return;
            }

            const errorData = await response.json().catch(() => null);

            setDeleteTargetId(null);

            showToast(
                errorData?.error ||
                errorData?.message ||
                'Failed to delete dish.',
                'error'
            );
        } catch (error) {
            console.error('Delete error:', error);
            setDeleteTargetId(null);
            showToast('Server error while deleting dish.', 'error');
        }
    };

    return (
        <div className="manager-page-container min-vh-100 py-5">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            )}

            {deleteTargetId && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        zIndex: 9998
                    }}
                >
                    <div
                        className="bg-white rounded-4 shadow p-4 text-center"
                        style={{
                            width: 'min(420px, 90vw)'
                        }}
                    >
                        <h4 className="fw-bold mb-3 text-dark">
                            Delete dish?
                        </h4>

                        <p className="text-muted mb-4">
                            Are you sure you want to delete this dish?
                            This action cannot be undone.
                        </p>

                        <div className="d-flex gap-3 justify-content-center">
                            <button
                                type="button"
                                className="btn btn-outline-secondary rounded-pill px-4 fw-bold"
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn btn-danger rounded-pill px-4 fw-bold"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BackgroundDoodles />

            <div className="container position-relative">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-10 col-lg-8">
                        <div className="text-center mb-4">
                            <h1 className="fw-bold">Menu Management</h1>
                            <p className="text-muted">
                                Manage the dishes available at your restaurant.
                            </p>
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
                                    products.map((product) => (
                                        <div
                                            key={product._id}
                                            className="list-group-item d-flex justify-content-between align-items-center py-3 bg-transparent border-bottom"
                                        >
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={(product.image && product.image.trim() !== '') ? product.image : '/icon.svg'}
                                                    alt={product.name}
                                                    className="rounded-3 me-3"
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        objectFit: 'contain',
                                                        border: '1px solid #eaeaea',
                                                        backgroundColor: '#f8f9fa',
                                                        padding: '5px'
                                                    }}
                                                />

                                                <div>
                                                    <h5
                                                        className="mb-1 fw-bold"
                                                        style={{ color: 'inherit' }}
                                                    >
                                                        {product.name}
                                                    </h5>

                                                    <small className="text-muted">
                                                        {product.price} ₪
                                                    </small>
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
                                                    onClick={() => handleDeleteClick(product._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-muted mb-0">
                                            No dishes found. Click "+ Add New Dish" to get started.
                                        </p>
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