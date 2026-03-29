import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const T = {
  bg:'#0C1220', border:'rgba(91,163,201,0.15)', text:'#E4EBF5',
  textSub:'#8FA5BC', textMuted:'#5E7A96', accent1:'#5BA3C9', accent2:'#8B7EC8',
  input:'rgba(8,12,20,0.8)', green:'#4FA882',
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
    <div style={{ position:'fixed', inset:0, zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(8,12,20,0.75)', backdropFilter:'blur(6px)', padding:'16px', animation:'fadeIn 0.2s ease both' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:'min(400px,100%)', background:T.bg, border:`1px solid ${T.border}`, borderRadius:'18px', overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,0.5)', animation:'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

        {/* Header */}
        <div style={{ padding:'22px 24px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:'18px', fontWeight:700, color:T.text, letterSpacing:'-0.02em' }}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </div>
            <div style={{ fontSize:'13px', color:T.textMuted, marginTop:'3px' }}>
              {mode === 'login' ? 'Sign in to access your saved designs' : 'Save and share your architecture designs'}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.textMuted, fontSize:'18px', cursor:'pointer', opacity:0.6, lineHeight:1 }}
            onMouseEnter={e => e.currentTarget.style.opacity='1'} onMouseLeave={e => e.currentTarget.style.opacity='0.6'}>✕</button>
        </div>

        <form onSubmit={submit} style={{ padding:'20px 24px 24px', display:'flex', flexDirection:'column', gap:'12px' }}>

          {mode === 'register' && (
            <div>
              <label style={{ fontSize:'12px', color:T.textMuted, fontFamily:"'Fira Code',monospace", display:'block', marginBottom:'5px' }}>NAME</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                style={{ width:'100%', background:T.input, border:`1px solid ${T.border}`, borderRadius:'8px', padding:'10px 12px', color:T.text, fontSize:'14px', outline:'none', fontFamily:"'Plus Jakarta Sans',sans-serif" }}
                onFocus={e => e.target.style.borderColor=T.accent1+'55'} onBlur={e => e.target.style.borderColor=T.border} />
            </div>
          )}

          <div>
            <label style={{ fontSize:'12px', color:T.textMuted, fontFamily:"'Fira Code',monospace", display:'block', marginBottom:'5px' }}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
              style={{ width:'100%', background:T.input, border:`1px solid ${T.border}`, borderRadius:'8px', padding:'10px 12px', color:T.text, fontSize:'14px', outline:'none', fontFamily:"'Plus Jakarta Sans',sans-serif" }}
              onFocus={e => e.target.style.borderColor=T.accent1+'55'} onBlur={e => e.target.style.borderColor=T.border} />
          </div>

          <div>
            <label style={{ fontSize:'12px', color:T.textMuted, fontFamily:"'Fira Code',monospace", display:'block', marginBottom:'5px' }}>PASSWORD</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required minLength={6}
              style={{ width:'100%', background:T.input, border:`1px solid ${T.border}`, borderRadius:'8px', padding:'10px 12px', color:T.text, fontSize:'14px', outline:'none', fontFamily:"'Plus Jakarta Sans',sans-serif" }}
              onFocus={e => e.target.style.borderColor=T.accent1+'55'} onBlur={e => e.target.style.borderColor=T.border} />
          </div>

          {error && (
            <div style={{ background:'rgba(196,96,96,0.1)', border:'1px solid rgba(196,96,96,0.25)', borderRadius:'8px', padding:'9px 12px', fontSize:'13px', color:'#C46060' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={busy}
            style={{ padding:'12px', borderRadius:'9px', border:'none', background: busy ? T.border : `linear-gradient(135deg,${T.accent1},${T.accent2})`, color: busy ? T.textMuted : '#fff', fontSize:'14px', fontWeight:700, cursor: busy ? 'not-allowed' : 'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", marginTop:'4px', transition:'all 0.2s' }}>
            {busy ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div style={{ textAlign:'center', fontSize:'13px', color:T.textMuted }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ background:'none', border:'none', color:T.accent1, cursor:'pointer', fontSize:'13px', fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}
