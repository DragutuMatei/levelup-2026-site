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

    // Newsletter State
    const [mailingList, setMailingList] = useState([]);
    const [newEmailInput, setNewEmailInput] = useState('');
    const [bulkEmailInput, setBulkEmailInput] = useState('');
    const [listEditMode, setListEditMode] = useState('list'); // 'list' | 'bulk'
    const [campaignSubject, setCampaignSubject] = useState('');
    const [campaignHtml, setCampaignHtml] = useState('');
    const [campaignTarget, setCampaignTarget] = useState('all'); // 'all' | 'selected'
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [isSending, setIsSending] = useState(false);
    
    // Search States
    const [searchDbTerm, setSearchDbTerm] = useState('');
    const [searchManualTerm, setSearchManualTerm] = useState('');

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

            const [regRes, msgRes, admRes, mailRes] = await Promise.all([
                api.get('/admin/registrations', config),
                api.get('/admin/messages', config),
                api.get('/admin/admins', config),
                api.get('/admin/mailing-list', config)
            ]);

            setRegistrations(regRes.data.data);
            setMessages(msgRes.data.data);
            setAdmins(admRes.data.data);
            setMailingList(mailRes.data.data || []);
            setBulkEmailInput((mailRes.data.data || []).join(',\n'));
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                alert('ACCES RESPINS: Contul tau nu are drepturi de administrare.');
                signOut(auth);
                return;
            }
            setError('Eroare la incarcarea datelor. O problema a aparut la server.');
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
            alert(err.response?.data?.message || 'Eroare la adaugarea administratorului.');
        }
    };

    const handleRemoveAdmin = async (email) => {
        if (!window.confirm(`Esti sigur ca vrei sa elimini accesul pentru ${email}?`)) return;
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
        if (!window.confirm(`Esti sigur ca vrei sa STERGI definitiv inscrierea echipei "${teamName}"? DATELE VOR FI PIERDUTE.`)) return;
        try {
            const token = await auth.currentUser?.getIdToken();
            await api.delete(`/admin/registrations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Eroare la stergerea inscrierii.');
        }
    };

    // --- NEWSLETTER METHODS ---
    const commitMailingList = async (newList) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            await api.put('/admin/mailing-list', { emails: newList }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMailingList(newList);
            setBulkEmailInput(newList.join(',\n'));
        } catch (err) {
            alert(err.response?.data?.message || 'Eroare la salvarea listei.');
        }
    };

    const handleAddSingleEmail = (e) => {
        e.preventDefault();
        const trimmed = newEmailInput.trim();
        if (!trimmed) return;
        if (mailingList.includes(trimmed)) {
            alert('Email-ul exista deja in lista!');
            return;
        }
        const updated = [...mailingList, trimmed];
        commitMailingList(updated);
        setNewEmailInput('');
    };

    const handleRemoveSingleEmail = (email) => {
        if (!window.confirm(`Stergi adresa ${email}?`)) return;
        const updated = mailingList.filter(e => e !== email);
        commitMailingList(updated);
    };

    const handleBulkSave = () => {
        const rawArray = bulkEmailInput.split(',').map(e => e.trim()).filter(e => e);
        const uniqueList = [...new Set(rawArray)]; // Prevent duplicates
        commitMailingList(uniqueList);
        alert('Lista a fost actualizata in masa cu succes!');
    };

    const handleSendCampaign = async (e) => {
        e.preventDefault();
        if (!campaignSubject || !campaignHtml) {
            alert('Subiectul si continutul HTML sunt obligatorii!');
            return;
        }

        let recipients = [];
        if (campaignTarget === 'all') {
            recipients = mailingList;
        } else {
            recipients = selectedRecipients;
        }

        if (recipients.length === 0) {
            alert('Nu ai selectat niciun destinatar!');
            return;
        }

        if (!window.confirm(`Se va trimite campania catre ${recipients.length} destinatari. Esti sigur?`)) return;

        setIsSending(true);
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await api.post('/admin/campaign/send', {
                subject: campaignSubject,
                htmlContent: campaignHtml,
                recipients: recipients
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`Trimise cu succes: ${res.data.successCount}. Erori: ${res.data.failCount}.`);
            // Reset for next campaign
            setCampaignSubject('');
            setCampaignHtml('');
            setSelectedRecipients([]);
        } catch (err) {
            alert(err.response?.data?.message || 'Eroare la trimiterea e-mailurilor.');
        } finally {
            setIsSending(false);
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
                    Inscrieri
                </button>
                <button 
                    className={activeTab === 'mesaje' ? 'active' : ''} 
                    onClick={() => setActiveTab('mesaje')}
                >
                    Mesaje
                </button>
                <button 
                    className={activeTab === 'newsletter' ? 'active' : ''} 
                    onClick={() => setActiveTab('newsletter')}
                >
                    Newsletter
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
                                <p>SE INCARCA DATELE...</p>
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
                                                <div className="m-label">TOTAL PARTICIPANTI</div>
                                                <div className="m-value blue">{totalParticipants.toString().padStart(3, '0')}</div>
                                            </div>
                                            <div className="metric-card">
                                                <div className="m-label">ECHIPE CU 1 MEMBRU</div>
                                                <div className="m-value" style={{ color: '#ff4136' }}>{teamsWithOneMember.toString().padStart(3, '0')}</div>
                                            </div>
                                        </div>

                                        <div className="command-grid">
                                            <div className="grid-header">
                                                <div>NUME ECHIPA</div>
                                                <div>EMAIL LEAD</div>
                                                <div>DATA</div>
                                                <div>ACTIUNI</div>
                                            </div>

                                            {registrations.length === 0 ? (
                                                <div className="empty-state">Nu exista inscrieri momentan.</div>
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
                                                                title="Sterge Inscriere"
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

                                {/* TAB 3: NEWSLETTER */}
                                {activeTab === 'newsletter' && (
                                    <div className="tab-content newsletter-panel">
                                        <div className="newsletter-grid">
                                            {/* Mailing List Manager */}
                                            <div className="data-card">
                                                <h2>Baza de Date Email-uri</h2>
                                                
                                                <div className="edit-mode-toggles">
                                                    <button className={listEditMode === 'list' ? 'active' : ''} onClick={() => setListEditMode('list')}>Single CRUD</button>
                                                    <button className={listEditMode === 'bulk' ? 'active' : ''} onClick={() => setListEditMode('bulk')}>Bulk Edit</button>
                                                </div>

                                                {listEditMode === 'list' ? (
                                                    <div className="list-editor">
                                                        <form onSubmit={handleAddSingleEmail} className="premium-form">
                                                            <input type="email" placeholder="Adauga email..." value={newEmailInput} onChange={e => setNewEmailInput(e.target.value)} required />
                                                            <button type="submit">ADAUGA</button>
                                                        </form>
                                                        
                                                        <div className="search-bar">
                                                            <input 
                                                                type="text" 
                                                                placeholder="Cauta in baza de date..." 
                                                                value={searchDbTerm} 
                                                                onChange={e => setSearchDbTerm(e.target.value)} 
                                                            />
                                                        </div>

                                                        <div className="email-list-container">
                                                            {mailingList.filter(e => e.toLowerCase().includes(searchDbTerm.toLowerCase())).map(email => (
                                                                <div className="admin-row email-row" key={email}>
                                                                    <span>{email}</span>
                                                                    <button className="del-button" onClick={() => handleRemoveSingleEmail(email)}>STERGE</button>
                                                                </div>
                                                            ))}
                                                            {mailingList.filter(e => e.toLowerCase().includes(searchDbTerm.toLowerCase())).length === 0 && <p className="empty-state">Nu exista rezultate.</p>}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bulk-editor">
                                                        <p className="hint">Adauga emailurile separate prin virgula (,).</p>
                                                        <textarea 
                                                            className="bulk-textarea"
                                                            value={bulkEmailInput}
                                                            onChange={e => setBulkEmailInput(e.target.value)}
                                                            rows="10"
                                                        ></textarea>
                                                        <button className="primary-btn" onClick={handleBulkSave}>SALVEAZA LISTA</button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Campaign Sender */}
                                            <div className="data-card">
                                                <h2>Expediere Campanie</h2>
                                                <form className="campaign-form" onSubmit={handleSendCampaign}>
                                                    <div className="form-group">
                                                        <label>Subiect Email</label>
                                                        <input type="text" value={campaignSubject} onChange={e => setCampaignSubject(e.target.value)} placeholder="Introdu subiectul campaniei" required />
                                                    </div>
                                                    
                                                    <div className="form-group">
                                                        <label>Continut Email (Document HTML)</label>
                                                        <textarea 
                                                            className="html-textarea"
                                                            value={campaignHtml}
                                                            onChange={e => setCampaignHtml(e.target.value)}
                                                            placeholder="Paste aici documentul complet HTML..."
                                                            rows="10"
                                                            required
                                                        ></textarea>
                                                    </div>

                                                    <div className="form-group">
                                                        <label>Destinatari</label>
                                                        <div className="radio-group">
                                                            <label>
                                                                <input type="radio" checked={campaignTarget === 'all'} onChange={() => setCampaignTarget('all')} />
                                                                Catre toti ({mailingList.length})
                                                            </label>
                                                            <label>
                                                                <input type="radio" checked={campaignTarget === 'selected'} onChange={() => setCampaignTarget('selected')} />
                                                                Selecteaza manual
                                                            </label>
                                                        </div>
                                                        
                                                        {campaignTarget === 'selected' && (
                                                            <div className="manual-select-list">
                                                                <div className="search-bar">
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="Cauta destinatar..." 
                                                                        value={searchManualTerm} 
                                                                        onChange={e => setSearchManualTerm(e.target.value)} 
                                                                    />
                                                                </div>
                                                                <div className="checkboxes-scroll-area">
                                                                    {mailingList.filter(e => e.toLowerCase().includes(searchManualTerm.toLowerCase())).map(email => (
                                                                        <label key={email} className="checkbox-label">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                checked={selectedRecipients.includes(email)}
                                                                                onChange={(e) => {
                                                                                    if(e.target.checked) setSelectedRecipients(prev => [...prev, email]);
                                                                                    else setSelectedRecipients(prev => prev.filter(r => r !== email));
                                                                                }}
                                                                            />
                                                                            {email}
                                                                        </label>
                                                                    ))}
                                                                    {mailingList.filter(e => e.toLowerCase().includes(searchManualTerm.toLowerCase())).length === 0 && <p className="empty-state">Nu exista rezultate.</p>}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <button type="submit" className="primary-btn send-btn" disabled={isSending}>
                                                        {isSending ? 'SE TRIMITE...' : 'EXPEDIAZA CAMPANIA'}
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: ADMINI */}
                                {activeTab === 'admins' && (
                                    <div className="tab-content admin-panel">
                                        <div className="data-card small">
                                            <div className="card-header">
                                                <h2>ADAUGARE OPERATOR</h2>
                                            </div>
                                            <form onSubmit={handleAddAdmin} className="premium-form">
                                                <input
                                                    type="email"
                                                    placeholder="Introduceti adresa de email..."
                                                    value={newAdminEmail}
                                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                                    required
                                                />
                                                <button type="submit">AUTORIZEAZA</button>
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
                                                            title="Elimina acces"
                                                        >
                                                            REVOCA
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
