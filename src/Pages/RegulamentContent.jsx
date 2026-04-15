import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { regulamentData } from '../data/regulamentData';

function RegulamentContent() {
    const { sectionId } = useParams();
    const sectionRef = useRef(null);

    const activeSection = regulamentData.find(sec => sec.id === sectionId) || regulamentData[0];

    useEffect(() => {
        if (!sectionRef.current) return;

        const paragraphs = sectionRef.current.querySelectorAll('p');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('p-revealed');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.05,
                rootMargin: '0px 0px -50px 0px' // declanșează puțin inainte să intre complet
            }
        );

        paragraphs.forEach((p, i) => {
            p.classList.remove('p-revealed');
            p.setAttribute('data-dir', i % 2 === 0 ? 'left' : 'right');
            p.style.setProperty('--delay', `${(i % 10) * 0.1}s`); // stagger resetat la fiecare 10 iteme
            observer.observe(p);
        });

        return () => observer.disconnect();
    }, [activeSection]);

    return (
        <main className="regulament-content">
            <div className="retro-window">
                <div className="window-header">
                    <span className="title">Regulament_Level_UP.doc</span>
                    <div className="window-controls">
                        <span className="control minimize"></span>
                        <span className="control maximize"></span>
                        <span className="control close"></span>
                    </div>
                </div>
                <div className="text-body">
                    <h1>REGULAMENT LEVEL UP</h1>
                    <section id={activeSection.id} className="regulament-section" ref={sectionRef}>
                        <h2>{activeSection.title}</h2>
                        {activeSection.content.map((paragraph, pIdx) => {
                            const match = paragraph.match(/^(\d+\.\d+\.?)\s*(.*)/s);
                            const isList = paragraph.trim().startsWith("-") || paragraph.trim().match(/^[a-z]\)/);

                            if (match) {
                                return (
                                    <p key={pIdx}>
                                        <span className="para-num">{match[1]}</span> {match[2]}
                                    </p>
                                );
                            }

                            return (
                                <p key={pIdx} className={isList ? "list-item" : ""}>
                                    {paragraph}
                                </p>
                            );
                        })}
                    </section>
                </div>
            </div>
        </main>
    );
}

export default RegulamentContent;
