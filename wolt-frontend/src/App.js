import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Register from './components/register';
import Login from './components/Login'; 
import Navbar from './components/navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import RestaurantFeed from "./components/RestaurantFeed";
import HomePage from './components/HomePage';


const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
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
        <Navbar 
          user={user} 
          setUser={setUser} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />

            {/* public routes */}
            <Route 
              path="/login" 
              element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/signup" 
              element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} 
            />

            {/* protected routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/restaurants" element={<RestaurantFeed searchQuery={searchQuery} />} />
            </Route>
            
            {/* a 404 page for unknown routes*/}
            <Route path="*" element={
              <div className="d-flex align-items-center justify-content-center error-page-container">
                  <div className="text-center d-flex flex-column align-items-center justify-content-center shadow-sm bg-white rounded-circle error-circle-card">
                      <h2 className="fw-bold mb-2 fs-1 error-title">404</h2>
                      <p className="text-muted small mb-3 px-4 error-text">העמוד שחיפשת לא קיים</p>
                      <a href="/" className="btn text-white fw-bold px-4 py-2 rounded-pill shadow-sm error-btn-home">חזרה לעמוד הבית</a>
                  </div>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
