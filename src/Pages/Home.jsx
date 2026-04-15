import React from 'react';
import HeroSection from '../Components/HeroSection';
import CountdownSection from '../Components/CountdownSection';
import AboutSection from '../Components/AboutSection';
import "./home.scss";

function Home() {
    return (
        <section className="home-section">
            <div className="page-content">
                <HeroSection />
                <CountdownSection />
                <AboutSection />
            </div>
        </section>
    );
}

export default Home;