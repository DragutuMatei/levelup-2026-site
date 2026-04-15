import React from 'react';
import { FaRocket, FaHandshake, FaTrophy } from 'react-icons/fa';
import './about.scss';
import dinozaur from "../assets/images/dinozaur.svg";
import pacman from "../assets/images/Pacman.svg";
import osfiir from "../assets/images/caseta_osfiir.svg";

function About() {
    return (
        <div className="about-page">
            <div className="page-content">
                <div className="about-header reveal">
                    <h1 className="glitch-text">DESPRE</h1>
                    <p>Povestea din spatele Level UP 2026</p>
                </div>

                <div className="about-sections">
                    {/* Character Decorations - Positioned relatively to the container */}
                    <div className="floating-decor pacman-decor">
                        <img src={pacman} alt="Pacman" />
                        <div className="dots-trail">
                            <span></span><span></span><span></span><span></span><span></span>
                        </div>
                    </div>

                    <div className="floating-decor dino-decor">
                        <img src={dinozaur} alt="Dinosaur" />
                    </div>

                    <div className="about-window reveal" style={{ transitionDelay: '0.1s' }}>
                        <div className="window-header">
                            <span className="title">EXPERIENTA LEVEL UP</span>
                            <div className="controls">
                                <span className="ctrl minimize"></span>
                                <span className="ctrl maximize"></span>
                                <span className="ctrl close"></span>
                            </div>
                        </div>
                        <div className="window-body">
                            <p>Level UP este mai mult decat un simplu concurs de IT. Este un eveniment de 8 ore desfasurat fizic, construit ca o experienta digitala interactiva inspirata dintr-un <strong>Digital Scavenger Hunt</strong> cu elemente de <strong>escape room</strong>.</p>
                            <p>Participantii sunt provocati sa exploreze o lume virtuala plina de mistere, unde fiecare pas dezvaluie noi indicii si provocari tehnice.</p>
                            
                            <div className="section-divider"></div>
                            
                            <h3>NIVELURI SI PROVOCĂRI</h3>
                            <p>Fiecare nivel face parte dintr-o poveste captivanta si este bazat pe concepte fundamentale de Web si IT. Participantii trebuie sa:</p>
                            <ul>
                                <li>Analizeze aplicatii si cod sursa</li>
                                <li>Descopere indicii ascunse in mediul digital</li>
                                <li>Rezolve puzzle-uri de logica si programare</li>
                                <li>Colaboreze strans cu coechipierul pentru a avansa</li>
                            </ul>
                        </div>
                    </div>

                    <div className="about-window reveal" style={{ transitionDelay: '0.2s' }}>
                        <div className="window-header">
                            <span className="title">MISIUNE SI OBIECTIVE</span>
                            <div className="controls">
                                <span className="ctrl minimize"></span>
                                <span className="ctrl maximize"></span>
                                <span className="ctrl close"></span>
                            </div>
                        </div>
                        <div className="window-body">
                            <div className="objective-grid">
                                <div className="obj-item">
                                    <div className="icon-wrapper">
                                        <FaRocket className="react-icon" />
                                    </div>
                                    <h4>Inovatie</h4>
                                    <p>Promovam invatarea prin joc si explorarea tehnologiilor noi intr-un mod creativ.</p>
                                </div>
                                <div className="obj-item">
                                    <div className="icon-wrapper">
                                        <FaHandshake className="react-icon" />
                                    </div>
                                    <h4>Colaborare</h4>
                                    <p>Punem accent pe comunicare si munca in echipa, elemente esentiale in orice proiect IT.</p>
                                </div>
                                <div className="obj-item">
                                    <div className="icon-wrapper">
                                        <FaTrophy className="react-icon" />
                                    </div>
                                    <h4>Competitie</h4>
                                    <p>Scopul final este parcurgerea tuturor nivelurilor in cel mai scurt timp posibil.</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="organizer-section reveal">
                    <div className="osfiir-box">
                        <img src={osfiir} alt="OSFIIR" />
                        <div className="osfiir-text">
                            <p>Eveniment organizat de <br /> <strong>OSFIIR</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;
