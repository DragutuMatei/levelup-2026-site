import React from 'react';
import { Link } from 'react-router-dom';
import dinozaur from "../assets/images/dinozaur.svg";
import pacman from "../assets/images/Pacman.svg";
import start from "../assets/images/start.svg";
import echipa from "../assets/images/echipa.svg";
import osfiir from "../assets/images/caseta_osfiir.svg";

function AboutSection() {
    return (
        <div className="about-wrapper reveal" style={{ transitionDelay: '0.25s' }}>
            <div className="end-track-canvas stagger-reveal">
                <div className="track-line v-line d1 stagger-child"></div>
                <div className="track-line h-line d2 stagger-child"></div>
                <div className="pacman-icon">
                    <img src={pacman} alt="Pacman" />
                </div>
                <div className="track-line v-line d3 stagger-child"></div>
                <div className="track-line h-line d4 stagger-child"></div>
                <div className="dinozaur-icon">
                    <img src={dinozaur} alt="Dinosaur" />
                </div>
            </div>

            <div className="about-window">
                <div className="window-header">
                    <span className="title">DESPRE</span>
                    <div className="controls">
                        <span className="ctrl minimize"></span>
                        <span className="ctrl maximize"></span>
                        <span className="ctrl close"></span>
                    </div>
                </div>
                <div className="window-content">
                    <p className="main-desc">Level UP este un eveniment de 8 ore desfasurat fizic, construit ca o experienta digitala interactiva inspirata dintr-un Digital Scavenger Hunt cu elemente de escape room.</p>
                    
                    <div className="section-block">
                        <h3>NIVELE</h3>
                        <p>Fiecare nivel face parte dintr-o poveste si este bazat pe concepte de Web si IT, iar participantii trebuie sa descopere indicii, sa analizeze aplicatii si sa rezolve provocari pentru a avansa.</p>
                    </div>

                    <div className="section-block">
                        <h3>OBIECTIVE</h3>
                        <p>Scopul este parcurgerea tuturor nivelurilor in cel mai scurt timp, echipa cu cel mai bun timp fiind castigatoare.</p>
                    </div>

                    <div className="window-footer">
                        <div className="footer-item echipa">
                            <div className="echipa-placeholders">
                                <img src={echipa} alt="Echipa" height="70" />
                            </div>
                        </div>
                        <div className="footer-item start-game-btn">
                            <Link to="/inscriere" className="btn-press">
                                <img src={start} alt="start game" />
                            </Link>
                        </div>
                        <div className="footer-item logo-box">
                            <img src={osfiir} alt="OSFIIR" height="60" />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default AboutSection;
