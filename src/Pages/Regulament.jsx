import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { regulamentData } from '../data/regulamentData';
import './regulament.scss';

function Regulament() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="regulament-page">
            <div className="page-content regulament-wrapper">
                <aside className={`regulament-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                    <div className="retro-window">
                        <div className="window-header">
                            <span className="title">CUPRINS</span>
                            <div className="window-controls">
                                <span className="control minimize"></span>
                                <span className="control maximize"></span>
                                <span className="control close"></span>
                            </div>
                        </div>
                        <ul className="sidebar-menu">
                            {regulamentData.map((section, idx) => (
                                <li key={idx}>
                                    <NavLink 
                                        to={`/regulament/${section.id}`}
                                        className={({ isActive }) => isActive ? "active" : ""}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        {section.title.split('.')[0]}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
                
                {/* Overlay care inchide sidebar-ul pe mobile */}
                {sidebarOpen && (
                    <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
                )}

                {/* Buton toggle vizibil doar pe mobile */}
                <button 
                    className="sidebar-toggle-btn"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Cuprins"
                >
                    {sidebarOpen ? '✕' : '☰ CUPRINS'}
                </button>

                {/* Aici curg sub-paginile */}
                <Outlet />
            </div>
        </div>
    );
}

export default Regulament;
