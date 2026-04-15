import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Home from './Pages/Home';
import Regulament from './Pages/Regulament';
import RegulamentContent from './Pages/RegulamentContent';
import Echipa from './Pages/Echipa';
import Inscriere from './Pages/Inscriere';
import About from './Pages/About';
import Contact from './Pages/Contact';
import QRRedirect from './Pages/QRRedirect';
import LoadingScreen from './Components/LoadingScreen';
import './assets/scss/base.scss';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import "./assets/scss/buttons.scss";
import { useState, useEffect } from 'react';
import { AuthProvider } from './Utils/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';
import AdminLogin from './Pages/Admin/AdminLogin';
import AdminDashboard from './Pages/Admin/AdminDashboard';

// Wrapper intern care ascunde Navbar/Footer pe rutele /qr/* sau /admin/*
function AppShell({ loading, setLoading }) {
  const location = useLocation();
  const isSpecialPage = location.pathname.startsWith('/qr') || location.pathname.startsWith('/admin');

  // Scroll to top la schimbarea paginii
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (isSpecialPage) return;

    // Standard reveal observer
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );

    // Stagger reveal observer — reveals children one by one
    const staggerObserver = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          const children = e.target.querySelectorAll('.stagger-child');
          children.forEach((child, i) => {
            setTimeout(() => {
              child.classList.add('child-visible');
            }, i * 200);
          });
          staggerObserver.unobserve(e.target);
        }
      }),
      { threshold: 0.05 }
    );

    const observe = () => {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
      document.querySelectorAll('.stagger-reveal').forEach(el => staggerObserver.observe(el));
    };
    observe();
    const t1 = setTimeout(observe, 100);
    const t2 = setTimeout(observe, 500);
    return () => { observer.disconnect(); staggerObserver.disconnect(); clearTimeout(t1); clearTimeout(t2); };
  }, [loading, isSpecialPage, location.pathname]);

  return (
    <>
      {!isSpecialPage && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/regulament' element={<Regulament />}>
          <Route index element={<Navigate to="sectiunea-1" replace />} />
          <Route path=":sectionId" element={<RegulamentContent />} />
        </Route>
        <Route path='/echipa' element={<Echipa />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/inscriere' element={<Inscriere />} />
        <Route path='/qr/:source' element={<QRRedirect />} />
        
        {/* Admin Routes */}
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route 
          path='/admin/dashboard' 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
      {!isSpecialPage && <Footer />}
    </>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  // Blocare scroll in timpul loading-ului
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [loading]);

  return (
    <AuthProvider>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      <BrowserRouter>
        <AppShell loading={loading} setLoading={setLoading} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

