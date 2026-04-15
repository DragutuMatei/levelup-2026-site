import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../Utils/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './qrredirect.scss';

const REDIRECT_URL = process.env.REACT_APP_REDIRECT_URL || 'https://levelup.osfiir.ro/inscriere';

const VALID_SOURCES = ['afis', 'rollup', 'flyer'];

export default function QRRedirect() {
  const { source } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'done' | 'error'

  useEffect(() => {
    const track = async () => {
      const safeSource = VALID_SOURCES.includes(source) ? source : 'unknown';

      // Colectare date dispozitiv
      const deviceData = {
        source: safeSource,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language || navigator.userLanguage,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        colorDepth: window.screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer || 'direct',
        cookiesEnabled: navigator.cookieEnabled,
        touchSupport: navigator.maxTouchPoints > 0,
        maxTouchPoints: navigator.maxTouchPoints,
        connection: navigator.connection
          ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
          }
          : null,
      };

      // Obtinem IP-ul
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        deviceData.ip = ipData.ip;
      } catch {
        deviceData.ip = 'unavailable';
      }

      // Salvam in Firestore
      try {
        await addDoc(collection(db, 'qr_scans'), deviceData);
        setStatus('done');
      } catch (err) {
        console.error('Firestore error:', err);
        setStatus('error');
      }

      // Mic delay pentru a ne asigura ca write-ul ajunge la server
      await new Promise(r => setTimeout(r, 1500));
      // Redirect indiferent de erori
      window.location.replace(REDIRECT_URL);
    };

    track();
  }, [source, navigate]);

  return (
    <div className="qr-redirect">
      <div className="qr-redirect__bg">
        <div className="qr-redirect__grid" />
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`qr-redirect__particle qr-redirect__particle--${i + 1}`} />
        ))}
      </div>

      <div className="qr-redirect__card">
        <div className="qr-redirect__logo">
          <span className="qr-redirect__logo-level">Level</span>
          <span className="qr-redirect__logo-up">Up</span>
          <span className="qr-redirect__logo-tag">2025</span>
        </div>

        <div className="qr-redirect__spinner">
          <div className="qr-redirect__ring" />
          <div className="qr-redirect__ring qr-redirect__ring--2" />
          <div className="qr-redirect__ring qr-redirect__ring--3" />
        </div>

        <p className="qr-redirect__text">Se pregateste inscrierea...</p>
        <p className="qr-redirect__sub">Vei fi redirectionat automat</p>

        {status === 'error' && (
          <a className="qr-redirect__fallback" href={REDIRECT_URL}>
            Apasa aici daca nu esti redirectionat
          </a>
        )}
      </div>
    </div>
  );
}

