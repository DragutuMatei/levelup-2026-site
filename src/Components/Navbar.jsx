import React, { useState } from 'react'
import logo from "../assets/images/logo.svg"
import { Link } from 'react-router-dom'
import "./navbar.scss";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
        setDropdownOpen(false); // Close dropdown when menu toggles
    };

    const closeAll = () => {
        setMenuOpen(false);
        setDropdownOpen(false);
    };

    return (
        <nav>
            <div className='logo'>
                <Link to="/" onClick={closeAll}><img src={logo} alt="logo" /></Link>
            </div>

            <button
                className={`hamburger ${menuOpen ? 'open' : ''}`}
                onClick={toggleMenu}
                aria-label="Meniu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <div className={`links ${menuOpen ? 'open' : ''}`}>
                <div className="link">
                    <Link to="/" onClick={closeAll}>Acasa</Link>
                </div>

                {/* Dropdown Menu for "Despre" */}
                <div className={`link dropdown-parent ${dropdownOpen ? 'active' : ''}`}>
                    <div
                        className="dropdown-trigger"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        Despre <span className="arrow">▼</span>
                    </div>

                    <div className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                        <Link to="/about" onClick={closeAll} className="dropdown-item">Despre</Link>
                        <Link to="/echipa" onClick={closeAll} className="dropdown-item">Echipa</Link>
                        <Link to="/regulament" onClick={closeAll} className="dropdown-item">Regulament</Link>
                        <a
                            target='_blank'
                            rel='noopener noreferrer'
                            href="http://levelup-app-2025.osfiir.ro/"
                            onClick={closeAll}
                            className="dropdown-item"
                        >
                            Editia I
                        </a>
                    </div>
                </div>

                <div className="link">
                    <Link to="/inscriere" onClick={closeAll} className="btn-press">Inscriere</Link>
                </div>

                <div className="link">
                    <Link to="/contact" onClick={closeAll}>Contact</Link>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
