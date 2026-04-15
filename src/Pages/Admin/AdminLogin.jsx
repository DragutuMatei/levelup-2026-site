import React, { useState } from 'react';
import { auth, googleProvider } from '../../Utils/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../Utils/api';
import './admin.scss';

function AdminLogin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from?.pathname || "/admin/dashboard";

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const token = await result.user.getIdToken();
            
            // Verificăm permisiunile de admin imediat, FĂRĂ să părăsim pagina de login
            await api.get('/admin/verify', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Dacă API-ul întoarce status 200, userul e valid. Abia acum navigăm către dashboard.
            navigate(from, { replace: true });
        } catch (err) {
            console.error('Login error:', err);
            
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError('ACCES RESPINS: Acest email nu are drepturi de administrare.');
            } else {
                setError('Eroare de sistem. Te rugăm să încerci din nou.');
            }
            // Deconectăm instant sesiunea dacă ceva e în neregulă
            await signOut(auth);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="login-window">
                <div className="window-header">
                    <span className="title">ADMIN ACCESS</span>
                    <div className="controls">
                        <span className="ctrl minimize"></span>
                        <span className="ctrl maximize"></span>
                        <span className="ctrl close"></span>
                    </div>
                </div>
                <div className="window-body">
                    <div className="lock-icon">🔒</div>
                    <h1>RESTRICTED AREA</h1>
                    <p>Conectează-te cu email-ul OSFIIR / LevelUp pentru a accesa panoul de control.</p>
                    
                    {error && <div className="error-msg">⚠ {error}</div>}

                    <button 
                        className="login-btn" 
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        {loading ? 'SE ÎNCARCĂ...' : 'CONECTARE CU GOOGLE'}
                    </button>
                    
                    <div className="hint text-center">
                        Accesul este permis doar membrilor autorizați.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
