import React from 'react';
import { Link } from 'react-router-dom';
import mascota from "../assets/images/mascota.svg";
import caseta_mas from "../assets/images/caseta_mas.svg";
import fantoma1 from "../assets/images/fantoma1.svg";

function HeroSection() {
    return (
        <div className="hero-wrapper">
            <div className="text reveal" style={{ transitionDelay: '0.2s' }}>
                <h1>LEVEL UP</h1>
                <h2 className="glitch-text">9 MAI 2026</h2>
                <p>Level UP este un eveniment de 8 ore desfasurat fizic, construit ca o experienta digitala interactiva inspirata dintr-un Digital Scavenger Hunt cu elemente de escape room.</p>
                <div className="buttons">
                    <div className="button yell">
                        <Link to="/inscriere" className="btn-press">INSCRIE-TE</Link>
                    </div>
                    <div className="button blue">
                        <Link to="/regulament" className="btn-press">REGULAMENT</Link>
                    </div>
                </div>
                <div className="fantoma-container">
                    <img src={fantoma1} alt="fantoma" className="fantoma" />

                    <div className="dots-track stagger-reveal">
                        <div className="track-line h-line l1 stagger-child"></div>
                        <div className="track-line v-line l2 stagger-child"></div>
                        <div className="track-line h-line l3 stagger-child"></div>
                        <div className="track-line v-line l4 stagger-child"></div>
                    </div>
                </div>
            </div>
            <div className="mascota-container reveal" style={{ transitionDelay: '0.2s' }}>
                <img src={mascota} alt="mascota" className="mascota-img" />
                <Link to="/inscriere" className="caseta-img btn-press">
                    <img src={caseta_mas} alt="caseta" style={{ width: '100%', height: 'auto' }} />
                </Link>
                <div className="dots-track-caseta stagger-reveal">
                    <div className="track-line v-line t1 stagger-child"></div>
                    <div className="track-line h-line t2 stagger-child"></div>
                    <div className="track-line v-line t3 stagger-child"></div>
                </div>
            </div>
        </div>
    );
}

export default HeroSection;
