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
        //NEED TO CHANGE TO LOGIN PAGE
            to="/register" 
            replace 
            state={{ fromUnauthorized: true }} 
        />
    );
};

export default ProtectedRoute;


//WHEN THE LOGIN CREATED: ADD THERE :
// TO THE BEGGINING OF THE REGISTER FUNC 
// const location = useLocation();
//     const [showAlert, setShowAlert] = useState(false);

//     useEffect(() => {
//         // Check if the user was redirected here from an unauthorized access attempt
//         if (location.state?.fromUnauthorized) {
//             setShowAlert(true);

//             // Hide the alert automatically after 60 seconds (1 minute)
//             const timer = setTimeout(() => {
//                 setShowAlert(false);
//             }, 60000);

//             return () => clearTimeout(timer);
//         }
//     }, [location]);

//TO THE BEGGINING OF THE RETURN PART, INSIDE THE DIV : + NEED TO ADD SHADING
// {showAlert && (
//                 <div 
//                     className="alert alert-danger text-center fixed-top m-3 shadow" 
//                     style={{ zIndex: 9999, left: '50%', transform: 'translateX(-50%)', maxWidth: '400px' }}
//                     role="alert"
//                 >
//                     Authorized for logged-in users only
//                 </div>
//             )}