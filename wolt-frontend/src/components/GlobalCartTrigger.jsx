import React, { useState, useEffect } from 'react';
import { useCart } from '../context/cart';
import { CartSidebar } from './cartSidebar';

export const GlobalCartTrigger = () => {
    const { totalItems, totalPrice, cartItems } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);
    useEffect(() => {
        if (!cartItems || cartItems.length === 0) {
            setIsCartOpen(false);
        }
    }, [cartItems]);

    if (!cartItems || cartItems.length === 0) return null;

    return (
        <>
            <button
                onClick={() => setIsCartOpen(true)}
                className="position-fixed d-flex align-items-center gap-3 px-3 py-2 rounded-pill shadow border-0"
                style={{
                    top: '95px',
                    right: '25px',
                    zIndex: 1020,
                    backgroundColor: '#00c2e8',
                    color: '#0b1d2e',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.04)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
            >
                <div className="d-flex align-items-center justify-content-center rounded-circle text-white"
                    style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#0b1d2e',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                    }}>
                    {totalItems}
                </div>

                <span>Show items</span>

                <span style={{ borderLeft: '1px solid rgba(0, 0, 0, 0.15)', paddingLeft: '12px' }}>
                    ₪{(totalPrice || 0).toFixed(2)}
                </span>
            </button>

            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
};