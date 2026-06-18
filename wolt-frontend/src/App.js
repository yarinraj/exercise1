import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import Register from './components/register';
import Login from './components/Login';
import Navbar from './components/navbar';
import { GlobalCartTrigger } from './components/GlobalCartTrigger';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/HomePage';
import RestaurantFeed from './components/RestaurantFeed';
import RestaurantMenu from './components/RestaurantMenu';
import PastOrders from './components/PastOrders'

import RestaurantSetupForm from './components/OwnerDashboard/RestaurantSetupForm';
import OwnerDashboard from './components/OwnerDashboard/OwnerDashboard';
import EditRestaurantForm from './components/OwnerDashboard/EditRestaurantForm';
import RestaurantMenuManager from './components/OwnerDashboard/RestaurantMenuManager';
import AddDishForm from './components/OwnerDashboard/AddDishForm';
import EditDishForm from './components/OwnerDashboard/EditDishForm';

import { CartProvider } from './context/cart';
import PastOrders from './components/PastOrders';

// Sub-component to handle conditional Navbar and Cart rendering based on the active path
const NavigationLayout = ({ user, setUser, searchQuery, setSearchQuery }) => {
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase().replace(/\/$/, '');
  const authRoutes = ['/login', '/register', '/signup'];

  const shouldHideElements = authRoutes.includes(currentPath);

  return (
    <>
      {!shouldHideElements && (
        <>
          <Navbar
            user={user}
            setUser={setUser}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <GlobalCartTrigger />
        </>
      )}
    </>
  );
};

// This component is inside Router, so it can use useLocation
const AppContent = ({ user, setUser, searchQuery, setSearchQuery }) => {
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase().replace(/\/$/, '');

  const authRoutes = ['/login', '/register', '/signup'];
  const isAuthPage = authRoutes.includes(currentPath);

  // Login/Register pages:
  // no Navbar, no CartTrigger, no main-content wrapper.
  // This lets auth.css control the page background fully.
  if (isAuthPage) {
    return (
      <div className="App auth-app">
        <Routes>
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
        </Routes>
      </div>
    );
  }

  // Regular pages:
  // these get the warm cream background from App.css.
  return (
    <div className="App regular-app">
      <NavigationLayout
        user={user}
        setUser={setUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="main-content">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}

          {/* 1. Main Home Page */}
          <Route path="/" element={<HomePage user={user} />} />

          {/* 2. Restaurant Feed - open to all users and guests */}
          <Route
            path="/restaurants"
            element={<RestaurantFeed searchQuery={searchQuery} />}
          />

          {/* 3. Specific Restaurant Menu - open to all users and guests */}
          <Route path="/restaurant/:id" element={<RestaurantMenu />} />

          {/* fallback redirects for auth pages if reached from regular branch */}
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

       {/* --- PROTECTED ROUTES - logged-in users only --- */}
<Route element={<ProtectedRoute />}>
  <Route path="/past-orders" element={<PastOrders />} />

  {/* Owner routes */}
  <Route path="/owner/setup" element={<RestaurantSetupForm />} />
  <Route path="/owner/dashboard" element={<OwnerDashboard />} />

  <Route path="/owner/edit/:id" element={<EditRestaurantForm />} />

  <Route
    path="/owner/edit/:id/menu"
    element={<RestaurantMenuManager />}
  />

  <Route
    path="/owner/edit/:id/menu/add"
    element={<AddDishForm />}
  />

  <Route
    path="/owner/edit/:id/menu/edit/:productId"
    element={<EditDishForm />}
  />
</Route>

          {/* --- 404 PAGE --- */}
          <Route
            path="*"
            element={
              <div className="d-flex align-items-center justify-content-center error-page-container">
                <div className="text-center d-flex flex-column align-items-center justify-content-center shadow-sm bg-white rounded-circle error-circle-card">
                  <h2 className="fw-bold mb-2 fs-1 error-title">404</h2>

                  <p className="text-muted small mb-3 px-4 error-text">
                    page not found
                  </p>

                  <a
                    href="/"
                    className="btn text-white fw-bold px-4 py-2 rounded-pill shadow-sm error-btn-home"
                  >
                    back to home page
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

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
      <CartProvider>
        <AppContent
          user={user}
          setUser={setUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </CartProvider>
    </Router>
  );
};

export default App;