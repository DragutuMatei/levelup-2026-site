import React, { useState, useEffect, useCallback } from 'react';
import api from '../../Utils/api';
import { auth } from '../../Utils/firebase';
import { signOut } from 'firebase/auth';
import './admin.scss';

function AdminDashboard() {
    const [registrations, setRegistrations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('inscrieri');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [selectedReg, setSelectedReg] = useState(null); // Modal data

    // Stats calculations
    const totalTeams = registrations.length;
    const totalParticipants = registrations.reduce((acc, reg) => {
        let count = 1; // teammate1 is mandatory
        if (reg.teammate2) count++;
        return acc + count;
    }, 0);
    const teamsWithOneMember = registrations.filter(reg => !reg.teammate2).length;

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await auth.currentUser?.getIdToken();
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const [regRes, msgRes, admRes] = await Promise.all([
                api.get('/admin/registrations', config),
                api.get('/admin/messages', config),
                api.get('/admin/admins', config)
            ]);

            setRegistrations(regRes.data.data);
            setMessages(msgRes.data.data);
            setAdmins(admRes.data.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                alert('ACCES RESPINS: Contul tău nu are drepturi de administrare.');
                signOut(auth);
                return;
            }
            setError('Eroare la încărcarea datelor. O problemă a apărut la server.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogout = () => signOut(auth);

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            const token = await auth.currentUser?.getIdToken();
            await api.post('/admin/admins', { email: newAdminEmail }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewAdminEmail('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Eroare la adăugarea administratorului.');
        }
    };

    const handleRemoveAdmin = async (email) => {
        if (!window.confirm(`Ești sigur că vrei să elimini accesul pentru ${email}?`)) return;
        try {
            const token = await auth.currentUser?.getIdToken();
            await api.delete(`/admin/admins/${email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Eroare la eliminarea administratorului.');
        }
    };

    const handleRemoveRegistration = async (id, teamName) => {
        if (!window.confirm(`Ești sigur că vrei să ȘTERGI definitiv înscrierea echipei "${teamName}"? DATELE VOR FI PIERDUTE.`)) return;
        try {
            const token = await auth.currentUser?.getIdToken();
            await api.delete(`/admin/registrations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Eroare la ștergerea înscrierii.');
        }
    };

    // Modal Component for Registration Details (Simplified)
    const DetailModal = ({ reg, onClose }) => {
        if (!reg) return null;
        return (
            <div className="hud-modal-overlay" onClick={onClose}>
                <div className="hud-modal-content fade-in" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>DOSAR ECHIPĂ: {reg.teamName}</h2>
                        <button className="close-btn" onClick={onClose}>&times;</button>
                    </div>
                    <div className="modal-body">
                        {/* Member 1 */}
                        <div className="teammate-section">
                            <h3>LIDER ECHIPĂ (MEMBRU 1)</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <div className="label">Nume Complet</div>
                                    <div className="value">{reg.teammate1.fullName || reg.teammate1.name}</div>
                                </div>
                                <div className="info-item">
                                    <div className="label">Email</div>
                                    <div className="value">{reg.teammate1.email}</div>
                                </div>
                                <div className="info-item">
                                    <div className="label">Telefon</div>
                                    <div className="value">{reg.teammate1.phone}</div>
                                </div>
                            </div>
                            {reg.teammate1.cv && (
                                <a href={reg.teammate1.cv.url} target="_blank" rel="noreferrer" className="cv-link-premium">
                                    📄 VEZI CV LIDER
                                </a>
                            )}
                        </div>

                        {/* Member 2 */}
                        {reg.teammate2 ? (
                            <div className="teammate-section">
                                <h3>MEMBRU 2</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <div className="label">Nume Complet</div>
                                        <div className="value">{reg.teammate2.fullName || reg.teammate2.name}</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="label">Email</div>
                                        <div className="value">{reg.teammate2.email}</div>
                                    </div>
                                    <div className="info-item">
                                        <div className="label">Telefon</div>
                                        <div className="value">{reg.teammate2.phone}</div>
                                    </div>
                                </div>
                                {reg.teammate2.cv && (
                                    <a href={reg.teammate2.cv.url} target="_blank" rel="noreferrer" className="cv-link-premium">
                                        📄 VEZI CV MEMBRU 2
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="teammate-section" style={{ opacity: 0.5 }}>
                                <h3>MEMBRU 2</h3>
                                <p>Această echipă are un singur membru înscris.</p>
                            </div>
                        )}

                        <div className="teammate-section">
                            <h3>DATE CONTACT LEAD</h3>
                            <div className="info-item">
                                <div className="label">Email Lead (înregistrat)</div>
                                <div className="value">{reg.emailLead}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-dashboard-page">
            <DetailModal reg={selectedReg} onClose={() => setSelectedReg(null)} />
            <div className="admin-sidebar">
                <button 
                    className={activeTab === 'inscrieri' ? 'active' : ''} 
                    onClick={() => setActiveTab('inscrieri')}
                >
                    Înscrieri
                </button>
                <button 
                    className={activeTab === 'mesaje' ? 'active' : ''} 
                    onClick={() => setActiveTab('mesaje')}
                >
                    Mesaje
                </button>
                <button 
                    className={activeTab === 'admins' ? 'active' : ''} 
                    onClick={() => setActiveTab('admins')}
                >
                    Administrare
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                    Deconectare
                </button>
            </div>

            {/* Main Content Area */}
            <main className="main-viewport">
                <header className="top-bar">
                    <div className="breadcrumb">
                        COMMAND CENTER / <span>{activeTab.toUpperCase()}</span>
                    </div>
                </header>

                <div className="content-scrollable">
                    <div className="content-container">
                        {error && <div className="error-banner">⚠ {error}</div>}

                        {loading ? (
                            <div className="loading-container">
                                <div className="spinner-pixel"></div>
                                <p>SE ÎNCARCĂ DATELE...</p>
                            </div>
                        ) : (
                            <div className="fade-in">
                                {/* TAB 1: INSCRIERI */}
                                {activeTab === 'inscrieri' && (
                                    <div className="tab-content">
                                        {/* Metrics Bar */}
                                        <div className="metrics-bar">
                                            <div className="metric-card">
                                                <div className="m-label">TOTAL ECHIPE</div>
                                                <div className="m-value neon">{totalTeams.toString().padStart(3, '0')}</div>
                                            </div>
                                            <div className="metric-card">
                                                <div className="m-label">TOTAL PARTICIPANȚI</div>
                                                <div className="m-value blue">{totalParticipants.toString().padStart(3, '0')}</div>
                                            </div>
                                            <div className="metric-card">
                                                <div className="m-label">ECHIPE CU 1 MEMBRU</div>
                                                <div className="m-value" style={{ color: '#ff4136' }}>{teamsWithOneMember.toString().padStart(3, '0')}</div>
                                            </div>
                                        </div>

                                        <div className="command-grid">
                                            <div className="grid-header">
                                                <div>NUME ECHIPĂ</div>
                                                <div>EMAIL LEAD</div>
                                                <div>DATA</div>
                                                <div>ACȚIUNI</div>
                                            </div>

                                            {registrations.length === 0 ? (
                                                <div className="empty-state">Nu există înscrieri momentan.</div>
                                            ) : (
                                                registrations.map(reg => (
                                                    <div className="grid-row" key={reg.id}>
                                                        <div className="r-team">{reg.teamName}</div>
                                                        <div className="r-email">{reg.emailLead}</div>
                                                        <div className="r-date">
                                                            {reg.createdAt ? new Date(reg.createdAt._seconds * 1000).toLocaleDateString('ro-RO') : '-'}
                                                        </div>
                                                        <div className="r-actions">
                                                            <button
                                                                className="btn-hud"
                                                                onClick={() => setSelectedReg(reg)}
                                                                title="Vezi Detalii"
                                                            >
                                                                📂 DOSAR
                                                            </button>
                                                            <button
                                                                className="btn-hud delete"
                                                                onClick={() => handleRemoveRegistration(reg.id, reg.teamName)}
                                                                title="Șterge Înscriere"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: MESAJE */}
                                {activeTab === 'mesaje' && (
                                    <div className="tab-content">
                                        <div className="messages-grid">
                                            {messages.length === 0 ? (
                                                <div className="empty-state">Niciun mesaj primit.</div>
                                            ) : (
                                                messages.map(msg => (
                                                    <div className="message-card" key={msg.id}>
                                                        <div className="msg-header">
                                                            <span className="msg-author">{msg.nume || msg.name}</span>
                                                            <span className="msg-date">
                                                                {msg.createdAt ? new Date(msg.createdAt._seconds * 1000).toLocaleDateString() : '-'}
                                                            </span>
                                                        </div>
                                                        <div className="msg-subject">{msg.subiect || msg.subject || 'Fără subiect'}</div>
                                                        <div className="msg-body">{msg.mesaj || msg.message}</div>
                                                        <div className="msg-footer">
                                                            <a href={`mailto:${msg.email}`} className="reply-link">
                                                                {msg.email}
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: ADMINI */}
                                {activeTab === 'admins' && (
                                    <div className="tab-content admin-panel">
                                        <div className="data-card small">
                                            <div className="card-header">
                                                <h2>ADĂUGARE OPERATOR</h2>
                                            </div>
                                            <form onSubmit={handleAddAdmin} className="premium-form">
                                                <input
                                                    type="email"
                                                    placeholder="Introduceți adresa de email..."
                                                    value={newAdminEmail}
                                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                                    required
                                                />
                                                <button type="submit">AUTORIZEAZĂ</button>
                                            </form>

                                            <div className="admin-list-premium">
                                                <h3>OPERATORI ACTIVI</h3>
                                                {admins.map(adm => (
                                                    <div className="admin-row" key={adm.email}>
                                                        <div className="admin-info">
                                                            <div className="admin-avatar">{adm.email[0].toUpperCase()}</div>
                                                            <span>{adm.email}</span>
                                                        </div>
                                                        <button
                                                            className="del-button"
                                                            onClick={() => handleRemoveAdmin(adm.email)}
                                                            title="Elimină acces"
                                                        >
                                                            REVOCĂ
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
