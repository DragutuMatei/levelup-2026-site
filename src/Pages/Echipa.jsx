import React from 'react';
import { echipaData } from '../data/echipaData';
import './echipa.scss';

// Placeholder SVG avatar cand nu e poza
function AvatarPlaceholder({ name }) {
    const initials = name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('');
    
    return (
        <div className="avatar-placeholder">
            <span>{initials}</span>
        </div>
    );
}

function Echipa() {
    return (
        <div className="echipa-page">
            <div className="page-content">
                <div className="echipa-header">
                    <h1>ECHIPA</h1>
                    <p>Oamenii din spatele Level UP</p>
                </div>

                <div className="echipa-grid">
                    {echipaData.map((member, idx) => (
                        <div className="member-card" key={idx}>
                            <div className="card-inner">
                                <div className="member-photo">
                                    {member.photo 
                                        ? <img src={member.photo} alt={member.name} />
                                        : <AvatarPlaceholder name={member.name} />
                                    }
                                    <div className="photo-border-corner tl"></div>
                                    <div className="photo-border-corner tr"></div>
                                    <div className="photo-border-corner bl"></div>
                                    <div className="photo-border-corner br"></div>
                                </div>
                                <div className="member-info">
                                    <h3>{member.name}</h3>
                                    <span className="member-role">{member.role}</span>
                                    {member.email && (
                                        <div className="member-email">
                                            <a href={`mailto:${member.email}`}>{member.email}</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Echipa;
