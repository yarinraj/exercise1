import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token');
    const location = useLocation();

    // If token exists, render the protected content
    if (token) {
        return <Outlet />;
    }

    // If not, redirect to Login and pass the unauthorized flag via router state
    return (
        <Navigate 
            to="/login" 
            replace 
            state={{ fromProtected: true, fromUnauthorized: true }} 
        />
    );
};

export default ProtectedRoute;