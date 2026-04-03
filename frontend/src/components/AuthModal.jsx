import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const T = {
  bg:'#080C14', bgCard:'rgba(12,18,32,0.85)',
  border:'rgba(91,163,201,0.15)', borderFocus:'rgba(91,163,201,0.5)',
  text:'#E4EBF5', textSub:'#A0B4C8', textMuted:'#738A9F',
  accent1:'#5BA3C9', accent2:'#8B7EC8', green:'#4FA882',
  input:'rgba(8,12,20,0.6)', errorBg:'rgba(224,122,122,0.08)', errorText:'#E07A7A'
};

export default function AuthModal({ onClose }) {
  const [mode, setMode]     = useState('login'); // 'login' | 'register'
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [error, setError]   = useState('');
  const [busy, setBusy]     = useState(false);
  const { login, register } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, pass);
      } else {
        if (!name.trim()) { setError('Name is required'); setBusy(false); return; }
        await register(name, email, pass);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div 
      style={{ position:'fixed', inset:0, zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
      onClick={onClose}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');
        .auth-input {
          width: 100%; background: ${T.input}; border: 1px solid ${T.border};
          border-radius: 10px; padding: 12px 14px; color: ${T.text}; font-size: 14px;
          outline: none; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }
        .auth-input:focus {
          border-color: ${T.borderFocus};
          box-shadow: 0 0 0 3px rgba(91,163,201,0.1), inset 0 2px 4px rgba(0,0,0,0.2);
          background: rgba(12,18,30,0.8);
        }
        .auth-input::placeholder { color: ${T.textMuted}; opacity: 0.5; }
      `}</style>

      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ position:'absolute', inset:0, background:'rgba(8,12,20,0.6)' }}
      />

      {/* Modal Card */}
      <motion.div 
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ 
          position:'relative', width:'100%', maxWidth:'420px', 
          background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:'20px', 
          boxShadow:'0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)', 
          fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:'hidden'
        }}
      >
        {/* Glow Effect Top Right */}
        <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'200px', height:'200px', background:`radial-gradient(circle, ${T.accent2}20, transparent 70%)`, filter:'blur(40px)', pointerEvents:'none' }} />

        {/* Header */}
        <div style={{ padding:'28px 28px 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
              <div style={{ width:24, height:24, borderRadius:'6px', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', color:'#fff', boxShadow:`0 4px 12px rgba(91,163,201,0.3)` }}>⬡</div>
              <span style={{ fontSize:'14px', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, color:T.text, letterSpacing:'-0.02em' }}>ArchFlow</span>
            </div>
            <motion.div layout="position" style={{ fontSize:'22px', fontWeight:800, color:T.text, letterSpacing:'-0.03em', lineHeight:1.2 }}>
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </motion.div>
            <motion.div layout="position" style={{ fontSize:'14px', color:T.textMuted, marginTop:'4px' }}>
              {mode === 'login' ? 'Sign in to access your workspaces.' : 'Save and export your architecture designs.'}
            </motion.div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${T.border}`, borderRadius:'8px', width:'28px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center', color:T.textMuted, fontSize:'14px', cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }} 
            onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
            ✕
          </button>
        </div>

        {/* Form */}
        <motion.form layout onSubmit={submit} style={{ padding:'24px 28px 28px', display:'flex', flexDirection:'column', gap:'16px' }}>
          <AnimatePresence initial={false}>
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <label style={{ fontSize:'11px', color:T.textMuted, fontFamily:"'Fira Code',monospace", fontWeight:600, letterSpacing:'0.05em', display:'block', marginBottom:'6px' }}>FULL NAME</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" className="auth-input" />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout="position">
            <label style={{ fontSize:'11px', color:T.textMuted, fontFamily:"'Fira Code',monospace", fontWeight:600, letterSpacing:'0.05em', display:'block', marginBottom:'6px' }}>EMAIL ADDRESS</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="auth-input" />
          </motion.div>

          <motion.div layout="position">
            <label style={{ fontSize:'11px', color:T.textMuted, fontFamily:"'Fira Code',monospace", fontWeight:600, letterSpacing:'0.05em', display:'block', marginBottom:'6px' }}>PASSWORD</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required minLength={6} className="auth-input" />
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }} 
                animate={{ opacity: 1, y: 0, height: 'auto' }} 
                exit={{ opacity: 0, y: -10, height: 0 }}
                style={{ background:T.errorBg, border:`1px solid rgba(224,122,122,0.2)`, borderRadius:'10px', padding:'10px 14px', fontSize:'13px', color:T.errorText, display:'flex', alignItems:'center', gap:'8px', fontWeight:500 }}
              >
                <span style={{ fontSize:'16px' }}>⚠️</span> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button 
            layout="position"
            type="submit" 
            disabled={busy}
            whileHover={!busy ? { scale: 1.02 } : {}}
            whileTap={!busy ? { scale: 0.98 } : {}}
            style={{ 
              padding:'14px', borderRadius:'12px', border:'none', 
              background: busy ? T.input : `linear-gradient(135deg,${T.accent1},${T.accent2})`, 
              color: busy ? T.textMuted : '#fff', fontSize:'15px', fontWeight:700, 
              cursor: busy ? 'not-allowed' : 'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", 
              marginTop:'8px', boxShadow: busy ? 'none' : `0 8px 24px rgba(91,163,201,0.25), inset 0 1px 0 rgba(255,255,255,0.2)`,
              transition: 'background 0.2s, color 0.2s'
            }}
          >
            {busy ? (
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                <div style={{ width:14, height:14, border:'2px solid', borderColor:`${T.textMuted} transparent transparent transparent`, borderRadius:'50%', animation:'spin 1s linear infinite' }} /> Processing...
              </span>
            ) : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </motion.button>

          <motion.div layout="position" style={{ textAlign:'center', fontSize:'13px', color:T.textMuted, marginTop:'4px' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ background:'none', border:'none', color:T.accent1, cursor:'pointer', fontSize:'13px', fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:0 }}>
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </motion.div>
        </motion.form>
      </motion.div>

      {/* Loading Spinner Keyframe */}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}