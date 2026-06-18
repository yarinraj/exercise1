
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PastOrder.css';

const PastOrders = () => {
    const [orders, setOrders] = useState([]);
    const [restaurantImages, setRestaurantImages] = useState({}); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openOrderId, setOpenOrderId] = useState(null); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrdersAndDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // Fetching all orders
                const response = await fetch('http://localhost:8080/api/orders', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch orders');
                const data = await response.json();
                const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                // Fetching details for each unique restaurant to get real images
                const imagesMap = {};
                const uniqueRestaurantIds = [...new Set(sortedOrders.map(o => o.restaurantId))];
                
                await Promise.all(uniqueRestaurantIds.map(async (id) => {
                    try {
                        const resRes = await fetch(`http://localhost:8080/api/restaurants/${id}`);
                        if (resRes.ok) {
                            const resData = await resRes.json();
                            // Save restaurant image
                            imagesMap[id] = { logo: resData.image, products: {} };
                            // Save individual product images
                            resData.products?.forEach(p => {
                                imagesMap[id].products[p._id || p.productId] = p.image;
                            });
                        }
                    } catch (e) {
                        console.error("Could not fetch details for restaurant", id);
                    }
                }));

                setRestaurantImages(imagesMap);
                setOrders(sortedOrders);
            } catch (err) {
                setError('Could not load your order history.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrdersAndDetails();
    }, []);

    const calculateTotal = (products) => {
        return products.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    };

    const toggleAccordion = (orderId) => {
        setOpenOrderId(openOrderId === orderId ? null : orderId);
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-info" role="status"></div></div>;
    if (error) return <div className="alert alert-danger text-center m-4">{error}</div>;

    return (
        <div className="container py-5 past-orders-container">
            <h3 className="fw-bold text-start mb-4 past-orders-title">Your Orders</h3>
            
            {orders.length === 0 ? (
                <div className="text-center text-muted mt-5">You haven't placed any orders yet 🍔</div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {orders.map((order) => {
                        const isExpanded = openOrderId === order._id;
                        const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        });

                        const restaurantLogo = restaurantImages[order.restaurantId]?.logo || "/icon.svg";
                        const productImages = restaurantImages[order.restaurantId]?.products || {};

                        return (
                            <div key={order._id} className="card border-0 shadow-sm rounded-4 p-3 order-card">
                                
                                {/* Restaurant header row */}
                                <div className="d-flex align-items-center mb-3">
                                    <div className="restaurant-logo-wrapper">
                                        <img src={restaurantLogo} alt="restaurant" className="w-100 h-100 restaurant-logo-img" />
                                    </div>
                                    <div className="text-start ms-3 flex-grow-1">
                                        <h5 className="fw-bold text-dark mb-1">{order.restaurantName}</h5>
                                        <span className="text-muted small">Order delivered • {formattedDate}</span>
                                    </div>
                                </div>

                                <div className="line" />

                                {/* Detailed list layout inside the expanded accordion */}
                                {isExpanded && (
                                    <div className="py-2 animate__animated animate__fadeIn">
                                        <div className="d-flex flex-column gap-3">
                                            {order.products.map((item, idx) => {
                                                const realProdImg = productImages[item.productId] || "/icon.svg";
                                                return (
                                                    <div key={idx} className="d-flex align-items-center justify-content-between py-1">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="product-detail-wrapper">
                                                                <img src={realProdImg} alt={item.name} className="w-100 h-100 product-detail-img" />
                                                            </div>
                                                            <span className="fw-bold text-dark text-start">
                                                                {item.name} <span className="text-muted small fw-normal">x{item.quantity}</span>
                                                            </span>
                                                        </div>
                                                        <span className="fw-bold text-dark">₪{item.price}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="line" />
                                    </div>
                                )}

                                {/* Shortcut preview image line (Visible only when accordion is closed) */}
                                {!isExpanded && (
                                    <div className="d-flex gap-2 my-2 align-items-center overflow-hidden shortcut-images-container">
                                        {order.products.slice(0, 4).map((item, idx) => {
                                            if (idx === 3 && order.products.length > 4) {
                                                return (
                                                    <div key={idx} className="d-flex align-items-center justify-content-center fw-bold text-muted bg-light border rounded-3 more-items-indicator">
                                                        ...
                                                    </div>
                                                );
                                            }
                                            const realProdImg = productImages[item.productId] || "/icon.svg";
                                            return (
                                                <div key={idx} className="product-shortcut-wrapper">
                                                    <img src={realProdImg} alt="product shortcut" className="w-100 h-100 product-shortcut-img" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Total price line */}
                                <div className="d-flex justify-content-start align-items-center fw-bold my-2 text-dark fs-5">
                                    <span>Total: ₪{calculateTotal(order.products)}</span>
                                </div>

                                {/* buttons */}
                                <div className="d-flex gap-2 mt-2">
                                    <button 
                                        onClick={() => toggleAccordion(order._id)} 
                                        className="btn flex-grow-1 fw-bold rounded-3 py-2 btn-show-items"
                                    >
                                        {isExpanded ? 'Hide items' : 'Show items'}
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/restaurant/${order.restaurantId}`)} 
                                        className="btn flex-grow-1 text-white fw-bold rounded-3 py-2 btn-visit-restaurant"
                                    >
                                        Visit restaurant
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PastOrders;