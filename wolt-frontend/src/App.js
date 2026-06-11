import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/register';
import ProtectedRoute from './components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css'; // Globally injecting Bootstrap styles into the application

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                {/* if will be a homepage - <Route path="/" element={<HomePage />} /> */}
                <Route path="/register" element={<Register />} />
                {/* <Route path="/login" element={<Login />} /> */}

                {/* Protected Routes - Only accessible with a token */}
                <Route element={<ProtectedRoute />}>
                    {/* example below to pages that force users to be connected */}
                    {/* <Route path="/orders" element={<Orders />} /> */}
                </Route>
            </Routes>
        </Router>
    );
};

export default App;