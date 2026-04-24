import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Users, Activity, DollarSign, TrendingUp,
  RefreshCw, Eye, ToggleLeft, ToggleRight, LogOut, X,
  ArrowUpRight, ArrowDownLeft, Send, AlertTriangle, Clock,
  BarChart3, Database, Globe2
} from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ===================== STAT CARD =====================
const StatCard = ({ icon: Icon, label, value, sub, color = '#c0a060', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    style={{
      background: '#0a0a0c',
      border: `1px solid ${color}20`,
      borderRadius: '28px',
      padding: '35px',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div style={{
      position: 'absolute', top: '-20px', right: '-20px',
      width: '100px', height: '100px', borderRadius: '50%',
      background: `${color}10`,
    }} />
    <div style={{
      width: '55px', height: '55px', borderRadius: '18px',
      background: `${color}15`, display: 'flex',
      alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
    }}>
      <Icon size={26} color={color} />
    </div>
    <p style={{ fontSize: '11px', color: '#555', fontWeight: '900', letterSpacing: '1px', marginBottom: '8px' }}>
      {label}
    </p>
    <p style={{ fontSize: '32px', fontWeight: '900', color: '#fff', letterSpacing: '-1px' }}>
      {value}
    </p>
    {sub && (
      <p style={{ fontSize: '11px', color: color, marginTop: '8px', fontWeight: 'bold' }}>{sub}</p>
    )}
  </motion.div>
);

// ===================== ACCOUNT ROW =====================
const AccountRow = ({ acc, onToggle, onView }) => {
  const isActive = acc.is_active;
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ borderBottom: '1px solid #111' }}
    >
      <td style={{ padding: '18px 20px', fontSize: '13px', color: '#aaa' }}>
        {acc.profiles?.full_name || '—'}
      </td>
      <td style={{ padding: '18px 20px', fontSize: '12px', color: '#c0a060', fontFamily: 'monospace' }}>
        {acc.account_number}
      </td>
      <td style={{ padding: '18px 20px', fontSize: '14px', fontWeight: '900', color: '#fff' }}>
        ${parseFloat(acc.balance).toLocaleString()}
      </td>
      <td style={{ padding: '18px 20px' }}>
        <span style={{
          background: isActive ? '#10b98120' : '#ff453a20',
          color: isActive ? '#10b981' : '#ff453a',
          border: `1px solid ${isActive ? '#10b98140' : '#ff453a40'}`,
          padding: '5px 14px', borderRadius: '50px', fontSize: '10px', fontWeight: '900'
        }}>
          {isActive ? 'ACTIVA' : 'DESACTIVADA'}
        </span>
      </td>
      <td style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onView(acc)}
            style={{
              background: '#1a1a2e', border: '1px solid #333',
              color: '#888', padding: '8px 16px', borderRadius: '10px',
              cursor: 'pointer', fontSize: '11px', fontWeight: '900',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Eye size={14} /> VER
          </button>
          <button
            onClick={() => onToggle(acc)}
            style={{
              background: isActive ? '#ff453a15' : '#10b98115',
              border: `1px solid ${isActive ? '#ff453a40' : '#10b98140'}`,
              color: isActive ? '#ff453a' : '#10b981',
              padding: '8px 16px', borderRadius: '10px',
              cursor: 'pointer', fontSize: '11px', fontWeight: '900',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            {isActive ? 'DESACT.' : 'ACTIVAR'}
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ===================== TX ROW =====================
const TxRow = ({ tx }) => {
  const colors = {
    deposit: '#10b981',
    withdrawal: '#f59e0b',
    transfer_in: '#3b82f6',
    transfer_out: '#8b5cf6',
  };
  const icons = {
    deposit: ArrowDownLeft,
    withdrawal: ArrowUpRight,
    transfer_in: ArrowDownLeft,
    transfer_out: Send,
  };
  const Icon = icons[tx.type] || Activity;
  const color = colors[tx.type] || '#888';

  return (
    <tr style={{ borderBottom: '1px solid #111' }}>
      <td style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: `${color}15`, padding: '8px', borderRadius: '10px'
          }}>
            <Icon size={15} color={color} />
          </div>
          <span style={{ fontSize: '11px', color: color, fontWeight: '900' }}>
            {tx.type?.toUpperCase().replace('_', ' ')}
          </span>
        </div>
      </td>
      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#aaa' }}>
        {tx.accounts?.profiles?.full_name || tx.accounts?.account_number || '—'}
      </td>
      <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '900', color: '#fff' }}>
        ${parseFloat(tx.amount).toLocaleString()}
      </td>
      <td style={{ padding: '14px 20px', fontSize: '11px', color: '#555', maxWidth: '200px' }}>
        {tx.description || '—'}
      </td>
      <td style={{ padding: '14px 20px', fontSize: '11px', color: '#444' }}>
        {new Date(tx.created_at).toLocaleString()}
      </td>
    </tr>
  );
};

// ===================== ACCOUNT DETAIL MODAL =====================
const AccountDetailModal = ({ account, onClose }) => {
  if (!account) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(20px)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            width: '100%', maxWidth: '600px', background: '#0a0a0c',
            border: '1px solid #c0a06030', borderRadius: '40px',
            padding: '50px', position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '25px', right: '25px',
              background: 'rgba(255,255,255,0.05)', border: 'none',
              color: '#555', padding: '10px', borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>

          <h2 style={{ color: '#c0a060', fontSize: '18px', fontWeight: '900', marginBottom: '35px', letterSpacing: '1px' }}>
            DETALLE DE CUENTA
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            {[
              { l: 'TITULAR', v: account.profiles?.full_name },
              { l: 'RUT', v: account.profiles?.rut },
              { l: 'NÚMERO DE CUENTA', v: account.account_number },
              { l: 'SALDO', v: `$${parseFloat(account.balance).toLocaleString()} CLP` },
              { l: 'ESTADO', v: account.is_active ? 'Activa' : 'Desactivada' },
              { l: 'TARJETA', v: account.card_status?.toUpperCase() },
              { l: 'MONEDA', v: account.currency },
              { l: 'CREADA', v: new Date(account.created_at).toLocaleDateString() },
            ].map(({ l, v }) => (
              <div key={l} style={{ background: '#111', borderRadius: '15px', padding: '20px' }}>
                <p style={{ fontSize: '9px', color: '#555', fontWeight: '900', letterSpacing: '1px', marginBottom: '8px' }}>{l}</p>
                <p style={{ fontSize: '15px', color: '#fff', fontWeight: '700' }}>{v || '—'}</p>
              </div>
            ))}
          </div>

          {account.recent_transactions?.length > 0 && (
            <>
              <h3 style={{ color: '#555', fontSize: '11px', fontWeight: '900', letterSpacing: '1px', marginBottom: '15px' }}>
                ÚLTIMAS TRANSACCIONES
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {account.recent_transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} style={{
                    display: 'flex', justifyContent: 'space-between',
                    background: '#111', borderRadius: '12px', padding: '15px 20px'
                  }}>
                    <span style={{ fontSize: '12px', color: '#aaa' }}>{tx.description}</span>
                    <span style={{
                      fontSize: '13px', fontWeight: '900',
                      color: tx.type === 'deposit' || tx.type === 'transfer_in' ? '#10b981' : '#f59e0b'
                    }}>
                      ${parseFloat(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ===================== MAIN ADMIN DASHBOARD =====================
const AdminDashboard = ({ onLogout }) => {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [txFilter, setTxFilter] = useState('');
  const [txPage, setTxPage] = useState(1);
  const [txPagination, setTxPagination] = useState({});
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('gold_token') || localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadStats = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/stats`, { headers });
      setStats(res.data.stats);
    } catch (e) {
      showToast('Error al cargar estadísticas', 'error');
    }
  };

  const loadAccounts = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/accounts`, { headers });
      setAccounts(res.data.accounts || []);
    } catch (e) {
      showToast('Error al cargar cuentas', 'error');
    }
  };

  const loadTransactions = async (page = 1, type = '') => {
    try {
      const params = new URLSearchParams({ page, limit: 30 });
      if (type) params.append('type', type);
      const res = await axios.get(`${API}/api/admin/transactions?${params}`, { headers });
      setTransactions(res.data.transactions || []);
      setTxPagination(res.data.pagination || {});
    } catch (e) {
      showToast('Error al cargar transacciones', 'error');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadAccounts()]);
      await loadTransactions();
      setLoading(false);
    };
    init();
  }, []);

  const handleToggle = async (acc) => {
    try {
      await axios.patch(`${API}/api/admin/accounts/${acc.id}/toggle`, {}, { headers });
      showToast(`Cuenta ${acc.account_number} ${acc.is_active ? 'desactivada' : 'activada'}`);
      await loadAccounts();
      await loadStats();
    } catch (e) {
      showToast('Error al modificar cuenta', 'error');
    }
  };

  const handleViewAccount = async (acc) => {
    try {
      const res = await axios.get(`${API}/api/admin/accounts/${acc.id}`, { headers });
      setSelectedAccount({
        ...res.data.account,
        recent_transactions: res.data.recent_transactions,
      });
    } catch {
      setSelectedAccount(acc);
    }
  };

  const handleFilterChange = (type) => {
    setTxFilter(type);
    setTxPage(1);
    loadTransactions(1, type);
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#050505',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '20px'
    }}>
      <ShieldCheck size={60} color="#c0a060" />
      <p style={{ color: '#c0a060', fontWeight: '900', letterSpacing: '4px', fontSize: '16px' }}>
        CARGANDO PANEL MAESTRO...
      </p>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'RESUMEN', icon: BarChart3 },
    { id: 'accounts', label: 'CUENTAS', icon: Users },
    { id: 'audit', label: 'AUDITORÍA', icon: Activity },
  ];

  const txTypes = ['', 'deposit', 'withdrawal', 'transfer_in', 'transfer_out'];

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: "'Inter', sans-serif" }}>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            style={{
              position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
              background: toast.type === 'error' ? '#ff453a20' : '#10b98120',
              border: `1px solid ${toast.type === 'error' ? '#ff453a40' : '#10b98140'}`,
              color: toast.type === 'error' ? '#ff453a' : '#10b981',
              padding: '14px 28px', borderRadius: '50px', fontWeight: '900',
              zIndex: 2000, fontSize: '13px',
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div style={{
        background: '#0a0a0c', borderBottom: '1px solid #1c1c22',
        padding: '25px 50px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '50px', height: '50px', borderRadius: '15px',
            background: 'linear-gradient(135deg, #c0a060, #8a6e3d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={26} color="#000" />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '1px' }}>
              PANEL ADMINISTRADOR
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
              <div style={{ width: '7px', height: '7px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ color: '#10b981', fontSize: '10px', fontWeight: '900', letterSpacing: '1px' }}>
                SISTEMA ACTIVO
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* TABS */}
          <div style={{ display: 'flex', gap: '8px', background: '#111', borderRadius: '18px', padding: '6px' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  padding: '10px 22px', borderRadius: '12px',
                  border: 'none', cursor: 'pointer', fontWeight: '900',
                  fontSize: '11px', letterSpacing: '1px',
                  background: tab === id ? '#c0a060' : 'transparent',
                  color: tab === id ? '#000' : '#555',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <button
            onClick={onLogout}
            style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', padding: '14px 24px', borderRadius: '14px',
              fontWeight: '900', fontSize: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            <LogOut size={16} /> SALIR
          </button>
        </div>
      </div>

      {/* ACCOUNT DETAIL MODAL */}
      {selectedAccount && (
        <AccountDetailModal account={selectedAccount} onClose={() => setSelectedAccount(null)} />
      )}

      <div style={{ padding: '50px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* ===== OVERVIEW ===== */}
        {tab === 'overview' && stats && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '50px' }}>
              <StatCard icon={Users} label="CUENTAS REGISTRADAS" value={stats.accounts.total} sub={`${stats.accounts.active} activas`} color="#3b82f6" delay={0} />
              <StatCard icon={Activity} label="TRANSACCIONES TOTALES" value={stats.transactions.total} sub={`${stats.transactions.last_24h} en las últimas 24h`} color="#10b981" delay={0.1} />
              <StatCard icon={DollarSign} label="FONDOS EN SISTEMA" value={`$${(stats.funds.total_in_system / 1000000).toFixed(1)}M`} sub="CLP circulando" color="#c0a060" delay={0.2} />
              <StatCard icon={Clock} label="UPTIME SERVIDOR" value={`${Math.floor(stats.system.uptime_seconds / 60)}m`} sub={stats.system.environment} color="#8b5cf6" delay={0.3} />
            </div>

            {/* By Type */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                background: '#0a0a0c', border: '1px solid #1c1c22',
                borderRadius: '35px', padding: '45px',
              }}
            >
              <h3 style={{ color: '#c0a060', fontSize: '14px', fontWeight: '900', marginBottom: '35px', letterSpacing: '1px' }}>
                DISTRIBUCIÓN DE TRANSACCIONES POR TIPO
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                {['deposit', 'withdrawal', 'transfer_in', 'transfer_out'].map((type) => {
                  const count = stats.transactions.by_type?.[type] || 0;
                  const total = stats.transactions.total || 1;
                  const pct = Math.round((count / total) * 100);
                  const colors = { deposit: '#10b981', withdrawal: '#f59e0b', transfer_in: '#3b82f6', transfer_out: '#8b5cf6' };
                  return (
                    <div key={type} style={{ background: '#111', borderRadius: '20px', padding: '25px' }}>
                      <p style={{ fontSize: '10px', color: '#555', fontWeight: '900', letterSpacing: '1px', marginBottom: '12px' }}>
                        {type.toUpperCase().replace('_', ' ')}
                      </p>
                      <p style={{ fontSize: '28px', fontWeight: '900', color: colors[type] }}>{count}</p>
                      <div style={{ marginTop: '12px', background: '#1c1c22', borderRadius: '50px', height: '4px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.6, duration: 0.8 }}
                          style={{ height: '100%', background: colors[type], borderRadius: '50px' }}
                        />
                      </div>
                      <p style={{ fontSize: '11px', color: '#444', marginTop: '8px' }}>{pct}% del total</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}

        {/* ===== ACCOUNTS ===== */}
        {tab === 'accounts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#c0a060', letterSpacing: '1px' }}>
                GESTIÓN DE CUENTAS ({accounts.length})
              </h2>
              <button
                onClick={loadAccounts}
                style={{
                  background: '#111', border: '1px solid #222', color: '#888',
                  padding: '12px 22px', borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '11px', fontWeight: '900',
                }}
              >
                <RefreshCw size={14} /> ACTUALIZAR
              </button>
            </div>

            <div style={{ background: '#0a0a0c', border: '1px solid #1c1c22', borderRadius: '30px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#111' }}>
                    {['TITULAR', 'N° CUENTA', 'SALDO', 'ESTADO', 'ACCIONES'].map(h => (
                      <th key={h} style={{
                        padding: '18px 20px', textAlign: 'left',
                        fontSize: '10px', color: '#555', fontWeight: '900', letterSpacing: '1px'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <AccountRow key={acc.id} acc={acc} onToggle={handleToggle} onView={handleViewAccount} />
                  ))}
                </tbody>
              </table>
              {accounts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>
                  <Database size={40} style={{ marginBottom: '15px', opacity: 0.3 }} />
                  <p style={{ fontWeight: '900', letterSpacing: '1px' }}>No hay cuentas registradas</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ===== AUDIT ===== */}
        {tab === 'audit' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#c0a060', letterSpacing: '1px' }}>
                AUDITORÍA GLOBAL DE TRANSACCIONES
              </h2>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {txTypes.map(type => (
                  <button
                    key={type || 'all'}
                    onClick={() => handleFilterChange(type)}
                    style={{
                      padding: '10px 18px', borderRadius: '50px',
                      border: '1px solid',
                      borderColor: txFilter === type ? '#c0a060' : '#222',
                      background: txFilter === type ? '#c0a06015' : 'transparent',
                      color: txFilter === type ? '#c0a060' : '#555',
                      fontWeight: '900', fontSize: '10px', letterSpacing: '1px',
                      cursor: 'pointer'
                    }}
                  >
                    {type ? type.toUpperCase().replace('_', ' ') : 'TODOS'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#0a0a0c', border: '1px solid #1c1c22', borderRadius: '30px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#111' }}>
                    {['TIPO', 'CUENTA', 'MONTO', 'DESCRIPCIÓN', 'FECHA'].map(h => (
                      <th key={h} style={{
                        padding: '18px 20px', textAlign: 'left',
                        fontSize: '10px', color: '#555', fontWeight: '900', letterSpacing: '1px'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <TxRow key={tx.id} tx={tx} />
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>
                  <Activity size={40} style={{ marginBottom: '15px', opacity: 0.3 }} />
                  <p style={{ fontWeight: '900', letterSpacing: '1px' }}>Sin transacciones registradas</p>
                </div>
              )}
            </div>

            {/* Paginación */}
            {txPagination.total_pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '25px' }}>
                <button
                  disabled={txPage <= 1}
                  onClick={() => { const p = txPage - 1; setTxPage(p); loadTransactions(p, txFilter); }}
                  style={{
                    padding: '12px 24px', borderRadius: '50px', border: '1px solid #222',
                    background: '#111', color: txPage <= 1 ? '#333' : '#888',
                    cursor: txPage <= 1 ? 'not-allowed' : 'pointer', fontWeight: '900', fontSize: '12px'
                  }}
                >
                  ← ANTERIOR
                </button>
                <span style={{ padding: '12px 24px', color: '#555', fontSize: '12px', fontWeight: '900' }}>
                  {txPage} / {txPagination.total_pages}
                </span>
                <button
                  disabled={txPage >= txPagination.total_pages}
                  onClick={() => { const p = txPage + 1; setTxPage(p); loadTransactions(p, txFilter); }}
                  style={{
                    padding: '12px 24px', borderRadius: '50px', border: '1px solid #222',
                    background: '#111', color: txPage >= txPagination.total_pages ? '#333' : '#888',
                    cursor: txPage >= txPagination.total_pages ? 'not-allowed' : 'pointer', fontWeight: '900', fontSize: '12px'
                  }}
                >
                  SIGUIENTE →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
