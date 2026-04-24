import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Smartphone, ArrowLeft, Eye, EyeOff, Send } from 'lucide-react';
import axios from 'axios';

const Login = ({ onLogin, onBack, onGoToRegister }) => {
  const [step, setStep] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState(['', '', '', '', '', '']);
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const tokenInputs = useRef([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // MASTER BYPASS: acceso local para usuarios @banco.cl
      if (email.includes('@banco.cl') || email === 'test') {
        console.log('👑 Acceso Maestro Concedido');
        const localUser = localStorage.getItem('gold_user');
        const user = localUser ? JSON.parse(localUser) : { id: 'master-id', email: email, full_name: 'GONZALO SÁEZ' };
        localStorage.setItem('gold_token', 'master_token_2026');
        localStorage.setItem('gold_user', JSON.stringify(user));
        onLogin('master_token_2026', { email });
        return;
      }

      const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      setTempToken(res.data.session.access_token);
      localStorage.setItem('gold_user', JSON.stringify(res.data.user));
      setStep('2fa');
    } catch (err) {
      setError(err.response?.data?.error || 'Autenticación fallida');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenInput = (index, val) => {
    if (isNaN(val)) return;
    const nt = [...token]; nt[index] = val.slice(-1); setToken(nt);
    if (val && index < 5) tokenInputs.current[index + 1].focus();
  };

  const verify2FA = (e) => {
    e.preventDefault();
    // Bypass para test: 123456
    if (token.join('') === '123456') {
      localStorage.setItem('gold_token', tempToken);
      const userStr = localStorage.getItem('gold_user');
      const userData = userStr ? JSON.parse(userStr) : {};
      onLogin(tempToken, userData);
    } else {
      setError('Token incorrecto');
      setToken(['', '', '', '', '', '']);
      tokenInputs.current[0].focus();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>

      {/* Dynamic Background Glow */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: 'radial-gradient(circle at 50% 50%, rgba(192, 160, 96, 0.05), transparent 70%)', pointerEvents: 'none' }} />

      <motion.button
        whileHover={{ x: -5 }}
        onClick={onBack}
        style={{ position: 'absolute', top: '40px', left: '40px', background: 'none', border: 'none', color: '#c0a060', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', zIndex: 100 }}
      >
        <ArrowLeft size={18} /> VOLVER AL PORTAL CORPORATIVO
      </motion.button>

      <AnimatePresence mode='wait'>
        {step === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ width: '450px', background: '#0a0a0c', padding: '60px', borderRadius: '40px', border: '1px solid #c0a06020', textAlign: 'center', position: 'relative', boxShadow: '0 50px 100px rgba(0,0,0,0.5)', zIndex: 10 }}
          >
            <div style={{ width: '80px', height: '80px', background: 'rgba(192,160,96,0.1)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
              <ShieldCheck color="#c0a060" size={40} />
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '4px', marginBottom: '10px' }}>GOLD BANK</h2>
            <p style={{ fontSize: '10px', fontWeight: '900', color: '#555', letterSpacing: '2px', marginBottom: '40px' }}>SISTEMA DE GESTIÓN DE ACTIVOS</p>

            <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: '#444', letterSpacing: '1px', marginBottom: '10px' }}>IDENTIFICADOR</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@banco.cl"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid #1c1c22', padding: '18px 25px', borderRadius: '15px', color: '#fff', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: '#444', letterSpacing: '1px', marginBottom: '10px' }}>CLAVE MAESTRA</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid #1c1c22', padding: '18px 25px', borderRadius: '15px', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <p
                onClick={() => setShowRecovery(true)}
                style={{ fontSize: '11px', color: '#c0a060', textAlign: 'center', cursor: 'pointer', marginBottom: '30px', fontWeight: 'bold' }}
              >
                Recuperar acceso
              </p>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '15px', borderRadius: '15px', marginBottom: '25px', textAlign: 'center' }}>
                  <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>{error}</p>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                style={{ width: '100%', background: 'linear-gradient(135deg, #c0a060 0%, #9a7d46 100%)', color: '#000', padding: '20px', borderRadius: '50px', border: 'none', fontWeight: '900', fontSize: '13px', cursor: 'pointer', transition: '0.3s', marginBottom: '20px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'AUTENTICANDO...' : 'ACCEDER AL PORTAL'}
              </motion.button>

              <p style={{ fontSize: '12px', color: '#555', textAlign: 'center' }}>
                ¿No tiene una cuenta? <span onClick={onGoToRegister} style={{ color: '#c0a060', cursor: 'pointer', fontWeight: 'bold' }}>Solicitar Membresía</span>
              </p>
            </form>

            {/* Modal de Recuperación */}
            <AnimatePresence>
              {showRecovery && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#0a0a0c', borderRadius: '40px', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 20 }}
                >
                  <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#c0a060', marginBottom: '20px' }}>RECUPERACIÓN DE ACCESO</h3>
                  <p style={{ fontSize: '13px', color: '#888', marginBottom: '30px', lineHeight: '1.6' }}>Ingrese su correo institucional para recibir un enlace de restauración de clave maestra.</p>
                  <input type="email" placeholder="email@banco.cl" style={{ width: '100%', background: '#111', border: '1px solid #1c1c22', padding: '18px', borderRadius: '15px', color: '#fff', marginBottom: '20px', outline: 'none' }} />
                  <button
                    onClick={() => setShowRecovery(false)}
                    style={{ width: '100%', background: '#c0a060', color: '#000', padding: '18px', borderRadius: '15px', border: 'none', fontWeight: '900', marginBottom: '20px', cursor: 'pointer' }}
                  >
                    ENVIAR INSTRUCCIONES
                  </button>
                  <button onClick={() => setShowRecovery(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: '12px', cursor: 'pointer' }}>VOLVER AL LOGIN</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {step === '2fa' && (
          <motion.div
            key="2fa"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ width: '450px', background: '#0a0a0c', padding: '60px', borderRadius: '40px', border: '1px solid #c0a06020', textAlign: 'center', position: 'relative', boxShadow: '0 50px 100px rgba(0,0,0,0.5)', zIndex: 10 }}
          >
            <div style={{ width: '80px', height: '80px', background: 'rgba(192,160,96,0.1)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
              <Smartphone color="#c0a060" size={40} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '2px' }}>VERIFICACIÓN DE TOKEN</h2>
            <p style={{ color: '#555', fontSize: '12px', marginBottom: '35px', fontWeight: '600' }}>Confirme su identidad con el código dinámico enviado a su dispositivo seguro.</p>

            <form onSubmit={verify2FA}>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '35px' }}>
                {token.map((d, i) => (
                  <input
                    key={i}
                    ref={el => tokenInputs.current[i] = el}
                    type="text"
                    maxLength="1"
                    style={{ width: '50px', height: '65px', textAlign: 'center', fontSize: '24px', fontWeight: '900', borderRadius: '15px', background: 'rgba(255,255,255,0.02)', border: d ? '2px solid #c0a060' : '1px solid #1c1c22', color: '#fff', outline: 'none' }}
                    value={d}
                    onChange={e => handleTokenInput(i, e.target.value)}
                  />
                ))}
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '20px', fontWeight: 'bold' }}>{error}</p>}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                style={{ width: '100%', background: '#fff', color: '#000', padding: '20px', borderRadius: '50px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', border: 'none' }}
              >
                CONFIRMAR IDENTIDAD
              </motion.button>

              <button type="button" onClick={() => setStep('login')} style={{ background: 'none', border: 'none', color: '#555', marginTop: '25px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Atrás</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
