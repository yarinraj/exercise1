import React, { useState, useEffect } from 'react';
import Register from './components/register';
import Navbar from './components/navbar';
import 'bootstrap/dist/css/bootstrap.min.css'; // Globally injecting Bootstrap styles into the application
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [user, setUser] = useState(null);
  // Check if a user session already exists on page load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  
    return (
        <Router>
            <div className="App">
            {/* Dynamic Conditional Rendering: Navbar only displays if user is authenticated */}
             {user && <Navbar user={user} setUser={setUser} />}

            <div className="main-content">
                {!user ? (
                    /* Pass setUser to Register component to authenticate upon success */
                 <Register setUser={setUser} />
                 ) : (
                  /* Main authenticated application view container */
            <div className="container mt-5 text-center">
              <h1>Welcome to bites Dashboard!</h1>
              <p>Main content and restaurant listings will appear here.</p>
            </div>
            )}
             </div>
            </div>
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