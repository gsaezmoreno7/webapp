import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Plus, ArrowDownLeft, X, Landmark, ShieldCheck, Lock, Cpu,
  Smartphone, ArrowRight, User, Bell, ChevronRight, BarChart3, Globe2, Layers, History, PieChart, Info,
  Wallet, LogOut
} from 'lucide-react';
import { AIConcierge } from './Landing';
import axios from 'axios';

const ActionModal = ({ type, isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('form'); 
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [rut, setRut] = useState('');
  const [token, setToken] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const tokenInputs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setAmount('');
      setToken(['', '', '', '', '', '']);
      setDestination('');
      setRut('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const titles = {
    transfer: 'ORDEN DE TRANSFERENCIA',
    deposit: 'REGISTRO DE DEPÓSITO',
    withdraw: 'ORDEN DE GIRO (RETIRO)'
  };

  const handleNext = (e) => { e.preventDefault(); setStep('token'); };

  const handleTokenInput = (index, val) => {
    if (isNaN(val)) return;
    const nt = [...token]; nt[index] = val.slice(-1); setToken(nt);
    if (val && index < 5) {
        setTimeout(() => {
            if (tokenInputs.current[index + 1]) tokenInputs.current[index + 1].focus();
        }, 10);
    }
  };

  const finalizeTransaction = async (e) => {
    e.preventDefault();
    if (token.join('') !== '123456') { 
        alert('Token de seguridad incorrecto. Use 123456');
        setToken(['', '', '', '', '', '']); 
        if (tokenInputs.current[0]) tokenInputs.current[0].focus(); 
        return; 
    }
    setLoading(true);
    setTimeout(() => {
      onSuccess(parseFloat(amount), type);
      onClose();
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%', maxWidth: '450px', background: '#0a0a0c', padding: '45px', borderRadius: '40px', border: '1px solid #c0a06030', position: 'relative', boxShadow: '0 50px 100px rgba(0,0,0,0.8)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '25px', right: '25px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#555', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
        {step === 'form' ? (
          <form onSubmit={handleNext}>
            <h2 style={{ fontSize: '18px', color: '#c0a060', marginBottom: '35px', fontWeight: '900', letterSpacing: '1px' }}>{titles[type]}</h2>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '900', color: '#444', marginBottom: '12px', letterSpacing: '1px' }}>IMPORTE DE OPERACIÓN (CLP)</label>
              <input type="number" placeholder="0" style={{ width: '100%', background: '#000', border: '1px solid #1c1c22', padding: '22px', borderRadius: '15px', color: '#fff', fontSize: '28px', fontWeight: '900', outline: 'none', textAlign: 'center' }} required value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            {type === 'transfer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                 <input type="text" placeholder="RUT DESTINATARIO" style={{ width: '100%', background: '#111', border: '1px solid #1c1c22', padding: '18px', borderRadius: '15px', color: '#fff', outline: 'none' }} required value={rut} onChange={e => setRut(e.target.value)} />
                 <input type="text" placeholder="CUENTA BANCARIA" style={{ width: '100%', background: '#111', border: '1px solid #1c1c22', padding: '18px', borderRadius: '15px', color: '#fff', outline: 'none' }} required value={destination} onChange={e => setDestination(e.target.value)} />
              </div>
            )}
            <button type="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #c0a060, #9a7d46)', color: '#000', borderRadius: '50px', padding: '22px', fontWeight: '900', marginTop: '35px', border: 'none', cursor: 'pointer', transition: '0.3s', fontSize: '14px' }}>CONTINUAR FIRMA</button>
          </form>
        ) : (
          <form onSubmit={finalizeTransaction}>
             <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                <ShieldCheck color="#c0a060" size={55} style={{ marginBottom: '20px' }} />
                <h2 style={{ fontSize: '18px', fontWeight: '900' }}>FIRMA ELECTRÓNICA AVANZADA</h2>
                <p style={{ fontSize: '11px', color: '#555', marginTop: '10px' }}>Introduzca el Token Maestro: <span style={{ color: '#c0a060' }}>123456</span></p>
             </div>
             <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '45px' }}>
                {token.map((d, i) => (
                  <input key={i} ref={el => tokenInputs.current[i] = el} type="text" maxLength="1" style={{ width: '45px', height: '65px', textAlign: 'center', fontSize: '26px', fontWeight: '900', background: '#000', border: d ? '2px solid #c0a060' : '1px solid #1c1c22', borderRadius: '15px', color: '#fff', outline: 'none' }} value={d} onChange={e => handleTokenInput(i, e.target.value)} />
                ))}
             </div>
             <button type="submit" disabled={loading} style={{ width: '100%', background: '#fff', color: '#000', borderRadius: '50px', padding: '22px', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '14px' }}>{loading ? 'CIFRANDO OPERACIÓN...' : 'EJECUTAR ORDEN'}</button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

const GoldCard = ({ account, onUpdateStatus }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const isBlocked = account?.card_status === 'blocked';
  return (
    <motion.div initial={{ rotateY: -20, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} style={{ perspective: '1200px', marginBottom: '40px', cursor: 'pointer' }} onClick={() => setIsFlipped(!isFlipped)}>
      <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.8, type: 'spring', stiffness: 100 }} style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: '300px' }}>
        <div style={{ backfaceVisibility: 'hidden', background: isBlocked ? 'linear-gradient(135deg, #222 0%, #111 100%)' : 'linear-gradient(135deg, #c0a060 0%, #9a7d46 50%, #c0a060 100%)', color: isBlocked ? '#555' : '#000', padding: '45px', borderRadius: '35px', position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: isBlocked ? '0 20px 40px rgba(0,0,0,0.8)' : '0 40px 80px rgba(192, 160, 96, 0.3)', border: '1px solid rgba(255,255,255,0.1)', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div><Landmark size={38} /><p style={{ fontSize: '10px', fontWeight: '900', marginTop: '10px', letterSpacing: '2px' }}>GOLD MASTER CERTIFIED</p></div>
            <Cpu size={50} style={{ opacity: 0.6 }} />
          </div>
          <div style={{ padding: '15px 0' }}>
              <p style={{ fontSize: '10px', fontWeight: '900', opacity: 0.5, letterSpacing: '1px', marginBottom: '5px' }}>SALDO DISPONIBLE</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '900' }}>$</span>
                  <span style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '-1px' }}>{account?.balance?.toLocaleString()}</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.8 }}>CLP</span>
              </div>
          </div>
          <div>
            <p style={{ fontSize: '22px', marginBottom: '20px', letterSpacing: '4px', opacity: 0.9 }}>••••  ••••  ••••  {account?.account_number?.slice(-4) || '8888'}</p>
            <p style={{ fontSize: '9px', fontWeight: '900', opacity: 0.4 }}>PINCHA PARA REVELAR DATOS</p>
          </div>
          {isBlocked && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', borderRadius: '35px' }}>
              <div style={{ background: '#ff453a', color: '#fff', padding: '15px 30px', borderRadius: '50px', fontWeight: '900', fontSize: '13px', border: '2px solid rgba(255,255,255,0.4)' }}>ACCESO RESTRINGIDO</div>
            </div>
          )}
        </div>
        <div style={{ backfaceVisibility: 'hidden', background: '#111', color: '#c0a060', padding: '45px', borderRadius: '35px', position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', transform: 'rotateY(180deg)', border: '1px solid #c0a060', boxShadow: '0 0 40px rgba(192, 160, 96, 0.2)', zIndex: 1 }}>
          <div style={{ marginBottom: '30px' }}>
             <p style={{ fontSize: '10px', fontWeight: '900', color: '#555', marginBottom: '8px' }}>NÚMERO DE CUENTA</p>
             <p style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '2px', color: '#fff' }}>{account?.account_number || 'GB-0000-GOLD'}</p>
          </div>
          <div style={{ marginBottom: '30px' }}>
             <p style={{ fontSize: '10px', fontWeight: '900', color: '#555', marginBottom: '8px' }}>RUT TITULAR</p>
             <p style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>{account?.rut || '19.600.071-2'}</p>
          </div>
          <div style={{ display: 'flex', gap: '40px' }}>
             <div><p style={{ fontSize: '10px', fontWeight: '900', color: '#555', marginBottom: '8px' }}>VENCIMIENTO</p><p style={{ fontSize: '14px', fontWeight: '900', color: '#fff' }}>12/30</p></div>
             <div><p style={{ fontSize: '10px', fontWeight: '900', color: '#555', marginBottom: '8px' }}>CVV</p><p style={{ fontSize: '14px', fontWeight: '900', color: '#fff' }}>842</p></div>
          </div>
        </div>
      </motion.div>
      <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
        <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(isBlocked ? 'unblock' : 'block'); }} style={{ flex: 1, padding: '20px', borderRadius: '22px', background: isBlocked ? '#10b98120' : '#ff453a20', border: `1px solid ${isBlocked ? '#10b98140' : '#ff453a40'}`, color: isBlocked ? '#10b981' : '#ff453a', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          {isBlocked ? <ShieldCheck size={20}/> : <Lock size={20}/>} {isBlocked ? 'ACTIVAR' : 'BLOQUEAR'}
        </button>
        <button style={{ flex: 1, padding: '20px', borderRadius: '22px', background: '#111', border: '1px solid #1c1c22', color: '#555', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>SEGURIDAD</button>
      </div>
    </motion.div>
  );
};

const Dashboard = ({ onLogout }) => {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  const fetchData = async (addedAmount = 0, type = '') => {
    const t = localStorage.getItem('gold_token') || localStorage.getItem('token');
    const userStr = localStorage.getItem('gold_user');
    const user = userStr ? JSON.parse(userStr) : { full_name: 'GONZALO SÁEZ' };
    try {
      const [accRes, txRes] = await Promise.all([
        axios.get('http://localhost:3000/api/account', { headers: { Authorization: `Bearer ${t}` } }),
        axios.get('http://localhost:3000/api/transactions?limit=8', { headers: { Authorization: `Bearer ${t}` } })
      ]);
      let accData = accRes.data.account;
      let txData = txRes.data.transactions;
      if (addedAmount !== 0) {
        accData.balance += (type === 'deposit' ? addedAmount : -addedAmount);
        txData.unshift({ id: Date.now(), type: type, amount: addedAmount, description: 'Operación Gold Reciente', created_at: new Date().toISOString() });
      }
      setAccount(accData); setTransactions(txData);
    } catch (err) {
      const curBalance = account ? account.balance : 2500000;
      const newBalance = curBalance + (type === 'deposit' ? addedAmount : -addedAmount);
      setAccount({ full_name: user.full_name, account_number: account?.account_number || 'GB-9900-GOLD', rut: account?.rut || '19.600.071-2', balance: addedAmount !== 0 ? newBalance : 2500000, currency: 'CLP', card_status: account?.card_status || 'active' });
      const defaultTx = [{ id: '1', type: 'deposit', amount: 2500000, description: 'Capital Inicial Noble Gold', created_at: new Date().toISOString() }];
      if (addedAmount !== 0) defaultTx.unshift({ id: Date.now(), type: type, amount: addedAmount, description: 'Protocolo Local', created_at: new Date().toISOString() });
      setTransactions(defaultTx);
    } finally { setLoading(false); }
  };

  const handleCardStatus = async (status) => {
    const t = localStorage.getItem('gold_token') || localStorage.getItem('token');
    try {
      await axios.post(`http://localhost:3000/api/account/card/${status}`, {}, { headers: { Authorization: `Bearer ${t}` } });
      await fetchData();
    } catch (err) { setAccount({...account, card_status: status === 'block' ? 'blocked' : 'active'}); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div style={{ minHeight: '100vh', background: '#050505', color: '#c0a060', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', letterSpacing: '4px', fontSize: '18px' }}>AUTENTICANDO ACCESO GOLD MASTER...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '50px' }}>
      <AIConcierge />
      <ActionModal type={activeModal} isOpen={!!activeModal} onClose={() => setActiveModal(null)} onSuccess={(amt, type) => fetchData(amt, type)} />
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '70px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '22px', background: 'linear-gradient(135deg, #c0a060, #8a6e3d)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 15px 30px rgba(192,160,96,0.3)' }}><User size={35} color="#000" /></div>
            <div><h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' }}>PORTAL NOBLE GOLD</h1><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div><p style={{ color: '#10b981', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>SISTEMA ACTIVO</p></div></div>
          </div>
          <button onClick={onLogout} style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '18px 40px', borderRadius: '18px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}><LogOut size={20} /> CERRAR SESIÓN</button>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '50px' }}>
          <div><GoldCard account={account} onUpdateStatus={handleCardStatus} /><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px', marginTop: '10px' }}>
               <button onClick={() => setActiveModal('transfer')} style={{ background: '#0a0a0c', border: '1px solid #1c1c22', padding: '35px', borderRadius: '35px', cursor: 'pointer', textAlign: 'center' }}><Send color="#3b82f6" size={35} style={{ marginBottom: '18px' }} /><p style={{ fontWeight: '900', fontSize: '12px', color: '#fff', letterSpacing: '1.5px' }}>TRANSFERENCIA</p></button>
               <button onClick={() => setActiveModal('deposit')} style={{ background: '#0a0a0c', border: '1px solid #1c1c22', padding: '35px', borderRadius: '35px', cursor: 'pointer', textAlign: 'center' }}><Plus color="#10b981" size={35} style={{ marginBottom: '18px' }} /><p style={{ fontWeight: '900', fontSize: '12px', color: '#fff', letterSpacing: '1.5px' }}>DEPÓSITO</p></button>
               <button onClick={() => setActiveModal('withdraw')} style={{ background: '#0a0a0c', border: '1px solid #1c1c22', padding: '35px', borderRadius: '35px', cursor: 'pointer', textAlign: 'center' }}><Wallet color="#f59e0b" size={35} style={{ marginBottom: '18px' }} /><p style={{ fontWeight: '900', fontSize: '12px', color: '#fff', letterSpacing: '1.5px' }}>GIRO CAJERO</p></button>
            </div></div>
          <div style={{ background: '#0a0a0c', borderRadius: '45px', border: '1px solid #1c1c22', padding: '45px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}><h3 style={{ fontSize: '16px', fontWeight: '900', color: '#c0a060', marginBottom: '40px', letterSpacing: '1px', textTransform: 'uppercase' }}>HISTORIAL DE ACTIVOS</h3><div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {transactions.map((tx, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}><div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '15px' }}>{tx.type === 'deposit' ? <Plus size={18} color="#10b981"/> : <Send size={18} color="#3b82f6"/>}</div><div><p style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{tx.description}</p><p style={{ fontSize: '10px', color: '#444', fontWeight: '900', marginTop: '4px' }}>{new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p></div></div>
                     <p style={{ fontWeight: '900', fontSize: '16px', color: tx.type === 'deposit' ? '#10b981' : '#fff' }}>{tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}</p>
                  </div>
                ))}
             </div></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
