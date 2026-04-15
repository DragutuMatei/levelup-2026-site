import React, { useState, useEffect, useRef } from 'react';
import fantoma2 from "../assets/images/fantoma2.svg";
import start from "../assets/images/start.svg";
import { Link } from 'react-router-dom';
function CountdownSection() {
    const targetDate = new Date('May 3, 2026 00:00:00').getTime();
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [flipping, setFlipping] = useState({ days: false, hours: false, minutes: false, seconds: false });
    const prevTime = useRef({ days: -1, hours: -1, minutes: -1, seconds: -1 });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);
                const newTime = { days, hours, minutes, seconds };

                const newFlip = {
                    days: days !== prevTime.current.days,
                    hours: hours !== prevTime.current.hours,
                    minutes: minutes !== prevTime.current.minutes,
                    seconds: seconds !== prevTime.current.seconds,
                };
                setFlipping(newFlip);
                prevTime.current = newTime;
                setTimeLeft(newTime);

                // reset flip classes
                setTimeout(() => setFlipping({ days: false, hours: false, minutes: false, seconds: false }), 400);
            } else {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="countdown-wrapper reveal">
            <div className="countdown-box">
                <h3>INSCRIERILE SE TERMINA IN:</h3>
                <div className="timer-blocks">
                    <div className="timer-block">
                        <span className={`number${flipping.days ? ' flip' : ''}`}>{String(timeLeft.days).padStart(2, '0')}</span>
                        <span className="label">ZILE</span>
                    </div>
                    <div className="timer-block">
                        <span className={`number${flipping.hours ? ' flip' : ''}`}>{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className="label">ORE</span>
                    </div>
                    <div className="timer-block">
                        <span className={`number${flipping.minutes ? ' flip' : ''}`}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className="label">MINUTE</span>
                    </div>
                    <div className="timer-block">
                        <span className={`number${flipping.seconds ? ' flip' : ''}`}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                        <span className="label">SECUNDE</span>
                    </div>
                </div>
                <div className="loading-container">
                    <Link to="/inscriere" className="btn-press">
                        <img src={start} alt="start" />
                    </Link>
                </div>
            </div>

            <div className="mid-track-canvas stagger-reveal">
                {/* Left Branch */}
                <div className="track-line v-line m-c1 stagger-child"></div>
                <div className="track-line h-line m-c2 stagger-child"></div>
                <div className="track-line v-line m-c3 stagger-child"></div>

                {/* Right Branch */}
                <div className="track-line v-line m-c4 stagger-child"></div>
                <div className="track-line h-line m-c5 stagger-child"></div>

                <div className="space-invader">
                    <img src={fantoma2} alt="Space Invader" />
                </div>

                <div className="track-line v-line m-c6 stagger-child"></div>

                {/* Huge Horizontal Connector */}
                <div className="track-line h-line m-h1 stagger-child"></div>

                {/* Drop down into About Box */}
                <div className="track-line v-line m-c7 stagger-child"></div>
            </div>
        </div>
    );
}

export default CountdownSection;

