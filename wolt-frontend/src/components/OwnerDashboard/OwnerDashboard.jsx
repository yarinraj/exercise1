import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BackgroundDoodles from '../common/BackgroundDoodles';
import Toast from '../Toast';

/**
 * OwnerDashboard Component
 * Displays a list of restaurants owned by the logged-in user.
 * Allows owners to edit, delete, promote, or create new restaurants.
 */
const OwnerDashboard = () => {
    const [restaurant, setRestaurant] = useState(null);

    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'info'
    });

    const [deleteTargetId, setDeleteTargetId] = useState(null);

    const [promotionTarget, setPromotionTarget] = useState(null);
    // promotionTarget shape:
    // {
    //   id: string,
    //   currentStatus: boolean
    // }

    const navigate = useNavigate();

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

    useEffect(() => {
        const fetchMyRestaurants = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                showToast('You are not logged in.', 'error');
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/api/restaurants/my-restaurants', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch');
                }

                const data = await response.json();
                setRestaurant(data);
            } catch (error) {
                console.error('Failed to fetch restaurants:', error);
                showToast('Failed to load your restaurants.', 'error');
            }
        };

        fetchMyRestaurants();
    }, []);

    const handlePromotionClick = (id, currentStatus) => {
        setPromotionTarget({
            id,
            currentStatus
        });
    };

    const cancelPromotionModal = () => {
        setPromotionTarget(null);
    };

    const confirmPromotionChange = async () => {
        if (!promotionTarget) return;

        const { id, currentStatus } = promotionTarget;

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                showToast('You are not logged in.', 'error');
                setPromotionTarget(null);
                return;
            }

            showToast(
                currentStatus ? 'Cancelling promotion...' : 'Activating promotion...',
                'info'
            );

            const response = await fetch(`http://localhost:8080/api/restaurants/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isPromoted: !currentStatus })
            });

            if (response.ok) {
                setRestaurant((prevRestaurants) =>
                    prevRestaurants.map((res) =>
                        res._id === id ? { ...res, isPromoted: !currentStatus } : res
                    )
                );

                setPromotionTarget(null);

                showToast(
                    currentStatus
                        ? 'Promotion cancelled successfully.'
                        : 'Restaurant promoted successfully!',
                    'success'
                );

                return;
            }

            const errorData = await response.json().catch(() => null);

            setPromotionTarget(null);

            showToast(
                errorData?.error ||
                errorData?.message ||
                'Failed to update promotion status.',
                'error'
            );
        } catch (error) {
            console.error('Promotion toggle error:', error);
            setPromotionTarget(null);
            showToast('Server error while updating promotion.', 'error');
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteTargetId(id);
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

            showToast('Deleting restaurant...', 'info');

            const response = await fetch(`http://localhost:8080/api/restaurants/${deleteTargetId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok || response.status === 204) {
                setRestaurant((prevRestaurants) =>
                    prevRestaurants.filter((res) => res._id !== deleteTargetId)
                );

                setDeleteTargetId(null);
                showToast('Restaurant deleted successfully!', 'success');
                return;
            }

            const errorData = await response.json().catch(() => null);

            setDeleteTargetId(null);

            showToast(
                errorData?.error ||
                errorData?.message ||
                'Failed to delete restaurant.',
                'error'
            );
        } catch (error) {
            console.error('Delete error:', error);
            setDeleteTargetId(null);
            showToast('Server error while deleting restaurant.', 'error');
        }
    };

    return (
        <div className="dashboard-container position-relative min-vh-100">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            )}

            {promotionTarget && (
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
                            width: 'min(460px, 90vw)'
                        }}
                    >
                        <h4 className="fw-bold mb-3 text-dark">
                            {promotionTarget.currentStatus
                                ? 'Cancel promotion?'
                                : 'Promote restaurant?'}
                        </h4>

                        <p className="text-muted mb-4">
                            {promotionTarget.currentStatus
                                ? 'Are you sure you want to stop promoting this restaurant?'
                                : 'Notice: Promoting your restaurant costs 199.90₪ a month. Would you like to activate premium promotion?'}
                        </p>

                        <div className="d-flex gap-3 justify-content-center">
                            <button
                                type="button"
                                className="btn btn-outline-secondary rounded-pill px-4 fw-bold"
                                onClick={cancelPromotionModal}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className={`btn rounded-pill px-4 fw-bold ${
                                    promotionTarget.currentStatus
                                        ? 'btn-warning text-dark'
                                        : 'btn-primary'
                                }`}
                                onClick={confirmPromotionChange}
                            >
                                {promotionTarget.currentStatus
                                    ? 'Cancel Promotion'
                                    : 'Promote'}
                            </button>
                        </div>
                    </div>
                </div>
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
                            Delete restaurant?
                        </h4>

                        <p className="text-muted mb-4">
                            Are you sure you want to delete this restaurant?
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

            <div className="container py-5 position-relative">
                <h1 className="fw-bold mb-4">Owner Dashboard</h1>

                <section className="restaurant-info card p-4 mb-5 shadow-sm border-0 rounded-4">
                    <h3>My Restaurants</h3>

                    <div className="row">
                        {restaurant && restaurant.length > 0 ? (
                            restaurant.map((res) => (
                                <div key={res._id} className="col-md-4 mb-3">
                                    <div className="card h-100 border-0 shadow-sm position-relative overflow-hidden">
                                        {res.isPromoted && (
                                            <span
                                                className="badge bg-warning text-dark position-absolute fw-bold shadow-sm"
                                                style={{
                                                    top: '10px',
                                                    right: '10px',
                                                    zIndex: 2,
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                ⭐ Promoted
                                            </span>
                                        )}

                                        <img
                                            src={(res.image && res.image.trim() !== '') ? res.image : '/icon.svg'}
                                            className="card-img-top"
                                            alt={res.name}
                                            style={{
                                                height: '150px',
                                                objectFit: (res.image && res.image.trim() !== '') ? 'cover' : 'contain',
                                                backgroundColor: (res.image && res.image.trim() !== '') ? 'transparent' : '#f8f9fa',
                                                padding: (res.image && res.image.trim() !== '') ? '0' : '20px'
                                            }}
                                        />

                                        <div className="card-body d-flex flex-column justify-content-between">
                                            <div>
                                                <h5 className="card-title fw-bold">
                                                    {res.name}
                                                </h5>

                                                <p className="card-text text-muted mb-3">
                                                    {res.cuisine}
                                                </p>
                                            </div>

                                            <div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                                        onClick={() => navigate(`/owner/edit/${res._id}`)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                                        onClick={() => navigate(`/owner/edit/${res._id}/menu`)}
                                                    >
                                                        Menu
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                                        onClick={() => handleDeleteClick(res._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>

                                                <div className="mt-2">
                                                    <button
                                                        type="button"
                                                        className={`btn btn-sm w-100 rounded-pill fw-bold py-2 ${
                                                            res.isPromoted
                                                                ? 'btn-warning text-dark shadow-sm'
                                                                : 'btn-outline-warning text-dark'
                                                        }`}
                                                        onClick={() => handlePromotionClick(res._id, res.isPromoted)}
                                                        style={{ fontSize: '0.85rem' }}
                                                    >
                                                        {res.isPromoted ? '❌ Cancel Promotion' : '⭐ Promote'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">
                                No restaurants found. <Link to="/owner/setup">Create one now!</Link>
                            </p>
                        )}
                    </div>
                </section>

                <section className="menu-management card p-4 shadow-sm border-0 rounded-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>Restaurant Actions</h3>

                        <Link to="/owner/setup" className="btn btn-primary rounded-pill px-4">
                            + Create New Restaurant
                        </Link>
                    </div>

                    <div className="menu-list">
                        <p className="text-muted">
                            {restaurant && restaurant.length > 0
                                ? 'Select a restaurant above to manage its menu items or edit its details.'
                                : "You don't have any restaurants yet. Create your first one to get started!"}
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default OwnerDashboard;