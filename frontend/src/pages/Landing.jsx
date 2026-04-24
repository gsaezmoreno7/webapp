import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, ShieldCheck, Globe, Phone, Mail, MapPin, ArrowRight, Award, Zap, Star, TrendingUp, Cpu, Lock, ChevronRight, MessageSquare, X, Send } from 'lucide-react';

export const AIConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'fixed', bottom: '40px', right: '40px', background: '#c0a060', color: '#000', width: '70px', height: '70px', borderRadius: '50%', border: 'none', cursor: 'pointer', boxShadow: '0 15px 35px rgba(192, 160, 96, 0.4)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {isOpen ? <X size={30} /> : <MessageSquare size={30} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            style={{ position: 'fixed', bottom: '130px', right: '40px', width: '380px', height: '500px', background: '#0a0a0c', border: '1px solid #c0a06030', borderRadius: '30px', zIndex: 5000, boxShadow: '0 50px 100px rgba(0,0,0,1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <div style={{ padding: '30px', background: 'linear-gradient(to right, #c0a060, #8a6e3d)', color: '#000' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900' }}>GOLD CONCIERGE</h3>
              <p style={{ fontSize: '10px', fontWeight: '900', opacity: 0.7 }}>ASISTENTE PRIVADO 24/7</p>
            </div>
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ alignSelf: 'flex-start', background: '#111', padding: '15px', borderRadius: '20px 20px 20px 0', fontSize: '13px', color: '#888', maxWidth: '80% shadow: 0 5px 10px rgba(0,0,0,0.5)' }}>
                Buenos días, Caballero. Soy su asistente privado de Gold Bank. ¿Le gustaría realizar un movimiento o consultar la tasa del oro hoy?
              </div>
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #111', display: 'flex', gap: '10px' }}>
              <input placeholder="Escriba su consulta VIP..." style={{ flex: 1, background: '#000', border: '1px solid #222', borderRadius: '15px', padding: '15px', color: '#fff', fontSize: '12px' }} />
              <button style={{ background: '#c0a060', border: 'none', padding: '15px', borderRadius: '15px', cursor: 'pointer' }}><Send size={20} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -10, borderColor: '#c0a06060' }}
    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', borderRadius: '30px', textAlign: 'left', transition: '0.3s' }}
  >
    <div style={{ background: 'rgba(192, 160, 96, 0.1)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
      <Icon color="#c0a060" size={28} />
    </div>
    <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '15px', letterSpacing: '1px' }}>{title}</h3>
    <p style={{ fontSize: '14px', color: '#8e8e93', lineHeight: '1.6' }}>{desc}</p>
  </motion.div>
);

const Landing = ({ onGoToLogin, onGoToRegister }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    window.addEventListener('mousemove', (e) => setMousePos({ x: e.clientX, y: e.clientY }));
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-container" style={{ background: '#020202', color: '#fff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
      <AIConcierge />
      
      {/* Dynamic Background Glow */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 1, background: `radial-gradient(1000px at ${mousePos.x}px ${mousePos.y}px, rgba(192, 160, 96, 0.03), transparent 80%)` }} />

      {/* Market Ticker */}
      <div style={{ background: '#c0a060', color: '#000', padding: '12px 0', fontSize: '10px', fontWeight: '900', letterSpacing: '2px', overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative', zIndex: 100 }}>
        <motion.div animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }} style={{ display: 'inline-block' }}>
          • LONDON GOLD: $2,422.50 (+1.4%) • SANTIAGO HUB: ONLINE • PRIVATE VAULTS: 98% CAPACITY • QUANTUM ENCRYPTION: ACTIVE • SWIFT: GOLDBCLSX •
        </motion.div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '25px 8%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,2,2,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 1000, borderBottom: '1px solid rgba(192,160,96,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          <Landmark color="#c0a060" size={32} />
          <h1 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '4px' }}>GOLD<span style={{ color: '#c0a060' }}>BANK</span></h1>
        </div>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          {[
            {label: 'PATRIMONIO', id: 'stats'},
            {label: 'SEGURIDAD', id: 'seguridad'},
            {label: 'INVERSIONES', id: 'servicios'},
            {label: 'BÓVEDA', id: 'boveda'}
          ].map(item => (
            <button 
              key={item.label} 
              onClick={() => scrollTo(item.id)}
              style={{ background: 'none', border: 'none', fontSize: '11px', fontWeight: '900', color: '#888', letterSpacing: '2px', cursor: 'pointer', transition: '0.2s' }}
              onMouseOver={(e) => e.target.style.color = '#c0a060'}
              onMouseOut={(e) => e.target.style.color = '#888'}
            >
              {item.label}
            </button>
          ))}
          <button onClick={onGoToLogin} style={{ background: 'transparent', border: '1px solid #c0a060', color: '#c0a060', padding: '12px 30px', borderRadius: '50px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>ACCESO CLIENTES</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '180px 10% 120px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
             <span style={{ background: 'rgba(192,160,96,0.1)', color: '#c0a060', padding: '8px 15px', borderRadius: '50px', fontSize: '10px', fontWeight: '900', border: '1px solid #c0a06030' }}>EST. 1924</span>
             <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '8px 15px', borderRadius: '50px', fontSize: '10px', fontWeight: '900', border: '1px solid #10b98130' }}>CERTIFIED SECURITY</span>
          </div>
          <h1 style={{ fontSize: '110px', fontWeight: '900', lineHeight: '0.9', marginBottom: '45px', letterSpacing: '-6px' }}>La Excelencia en <br /> <span style={{ color: '#c0a060' }}>Banca Privada.</span></h1>
          <p style={{ fontSize: '20px', color: '#8e8e93', maxWidth: '850px', margin: '0 auto 60px', lineHeight: '1.8', fontWeight: '400' }}>
            Gestionamos el patrimonio más exclusivo del mundo con el respaldo físico de metal noble y la seguridad de la red criptográfica más avanzada del hemisferio.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button onClick={onGoToRegister} style={{ background: '#c0a060', color: '#000', padding: '25px 50px', borderRadius: '50px', border: 'none', fontWeight: '900', fontSize: '14px', cursor: 'pointer', boxShadow: '0 20px 50px rgba(192, 160, 96, 0.4)' }}>SOLICITAR MEMBRESÍA MASTER</button>
            <button onClick={() => scrollTo('servicios')} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '25px 50px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '900', fontSize: '14px', cursor: 'pointer' }}>VER SERVICIOS CORPORATIVOS</button>
          </div>
        </motion.div>
      </section>

      {/* Stats Section (ID: stats) */}
      <section id="stats" style={{ padding: '80px 10%', background: 'rgba(192,160,96,0.02)', borderTop: '1px solid #1c1c22', borderBottom: '1px solid #1c1c22', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', textAlign: 'center' }}>
         {[
           { val: '450.5T', label: 'RESERVAS FÍSICAS' },
           { val: '100%', label: 'SOLVENCIA GARANTIZADA' },
           { val: '24/7', label: 'MONITOREO CUÁNTICO' },
           { val: '+12.4%', label: 'RENDIMIENTO ANUAL' }
         ].map((stat, i) => (
           <div key={i}>
             <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#c0a060', marginBottom: '5px' }}>{stat.val}</h2>
             <p style={{ fontSize: '10px', fontWeight: '900', color: '#555', letterSpacing: '2px' }}>{stat.label}</p>
           </div>
         ))}
      </section>

      {/* Services Grid (ID: servicios) */}
      <section id="servicios" style={{ padding: '120px 10%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '12px', letterSpacing: '10px', color: '#c0a060', marginBottom: '20px', fontWeight: '900' }}>SERVICIOS DE ÉLITE</h2>
        <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '80px' }}>Ecosistemas de <span style={{ color: '#c0a060' }}>Inversión.</span></h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
          <FeatureCard 
            icon={ShieldCheck} 
            title="Bóvedas Físicas" 
            desc="Acceso a las reservas de oro físicas más seguras del mundo en ubicaciones de jurisdicción neutra y seguridad militar."
          />
          <FeatureCard 
            icon={Cpu} 
            title="Gestión Algorítmica" 
            desc="Modelos de inversión automatizados basados en machine learning de alto rendimiento para la preservación de activos."
          />
          <FeatureCard 
            icon={Globe} 
            title="Red SWIFT 2.0" 
            desc="Liquidación transfronteriza instantánea de grandes capitales con protocolos de validación biométrica en tiempo real."
          />
          <FeatureCard 
            icon={Award} 
            title="Patrimonio Master" 
            desc="Consultoría personalizada para la estructuración de legados familiares y trusts internacionales de alta complejidad."
          />
          <FeatureCard 
            icon={Zap} 
            title="Liquidez Inmediata" 
            desc="Líneas de crédito respaldadas por activos físicos con ejecución de órdenes en milisegundos a través de nuestra red propia."
          />
          <FeatureCard 
            icon={Lock} 
            title="Privacidad Total" 
            desc="Protocolos de anonimato financiero legalmente certificados bajo los más altos estándares de cumplimiento internacional."
          />
        </div>
      </section>

      {/* Boveda Special Section (ID: boveda) */}
      <section id="boveda" style={{ padding: '100px 10%', background: '#070707' }}>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
           <motion.div 
             initial={{ opacity: 0, x: -50 }} 
             whileInView={{ opacity: 1, x: 0 }} 
             style={{ position: 'relative' }}
           >
              <div style={{ width: '100%', height: '500px', background: 'linear-gradient(45deg, #111, #000)', borderRadius: '40px', border: '1px solid #c0a06030', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Lock size={120} color="#c0a06020" style={{ position: 'absolute' }} />
                 <motion.div 
                   animate={{ rotate: 360 }} 
                   transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                   style={{ width: '300px', height: '300px', border: '2px dashed #c0a06010', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                 >
                   <div style={{ width: '250px', height: '250px', border: '1px solid #c0a06030', borderRadius: '50%' }} />
                 </motion.div>
                 <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <ShieldCheck size={50} color="#c0a060" style={{ marginBottom: '15px' }} />
                    <p style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '3px' }}>SECURITY HUB</p>
                 </div>
              </div>
           </motion.div>
           <div>
              <h2 style={{ fontSize: '12px', letterSpacing: '5px', color: '#c0a060', marginBottom: '20px', fontWeight: '900' }}>UBICACIONES NEUTRAS</h2>
              <h2 style={{ fontSize: '40px', fontWeight: '900', marginBottom: '30px', lineHeight: '1.2' }}>Custodia en <span style={{ color: '#c0a060' }}>Jurisdicciones Soberanas.</span></h2>
              <p style={{ color: '#888', lineHeight: '1.8', marginBottom: '40px' }}>
                Nuestras bóvedas no están solo protegidas por muros; están protegidas por tratados internacionales. Ubicadas en los Alpes suizos y zonas francas de Singapur, garantizamos el acceso físico ilimitado a su patrimonio.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid #1c1c22' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#c0a060', marginBottom: '10px' }}>ALPES HUB</h4>
                    <p style={{ fontSize: '11px', color: '#555' }}>Nivel de seguridad 5. Resguardo geológico natural.</p>
                 </div>
                 <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid #1c1c22' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#c0a060', marginBottom: '10px' }}>SINGAPORE HUB</h4>
                    <p style={{ fontSize: '11px', color: '#555' }}>Conectividad asiática. Máxima eficiencia impositiva.</p>
                 </div>
              </div>
           </div>
         </div>
      </section>

      {/* Security Section (ID: seguridad) */}
      <section id="seguridad" style={{ padding: '100px 10%' }}>
         <div style={{ background: 'linear-gradient(135deg, #0a0a0c 0%, #1a1a1f 100%)', borderRadius: '50px', padding: '100px', textAlign: 'center', border: '1px solid #c0a06020', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(192,160,96,0.05) 0%, transparent 40%)', zIndex: 0 }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <ShieldCheck size={80} color="#c0a060" style={{ marginBottom: '40px' }} />
              <h2 style={{ fontSize: '50px', fontWeight: '900', marginBottom: '30px' }}>Seguridad Cryptográfica Certificada.</h2>
              <p style={{ fontSize: '18px', color: '#888', maxWidth: '700px', margin: '0 auto 50px', lineHeight: '1.7' }}>
                Cada movimiento está blindado por tres capas: física, digital y criptográfica. Su legado es inmutable ante cualquier fluctuación sistémica.
              </p>
              <button onClick={onGoToRegister} style={{ background: '#fff', color: '#000', padding: '22px 50px', borderRadius: '50px', border: 'none', fontWeight: '900', fontSize: '13px', cursor: 'pointer' }}>ABRIR CUENTA CERTIFICADA</button>
            </div>
         </div>
      </section>

      {/* Robust Footer (ID: contacto) */}
      <footer id="contacto" style={{ padding: '100px 10% 40px', background: '#050505', borderTop: '1px solid #1c1c22' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '60px', marginBottom: '80px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
              <Landmark color="#c0a060" size={28} />
              <h1 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '4px' }}>GOLD BANK</h1>
            </div>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.8', maxWidth: '300px', marginBottom: '30px' }}>
              La institución financiera líder en la custodia y gestión de activos nobles de alta valoración.
            </p>
            <button onClick={onGoToRegister} style={{ background: '#c0a060' ,color:'#000', padding: '15px 30px', borderRadius:'10px', fontWeight:'900', border:'none', fontSize:'11px', cursor:'pointer'}}>SOLICITAR ASIGNACIÓN VIP</button>
          </div>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: '900', color: '#c0a060', marginBottom: '25px', letterSpacing: '2px' }}>INSTITUCIONAL</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {['Sobre Gold Bank', 'Carreras VIP', 'Sala de Prensa', 'Cumplimiento'].map(l => <a key={l} href="#" style={{ color: '#555', textDecoration: 'none', fontSize: '13px' }}>{l}</a>)}
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: '900', color: '#c0a060', marginBottom: '25px', letterSpacing: '2px' }}>HERRAMIENTAS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {['Simulador de Oro', 'Red de Cajeros Gold', 'Seguridad Cuántica', 'API Developer'].map(l => <a key={l} href="#" style={{ color: '#555', textDecoration: 'none', fontSize: '13px' }}>{l}</a>)}
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: '900', color: '#c0a060', marginBottom: '25px', letterSpacing: '2px' }}>CONTACTO</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '13px' }}><MapPin size={14}/> Zurich, Switzerland</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '13px' }}><Phone size={14}/> +41 00 123 4567</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontSize: '13px' }}><Mail size={14}/> master@goldbank.com</div>
            </div>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid #111', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#333', fontSize: '11px', letterSpacing: '2px' }}>© 2026 GOLD BANK PRIVATE INSTITUTION • SECURE NETWORK</p>
          <div style={{ display: 'flex', gap: '40px' }}>
             <a href="#" style={{ color: '#333', textDecoration: 'none', fontSize: '11px' }}>LEGAL</a>
             <a href="#" style={{ color: '#333', textDecoration: 'none', fontSize: '11px' }}>PRIVACIDAD</a>
             <a href="#" style={{ color: '#333', textDecoration: 'none', fontSize: '11px' }}>SOPORTE VIP</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
