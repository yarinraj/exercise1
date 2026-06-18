import React from 'react';

const ProductCard = ({ product }) => {
    return (
        <div className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden hover-card" style={{ background: 'var(--card-bg, #ffffff)', height: '170px', cursor: 'pointer' }}>   
                <div className="row g-0 h-100">
                    
                    <div className="col-5 h-100" style={{ height: '95px' }}>
                        {product.image ? (
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-100 h-100" 
                                style={{ objectFit: 'cover', height: '100%' }}
                            />
                        ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgb(248, 249, 250)' }}>
                                <img 
                                    src="/icon.svg" 
                                    alt="Bites default"
                                    className="w-50 h-50" 
                                    style={{ objectFit: 'contain' }} 
                                />
                            </div>
                        )}
                    </div>

                    <div className="col-7 p-2 d-flex flex-column justify-content-center text-start h-100" style={{ minWidth: 0 }}>
                        <span className="fw-bold fs-5 mb-2" style={{ color: '#00c2e8', lineHeight: '1.2' }}>
                            ₪{product.price}
                        </span>
                        
                        <h6 className="fw-bold text-dark mb-0 text-truncate" title={product.name} style={{ lineHeight: '1.3' }}>
                            {product.name}
                        </h6>
                        
                        <span className="text-muted small text-truncate" title={`${product.restaurantName} | ${product.restaurantAddress}`} style={{ fontSize: '15px', marginTop: '2px' }}>
                            {product.restaurantName} | {product.restaurantAddress}
                        </span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductCard;