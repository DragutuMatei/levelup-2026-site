import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Utils/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading-screen" style={{height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000"}}>
                <div className="loader">INCĂRCARE...</div>
            </div>
        );
    }

    if (!user) {
        // Redirecționează la login dacă nu este autentificat
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // Notă: Verificarea dacă email-ul este în colecția 'admins' 
    // se va face la nivel de API (backend-ul va returna 403 Forbidden).
    // Putem adăuga și aici o verificare dacă dorim o experiență mai fluidă.

    return children;
};

export default ProtectedRoute;
