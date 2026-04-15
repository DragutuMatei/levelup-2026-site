import React, { useState, useRef } from 'react';
import api from '../Utils/api';
import './inscriere.scss';

function Inscriere() {
    const [form, setForm] = useState({
        email: '',
        teamName: '',
        t1Name: '',
        t1Email: '',
        t1Phone: '',
        t2Name: '',
        t2Email: '',
        t2Phone: '',
        gdprConsent: false,
    });

    const [cv1, setCv1] = useState(null);
    const [cv2, setCv2] = useState(null);
    const [status, setStatus] = useState('idle'); // idle | submitting | success | error
    const [errorMsg, setErrorMsg] = useState('');
    const [errors, setErrors] = useState({});
    const cv1Ref = useRef(null);
    const cv2Ref = useRef(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user changes input
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMsg('');

        // Validare
        const newErrors = {};
        if (!form.email) newErrors.email = 'Email-ul este obligatoriu.';
        if (!form.teamName) newErrors.teamName = 'Numele echipei este obligatoriu.';
        if (!form.t1Name) newErrors.t1Name = 'Numele este obligatoriu.';
        if (!form.t1Email) newErrors.t1Email = 'Email-ul este obligatoriu.';
        if (!form.t1Phone) newErrors.t1Phone = 'Numarul de telefon este obligatoriu.';
        if (!cv1) newErrors.cv1 = 'Trebuie sa incarci un CV.';
        if (!form.gdprConsent) newErrors.gdprConsent = 'Trebuie sa accepti termenii GDPR.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setErrorMsg('Te rugam sa corectezi erorile marcate.');
            setStatus('error');
            // Scroll to first error
            const firstErrorField = Object.keys(newErrors)[0];
            const element = document.getElementById(firstErrorField) || document.querySelector(`[name="${firstErrorField}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        try {
            // Pregatim FormData pentru Backend (Multipart/form-data)
            const formData = new FormData();
            formData.append('emailLead', form.email);
            formData.append('teamName', form.teamName);
            formData.append('gdprConsent', form.gdprConsent);

            // Teammate 1 Data
            formData.append('teammate1', JSON.stringify({
                name: form.t1Name,
                email: form.t1Email,
                phone: form.t1Phone
            }));
            formData.append('cv1', cv1);

            // Teammate 2 Data (optional)
            if (form.t2Name || form.t2Email || form.t2Phone || cv2) {
                formData.append('teammate2', JSON.stringify({
                    name: form.t2Name || null,
                    email: form.t2Email || null,
                    phone: form.t2Phone || null
                }));
                if (cv2) formData.append('cv2', cv2);
            }

            await api.post('/inscriere', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setStatus('success');

            // Reset form
            setForm({
                email: '', teamName: '',
                t1Name: '', t1Email: '', t1Phone: '',
                t2Name: '', t2Email: '', t2Phone: '',
                gdprConsent: false,
            });
            setCv1(null);
            setCv2(null);
            if (cv1Ref.current) cv1Ref.current.value = '';
            if (cv2Ref.current) cv2Ref.current.value = '';

        } catch (err) {
            console.error('Eroare inscriere:', err);
            const msg = err.response?.data?.message || err.response?.data?.error || 'A aparut o eroare. Incearca din nou.';
            setErrorMsg(msg);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="inscriere-page">
                <div className="page-content">
                    <div className="success-window">
                        <div className="window-header">
                            <span className="title">SUCCES</span>
                            <div className="controls">
                                <span className="ctrl minimize"></span>
                                <span className="ctrl maximize"></span>
                                <span className="ctrl close"></span>
                            </div>
                        </div>
                        <div className="window-body">
                            <div className="success-icon">✓</div>
                            <h2>INSCRIERE COMPLETA!</h2>
                            <p>Echipa ta a fost inregistrata cu succes.</p>
                            <p>Vei primi un email de confirmare in curand.</p>
                            <button className="retry-btn" onClick={() => setStatus('idle')}>
                                INSCRIE ALTA ECHIPA
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="inscriere-page">
            <div className="page-content">
                <div className="inscriere-header">
                    <h1 className="glitch-text">INSCRIERE</h1>
                    <p>Completeaza formularul pentru a te inscrie la Level UP</p>
                    <p className="deadline-note">Deadline inscrieri: <strong>3 Mai 2026</strong></p>
                </div>

                <div className="inscriere-info" style={{ transitionDelay: '0.1s' }}>
                    <div className="info-window">
                        <div className="window-header">
                            <span className="title">DESPRE LEVEL UP</span>
                            <div className="controls">
                                <span className="ctrl minimize"></span>
                                <span className="ctrl maximize"></span>
                                <span className="ctrl close"></span>
                            </div>
                        </div>
                        <div className="window-body">
                            <p>Level UP este un joc interactiv de tip co-op asimetric, in care doua persoane lucreaza impreuna pentru a rezolva puzzle-uri IT. Fiecare jucator vede informatii diferite si trebuie sa comunice eficient pentru a ajunge la solutia corecta.</p>
                            <p>Nu este un joc de reflexe, ci un test de logica si colaborare. Vei parcurge mai multe etape tematice, iar fiecare nivel trebuie rezolvat prin identificarea unui raspuns corect.</p>
                            <p>Pe parcurs, iti vei dezvolta abilitatile de problem solving si critical thinking, fiind pus in situatii care necesita analizarea mai multor informatii, comunicare clara si luarea deciziilor sub presiune.</p>
                            <p className="highlight">Participarea se face in echipe de 2 persoane (te poti inscrie si individual, iar noi te ajutam sa iti gasesti un coechipier).</p>
                            <p className="goal"><span className="goal-label">SCOP:</span> sa inveti si sa te distrezi</p>
                        </div>
                    </div>
                </div>

                <form className="inscriere-form" style={{ transitionDelay: '0.2s' }} onSubmit={handleSubmit}>
                    <div className="form-window">
                        <div className="window-header">
                            <span className="title">FORMULAR inSCRIERE</span>
                            <div className="controls">
                                <span className="ctrl minimize"></span>
                                <span className="ctrl maximize"></span>
                                <span className="ctrl close"></span>
                            </div>
                        </div>
                        <div className="window-body">

                            {/* Email & Team Name */}
                            <div className="form-section">
                                <div className="section-title">
                                    <span className="pixel-arrow">►</span> DATE GENERALE
                                </div>
                                <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="email@exemplu.com"
                                    />
                                    {errors.email && <span className="error-text">{errors.email}</span>}
                                </div>
                                <div className={`form-group ${errors.teamName ? 'has-error' : ''}`}>
                                    <label htmlFor="teamName">Nume echipa *</label>
                                    <input
                                        type="text"
                                        id="teamName"
                                        name="teamName"
                                        value={form.teamName}
                                        onChange={handleChange}
                                        placeholder="Numele echipei tale"
                                    />
                                    {errors.teamName && <span className="error-text">{errors.teamName}</span>}
                                </div>
                            </div>

                            {/* Teammate 1 */}
                            <div className="form-section">
                                <div className="section-title">
                                    <span className="pixel-arrow">►</span> COECHIPIER 1 (obligatoriu)
                                </div>
                                <div className={`form-group ${errors.t1Name ? 'has-error' : ''}`}>
                                    <label htmlFor="t1Name">Nume si prenume *</label>
                                    <input
                                        type="text"
                                        id="t1Name"
                                        name="t1Name"
                                        value={form.t1Name}
                                        onChange={handleChange}
                                        placeholder="Nume si prenume"
                                    />
                                    {errors.t1Name && <span className="error-text">{errors.t1Name}</span>}
                                </div>
                                <div className={`form-group ${errors.t1Email ? 'has-error' : ''}`}>
                                    <label htmlFor="t1Email">Adresa de e-mail *</label>
                                    <input
                                        type="email"
                                        id="t1Email"
                                        name="t1Email"
                                        value={form.t1Email}
                                        onChange={handleChange}
                                        placeholder="email@exemplu.com"
                                    />
                                    {errors.t1Email && <span className="error-text">{errors.t1Email}</span>}
                                </div>
                                <div className={`form-group ${errors.t1Phone ? 'has-error' : ''}`}>
                                    <label htmlFor="t1Phone">Numar de telefon *</label>
                                    <input
                                        type="tel"
                                        id="t1Phone"
                                        name="t1Phone"
                                        value={form.t1Phone}
                                        onChange={handleChange}
                                        placeholder="07XX XXX XXX"
                                    />
                                    {errors.t1Phone && <span className="error-text">{errors.t1Phone}</span>}
                                </div>
                                <div className={`form-group file-group ${errors.cv1 ? 'has-error' : ''}`}>
                                    <label>CV *</label>
                                    <div
                                        className={`file-upload-area ${cv1 ? 'has-file' : ''} ${errors.cv1 ? 'error-area' : ''}`}
                                        onClick={() => cv1Ref.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={cv1Ref}
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => {
                                                const file = e.target.files[0] || null;
                                                if (file && file.size > 100 * 1024 * 1024) {
                                                    setErrors(prev => ({ ...prev, cv1: 'Fișierul depășește limita de 100MB.' }));
                                                    return;
                                                }
                                                setCv1(file);
                                                if (file) setErrors(prev => {
                                                    const newE = {...prev};
                                                    delete newE.cv1;
                                                    return newE;
                                                });
                                            }}
                                            hidden
                                        />
                                        {cv1 ? (
                                            <div className="file-info">
                                                <span className="file-icon">📄</span>
                                                <span className="file-name">{cv1.name}</span>
                                                <button type="button" className="file-remove" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCv1(null);
                                                    if (cv1Ref.current) cv1Ref.current.value = '';
                                                }}>✕</button>
                                            </div>
                                        ) : (
                                            <div className="file-placeholder">
                                                <span className="upload-icon">⬆</span>
                                                <span>Click pentru a incarca CV-ul</span>
                                                <span className="file-hint">PDF, DOC, DOCX — Max 100 MB</span>
                                            </div>
                                        )}
                                    </div>
                                    {errors.cv1 && <span className="error-text">{errors.cv1}</span>}
                                </div>
                            </div>

                            {/* Teammate 2 */}
                            <div className="form-section optional-section">
                                <div className="section-title">
                                    <span className="pixel-arrow">►</span> COECHIPIER 2 (optional)
                                </div>
                                <p className="section-hint">Daca nu ai un coechipier, te ajutam noi sa gasesti unul!</p>
                                <div className="form-group">
                                    <label htmlFor="t2Name">Nume si prenume</label>
                                    <input
                                        type="text"
                                        id="t2Name"
                                        name="t2Name"
                                        value={form.t2Name}
                                        onChange={handleChange}
                                        placeholder="Nume si prenume"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="t2Email">Adresa de e-mail</label>
                                    <input
                                        type="email"
                                        id="t2Email"
                                        name="t2Email"
                                        value={form.t2Email}
                                        onChange={handleChange}
                                        placeholder="email@exemplu.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="t2Phone">Numar de telefon</label>
                                    <input
                                        type="tel"
                                        id="t2Phone"
                                        name="t2Phone"
                                        value={form.t2Phone}
                                        onChange={handleChange}
                                        placeholder="07XX XXX XXX"
                                    />
                                </div>
                                <div className={`form-group file-group ${errors.cv2 ? 'has-error' : ''}`}>
                                    <label>CV</label>
                                    <div
                                        className={`file-upload-area ${cv2 ? 'has-file' : ''} ${errors.cv2 ? 'error-area' : ''}`}
                                        onClick={() => cv2Ref.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={cv2Ref}
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => {
                                                const file = e.target.files[0] || null;
                                                if (file && file.size > 100 * 1024 * 1024) {
                                                    setErrors(prev => ({ ...prev, cv2: 'Fișierul depășește limita de 100MB.' }));
                                                    return;
                                                }
                                                setCv2(file);
                                                if (file) setErrors(prev => {
                                                    const newE = {...prev};
                                                    delete newE.cv2;
                                                    return newE;
                                                });
                                            }}
                                            hidden
                                        />
                                        {cv2 ? (
                                            <div className="file-info">
                                                <span className="file-icon">📄</span>
                                                <span className="file-name">{cv2.name}</span>
                                                <button type="button" className="file-remove" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCv2(null);
                                                    if (cv2Ref.current) cv2Ref.current.value = '';
                                                }}>✕</button>
                                            </div>
                                        ) : (
                                            <div className="file-placeholder">
                                                <span className="upload-icon">⬆</span>
                                                <span>Click pentru a incarca CV-ul</span>
                                                <span className="file-hint">PDF, DOC, DOCX — Max 100 MB</span>
                                            </div>
                                        )}
                                    </div>
                                    {errors.cv2 && <span className="error-text">{errors.cv2}</span>}
                                </div>
                            </div>

                            {/* GDPR */}
                            <div className="form-section gdpr-section">
                                <div className="section-title">
                                    <span className="pixel-arrow">►</span> GDPR *
                                </div>
                                <div className="gdpr-text">
                                    <p>Prin completarea acestui formular, sunteti de acord cu prelucrarea datelor cu caracter personal de catre Organizatia Studentilor din Facultatea de Inginerie Industriala si Robotica, in conformitate cu Regulamentul (UE) 2016/679 (GDPR).</p>
                                    <p>Datele colectate (precum nume, prenume, date de contact si, unde este cazul, materiale foto/video) vor fi utilizate exclusiv pentru organizarea si desfasurarea evenimentului LevelUp si pentru activitati asociate, pe o perioada de maximum 3 ani.</p>
                                    <p>Datele nu vor fi transferate in afara Uniunii Europene si vor fi tratate in siguranta, conform legislatiei in vigoare. Pentru orice solicitari legate de datele dumneavoastra, ne puteti contacta la: <a href="mailto:office@osfiir.ro">office@osfiir.ro</a>.</p>
                                    <br />
                                    <p>By completing this form, you consent to the processing of your personal data by the Student Organization of the Faculty of Industrial Engineering and Robotics, in accordance with Regulation (EU) 2016/679 (GDPR).</p>
                                    <p>The data collected (such as first name, last name, contact information, and, where applicable, photo/video materials) will be used exclusively for the organization and conduct of the LevelUp event and related activities, for a maximum period of 3 years.</p>
                                    <p>The data will not be transferred outside the European Union and will be processed securely, in accordance with applicable legislation. For any requests regarding your data, please contact us at: <a href="mailto:office@osfiir.ro">office@osfiir.ro</a>.</p>
                                </div>
                                <label className={`gdpr-checkbox ${errors.gdprConsent ? 'has-error' : ''}`}>
                                    <input
                                        type="checkbox"
                                        name="gdprConsent"
                                        checked={form.gdprConsent}
                                        onChange={handleChange}
                                    />
                                    <span className="custom-checkbox"></span>
                                    <span className="checkbox-label">Sunt de acord / Agree</span>
                                </label>
                                {errors.gdprConsent && <span className="error-text">{errors.gdprConsent}</span>}
                            </div>

                            {/* Error message */}
                            {status === 'error' && (
                                <div className="error-msg">
                                    <span>⚠</span> {errorMsg}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={status === 'submitting'}
                            >
                                {status === 'submitting' ? (
                                    <span className="loading-text">
                                        SE TRIMITE<span className="dots">...</span>
                                    </span>
                                ) : (
                                    'TRIMITE INSCRIEREA'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Inscriere;

