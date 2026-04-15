import React, { useState } from 'react';
import api from '../Utils/api';
import './contact.scss';

function Contact() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle | submitting | success | error
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMsg('');

        if (!form.name || !form.email || !form.subject || !form.message) {
            setErrorMsg('Toate campurile sunt obligatorii.');
            setStatus('error');
            return;
        }

        try {
            await api.post('/contact', form);
            setStatus('success');
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            console.error('Error sending message:', err);
            const msg = err.response?.data?.error || 'A aparut o eroare la trimiterea mesajului. Incearca din nou.';
            setErrorMsg(msg);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="contact-page">
                <div className="page-content">
                    <div className="success-window">
                        <div className="window-header" style={{padding: "10px"}}>
                            <span className="title">MESAJ TRIMIS</span>
                            <div className="controls">
                                <span className="ctrl minimize"></span>
                                <span className="ctrl maximize"></span>
                                <span className="ctrl close"></span>
                            </div>
                        </div>
                        <div className="window-body">
                            <div className="success-icon">✓</div>
                            <h2>MULTUMIM!</h2>
                            <p>Mesajul tau a fost trimis cu succes.</p>
                            <p>Te vom contacta in cel mai scurt timp posibil.</p>
                            <button className="retry-btn" onClick={() => setStatus('idle')}>
                                TRIMITE ALT MESAJ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="contact-page">
            <div className="page-content">
                <div className="contact-header">
                    <h1 className="glitch-text">CONTACT</h1>
                    <p>Ai intrebari? Scrie-ne un mesaj!</p>
                </div>

                <div className="contact-container">
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-window">
                            <div className="window-header">
                                <span className="title">FORMULAR CONTACT</span>
                                <div className="controls">
                                    <span className="ctrl minimize"></span>
                                    <span className="ctrl maximize"></span>
                                    <span className="ctrl close"></span>
                                </div>
                            </div>
                            <div className="window-body">
                                <div className="form-group">
                                    <label htmlFor="name">Nume si prenume</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Numele tau"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="email@exemplu.com"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="subject">Subiect</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={form.subject}
                                        onChange={handleChange}
                                        placeholder="Despre ce este vorba?"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="message">Mesaj</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        placeholder="Scrie mesajul tau aici..."
                                        rows="5"
                                        required
                                    ></textarea>
                                </div>

                                {status === 'error' && (
                                    <div className="error-msg">
                                        <span>⚠</span> {errorMsg}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={status === 'submitting'}
                                >
                                    {status === 'submitting' ? 'SE TRIMITE...' : 'TRIMITE MESAJUL'}
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="contact-info-boxes" style={{ transitionDelay: '0.1s' }}>
                        <div className="info-box">
                            <h4>EMAIL</h4>
                            <p><a href="mailto:office@osfiir.ro">office@osfiir.ro</a></p>
                        </div>
                        <div className="info-box">
                            <h4>INSTAGRAM</h4>
                            <p><a href="https://www.instagram.com/osfiir/" target="_blank" rel="noopener noreferrer">@osfiir</a></p>
                        </div>
                        <div className="info-box">
                            <h4>LOCATIE</h4>
                            <p>Facultatea de Inginerie Industriala si Robotica</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
