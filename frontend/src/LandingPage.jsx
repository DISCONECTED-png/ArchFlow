import React from 'react';
import { useEffect, useRef, useState } from 'react';

const SYSTEMS = ['Twitter','Netflix','Uber','WhatsApp','YouTube','Airbnb','Spotify','Amazon'];
const FEATURES = [
  { icon:'⬡', title:'AI-Generated Architecture', desc:'Describe any system in plain English. Cohere AI maps it into real production components — load balancers, caches, queues and all.', color:'#5BA3C9' },
  { icon:'◈', title:'Interactive Node Graph', desc:'Drag, zoom, pan. Click any node for deep-dive info. Built on React Flow for buttery smooth interactions.', color:'#8B7EC8' },
  { icon:'⬟', title:'9 Smart Component Types', desc:'Client, gateway, service, cache, DB, queue, storage, CDN, monitor — each auto-typed and color-coded by the AI.', color:'#4FA882' },
  { icon:'▣', title:'Design Rationale', desc:'Get the "why" behind each choice. Key architectural decisions explained alongside every diagram.', color:'#C49A3C' },
];
const STATS = [
  { value:50, suffix:'+', label:'Systems Supported' },
  { value:9,  suffix:'',  label:'Component Types'   },
  { value:100,suffix:'%', label:'Free to Use'       },
];
const TERMINAL_LINES = [
  { text:'$ archflow design "Twitter"',           color:'#5BA3C9', delay:0    },
  { text:'  → Analyzing requirements...',          color:'#8FA5BC', delay:0.7  },
  { text:'  → Identifying components (11)',        color:'#8FA5BC', delay:1.2  },
  { text:'  ✓ client: Mobile App, Web Browser',   color:'#4FA882', delay:1.7  },
  { text:'  ✓ gateway: Load Balancer',             color:'#4FA882', delay:2.1  },
  { text:'  ✓ database: PostgreSQL, Cassandra',    color:'#4FA882', delay:2.5  },
  { text:'  ✓ cache: Redis, CDN Edge',             color:'#4FA882', delay:2.9  },
  { text:'  ✓ queue: Kafka Message Bus',           color:'#4FA882', delay:3.3  },
  { text:'  → Building diagram...',                color:'#8FA5BC', delay:3.8  },
  { text:'  ✓ Architecture ready  ⬡',              color:'#C49A3C', delay:4.3  },
];
const ACCOUNT_PERKS = [
  { icon:'▣', label:'Save unlimited designs',  color:'#5BA3C9' },
  { icon:'⬡', label:'Share via public URL',    color:'#8B7EC8' },
  { icon:'↺', label:'Version history',         color:'#4FA882' },
  { icon:'↓', label:'PDF with cost estimates', color:'#C49A3C' },
];

const T = {
  bg:'#080C14', bgCard:'rgba(12,18,30,0.82)', bgCardSolid:'#0C1220',
  bgStep:'#0B1020', nav:'rgba(8,12,20,0.9)',
  border:'rgba(91,163,201,0.11)', borderFaint:'rgba(91,163,201,0.06)',
  text:'#E4EBF5', textSub:'#8FA5BC', textMuted:'#5E7A96', textFaint:'#2E4060',
  accent1:'#5BA3C9', accent2:'#8B7EC8', green:'#4FA882',
  orb1:'rgba(91,163,201,0.07)', orb2:'rgba(139,126,200,0.07)', orb3:'rgba(79,168,130,0.05)',
  grid:'rgba(91,163,201,0.025)', nodeCard:'rgba(10,16,28,0.96)',
};

function StatNum({ target, suffix, started }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    let raf, s = null;
    const step = ts => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 1400, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, target]);
  return <>{val}{suffix}</>;
}

function TerminalLine({ text, color, delay }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);
  if (!show) return null;
  return <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'12px', color, lineHeight:1.7, animation:'termLine 0.3s ease both' }}>{text}</div>;
}

export default function LandingPage({ onEnter, onAuthClick, user, onLogout }) {
  const [sysIndex, setSysIndex]   = useState(0);
  const [visible, setVisible]     = useState({});
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [userMenu, setUserMenu]   = useState(false);
  const sectionRefs = useRef({});

  useEffect(() => {
    const id = setInterval(() => setSysIndex(i => (i + 1) % SYSTEMS.length), 2800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.dataset.rid]: true })); }),
      { threshold: 0.06 }
    );
    Object.values(sectionRefs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenu) return;
    const h = () => setUserMenu(false);
    setTimeout(() => document.addEventListener('click', h), 0);
    return () => document.removeEventListener('click', h);
  }, [userMenu]);

  const setRef = id => el => { sectionRefs.current[id] = el; if (el) el.dataset.rid = id; };
  const scrollTo = id => { sectionRefs.current[id]?.scrollIntoView({ behavior:'smooth', block:'start' }); setMenuOpen(false); };
  const reveal = (id, delay = 0) => ({
    opacity: visible[id] ? 1 : 0,
    transform: visible[id] ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  });

  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'Plus Jakarta Sans',sans-serif", overflowX:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }

        @keyframes fadeUp      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
        @keyframes sysIn       { 0%{opacity:0;transform:translateY(12px)} 15%{opacity:1;transform:translateY(0)} 85%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-10px)} }
        @keyframes softPulse   { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes shimmer     { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes orbPulse    { 0%,100%{opacity:.7} 50%{opacity:1} }
        @keyframes termLine    { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }
        @keyframes termCursor  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes lineGrow    { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes scrollBounce{ 0%,100%{transform:translateX(-50%) translateY(0);opacity:.3} 50%{transform:translateX(-50%) translateY(6px);opacity:.7} }
        @keyframes menuSlide   { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dropIn      { from{opacity:0;transform:translateY(-6px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes perkSlide   { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }

        .shimmer-text {
          background:linear-gradient(120deg,#5BA3C9 0%,#8B7EC8 40%,#4FA882 70%,#5BA3C9 100%);
          background-size:250% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          animation:shimmer 4s linear infinite; will-change:background-position;
        }
        .cta-main { will-change:transform; transition:transform 0.25s ease, box-shadow 0.25s ease !important; }
        .cta-main:hover { transform:translateY(-2px) scale(1.02) !important; box-shadow:0 10px 28px rgba(91,163,201,0.3) !important; }
        .cta-main:active { transform:scale(0.97) !important; }
        .cta-ghost { transition:all 0.2s ease !important; }
        .cta-ghost:hover { transform:translateY(-2px) !important; border-color:rgba(91,163,201,0.4) !important; color:#8FA5BC !important; }
        .feat-card { will-change:transform; transition:transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease !important; }
        .feat-card:hover { transform:translateY(-4px) !important; border-color:rgba(91,163,201,0.2) !important; box-shadow:0 16px 40px rgba(0,0,0,0.25) !important; }
        .feat-card:hover .f-icon { transform:scale(1.1) rotate(-5deg) !important; }
        .f-icon { transition:transform 0.3s ease; }
        .step-cell { will-change:transform; transition:transform 0.25s ease !important; }
        .step-cell:hover { transform:translateY(-3px) !important; }
        .chip { will-change:transform; transition:transform 0.18s ease, border-color 0.18s, color 0.18s, background 0.18s !important; }
        .chip:hover { transform:translateY(-2px) scale(1.04) !important; }
        .nav-btn { background:none; border:none; font-family:'Plus Jakarta Sans',sans-serif; transition:color 0.18s; cursor:pointer; padding:0; }
        .nav-btn:hover { color: #5BA3C9 !important; }
        .sys-name { left:0; }
        @media (max-width:900px) {
          .sys-name { left:50% !important; transform:translateX(-50%) !important; animation:none !important; transition:opacity 0.35s ease !important; }
          .sys-slot  { text-align:center; }
        }
        .stat-card { will-change:transform; transition:transform 0.28s ease !important; }
        .stat-card:hover { transform:translateY(-4px) !important; }
        .user-menu-item:hover { background:rgba(91,163,201,0.08) !important; color:#E4EBF5 !important; }
        .perk-row { transition:transform 0.2s ease; }
        .perk-row:hover { transform:translateX(3px); }
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(91,163,201,0.18);border-radius:3px}

        .hero-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; width:100%; max-width:1100px; }
        .terminal-wrap { display:block; }
        .steps-grid { display:grid; grid-template-columns:repeat(3,1fr); }
        .feat-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
        .stack-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .nav-links { display:flex; align-items:center; gap:28px; }
        .nav-mobile-btn { display:none; }
        .mobile-menu { display:none; }
        .hero-section { padding:130px 52px 80px; }
        .section-pad { padding-left:52px; padding-right:52px; }
        .auth-section { display:grid; grid-template-columns:1fr 1fr; gap:32px; align-items:start; }

        @media (max-width:900px) {
          .hero-grid { grid-template-columns:1fr; gap:40px; text-align:center; }
          .terminal-wrap { display:none; }
          .hero-section { padding:110px 24px 60px; }
          .steps-grid { grid-template-columns:1fr; }
          .feat-grid { grid-template-columns:1fr; }
          .stack-grid { grid-template-columns:1fr; }
          .stats-grid { grid-template-columns:repeat(3,1fr); gap:10px; }
          .section-pad { padding-left:20px; padding-right:20px; }
          .nav-links { display:none; }
          .nav-mobile-btn { display:flex !important; }
          .mobile-menu { display:block; }
          .hero-chips { justify-content:center !important; }
          .hero-ctas { justify-content:center !important; }
          .hero-badge { justify-content:center; }
          .auth-section { grid-template-columns:1fr; }
        }
        @media (max-width:600px) {
          .stats-grid { grid-template-columns:1fr; }
          .feat-grid { grid-template-columns:1fr; }
          .steps-grid { grid-template-columns:1fr; }
          .stack-grid { grid-template-columns:1fr; }
          .hero-section { padding:100px 16px 50px; }
          .section-pad { padding-left:16px; padding-right:16px; }
        }
      `}</style>

      {/* BG */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'10%', left:'14%', width:500, height:500, background:`radial-gradient(circle,${T.orb1} 0%,transparent 65%)`, borderRadius:'50%', animation:'orbPulse 9s ease-in-out infinite', willChange:'opacity' }} />
        <div style={{ position:'absolute', top:'70%', right:'6%', width:380, height:380, background:`radial-gradient(circle,${T.orb2} 0%,transparent 65%)`, borderRadius:'50%', animation:'orbPulse 12s ease-in-out 3s infinite', willChange:'opacity' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:`linear-gradient(${T.grid} 1px,transparent 1px),linear-gradient(90deg,${T.grid} 1px,transparent 1px)`, backgroundSize:'52px 52px' }} />
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at center,transparent 35%,${T.bg} 88%)` }} />
      </div>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'13px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${navScrolled ? T.border : 'transparent'}`, background: navScrolled ? T.nav : 'transparent', backdropFilter: navScrolled ? 'blur(20px)' : 'none', transition:'all 0.35s ease' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:28, height:28, borderRadius:'7px', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', animation:'softPulse 4s ease-in-out infinite' }}>⬡</div>
          <span style={{ fontFamily:"'Fira Code',monospace", fontWeight:600, fontSize:'13px', color:T.text }}>ArchFlow</span>
        </div>

        {/* Desktop nav */}
        <div className="nav-links">
          {[{l:'Features',id:'feat'},{l:'How it works',id:'how'},{l:'Stack',id:'stack'}].map(({l,id}) => (
            <button key={id} className="nav-btn" onClick={() => scrollTo(id)} style={{ fontSize:'13px', color:T.textMuted, fontWeight:500 }}
              onMouseEnter={e => e.currentTarget.style.color=T.accent1}
              onMouseLeave={e => e.currentTarget.style.color=T.textMuted}>{l}</button>
          ))}
          <div style={{ width:1, height:18, background:T.border }} />

          {user ? (
            /* Logged-in user avatar + dropdown */
            <div style={{ position:'relative' }}>
              <div onClick={e => { e.stopPropagation(); setUserMenu(o => !o); }}
                style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 10px 5px 6px', borderRadius:'100px', border:`1px solid ${T.border}`, background:'rgba(91,163,201,0.06)', cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(91,163,201,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:'#fff', flexShrink:0 }}>
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span style={{ fontSize:'13px', color:T.textSub, maxWidth:'100px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</span>
                <span style={{ fontSize:'10px', color:T.textMuted, marginLeft:'2px' }}>▾</span>
              </div>

              {userMenu && (
                <div onClick={e => e.stopPropagation()} style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:'200px', background:'#0C1220', border:`1px solid ${T.border}`, borderRadius:'12px', overflow:'hidden', boxShadow:'0 16px 40px rgba(0,0,0,0.4)', animation:'dropIn 0.2s ease both', zIndex:200 }}>
                  <div style={{ padding:'12px 14px', borderBottom:`1px solid ${T.border}` }}>
                    <div style={{ fontSize:'13px', fontWeight:600, color:T.text, marginBottom:'2px' }}>{user.name}</div>
                    <div style={{ fontSize:'11px', color:T.textMuted, fontFamily:"'Fira Code',monospace", overflow:'hidden', textOverflow:'ellipsis' }}>{user.email}</div>
                  </div>
                  <div style={{ padding:'6px' }}>
                    <button className="user-menu-item" onClick={() => { onEnter(); setUserMenu(false); }}
                      style={{ width:'100%', textAlign:'left', padding:'9px 10px', borderRadius:'7px', background:'none', border:'none', color:T.textSub, fontSize:'13px', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", display:'flex', alignItems:'center', gap:'8px', transition:'all 0.15s' }}>
                      <span style={{ color:T.accent1 }}>⬡</span> Open App
                    </button>
                    <button className="user-menu-item" onClick={() => { onLogout(); setUserMenu(false); }}
                      style={{ width:'100%', textAlign:'left', padding:'9px 10px', borderRadius:'7px', background:'none', border:'none', color:'#C46060', fontSize:'13px', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", display:'flex', alignItems:'center', gap:'8px', transition:'all 0.15s' }}>
                      <span>↩</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Not logged in */
            <div style={{ display:'flex', gap:'8px' }}>
              <button className="nav-btn" onClick={onAuthClick} style={{ fontSize:'13px', color:T.textMuted, fontWeight:500, padding:'7px 14px' }}
                onMouseEnter={e => e.currentTarget.style.color=T.accent1}
                onMouseLeave={e => e.currentTarget.style.color=T.textMuted}>Sign In</button>
              <button className="cta-main" onClick={onAuthClick} style={{ padding:'8px 18px', borderRadius:'8px', border:'none', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, color:'#fff', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", boxShadow:`0 4px 14px ${T.accent1}30` }}>
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <div style={{ display:'none' }} className="nav-mobile-btn">
          <button onClick={() => setMenuOpen(o => !o)} style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:'7px', color:T.textSub, width:36, height:36, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'4px', cursor:'pointer', padding:'8px' }}>
            <div style={{ width:16, height:1.5, background:T.textSub, borderRadius:'1px', transition:'all 0.2s', transform: menuOpen ? 'rotate(45deg) translateY(5px)' : 'none' }} />
            <div style={{ width:16, height:1.5, background:T.textSub, borderRadius:'1px', opacity: menuOpen ? 0 : 1 }} />
            <div style={{ width:16, height:1.5, background:T.textSub, borderRadius:'1px', transition:'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-5px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu" style={{ position:'fixed', top:56, left:0, right:0, zIndex:99, background:T.nav, backdropFilter:'blur(20px)', borderBottom:`1px solid ${T.border}`, padding:'16px 24px', display:'flex', flexDirection:'column', gap:'4px', animation:'menuSlide 0.2s ease both' }}>
          {[{l:'Features',id:'feat'},{l:'How it works',id:'how'},{l:'Stack',id:'stack'}].map(({l,id}) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background:'none', border:'none', color:T.textSub, fontSize:'15px', fontWeight:500, padding:'10px 0', textAlign:'left', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", borderBottom:`1px solid ${T.borderFaint}` }}>{l}</button>
          ))}
          {user ? (
            <>
              <button onClick={onEnter} style={{ marginTop:'8px', padding:'12px', borderRadius:'9px', border:`1px solid ${T.accent1}45`, background:`${T.accent1}12`, color:T.accent1, fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Open App →</button>
              <button onClick={onLogout} style={{ padding:'10px', borderRadius:'9px', border:`1px solid rgba(196,96,96,0.3)`, background:'transparent', color:'#C46060', fontSize:'13px', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Sign Out</button>
            </>
          ) : (
            <button className="cta-main" onClick={onAuthClick} style={{ marginTop:'8px', padding:'12px', borderRadius:'9px', border:'none', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, color:'#fff', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              Sign In / Get Started
            </button>
          )}
        </div>
      )}

      {/* HERO */}
      <section className="hero-section" style={{ display:'flex', justifyContent:'center', position:'relative', zIndex:1, minHeight:'100vh', alignItems:'center' }}>
        <div className="hero-grid">
          {/* Left */}
          <div>
            <div className="hero-badge" style={{ display:'flex', marginBottom:'22px', animation:'fadeUp 0.6s ease 0.1s both' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'5px 14px 5px 9px', border:`1px solid ${T.green}35`, borderRadius:'100px', background:`${T.green}08` }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:T.green, animation:'softPulse 2.2s ease-in-out infinite' }} />
                <span style={{ fontSize:'12px', fontFamily:"'Fira Code',monospace", color:T.green, letterSpacing:'0.03em', fontWeight:500 }}>
                  {user ? `Welcome back, ${user.name.split(' ')[0]}!` : 'No login required to start'}
                </span>
              </div>
            </div>

            <div style={{ animation:'fadeUp 0.65s ease 0.2s both', marginBottom:'18px' }}>
              <h1 style={{ fontSize:'clamp(32px,5vw,68px)', fontWeight:800, lineHeight:1.08, letterSpacing:'-0.034em', color:T.text }}>Architect</h1>
              <div className="sys-slot" style={{ position:'relative', height:'clamp(42px,6.5vw,88px)', overflow:'hidden', margin:'2px 0' }}>
                {SYSTEMS.map((s,i) => (
                  <span
                    key={s}
                    className={`shimmer-text sys-name${i === sysIndex ? ' sys-active' : ''}`}
                    style={{
                      position:'absolute', top:0,
                      fontSize:'clamp(32px,5vw,68px)', fontWeight:800,
                      letterSpacing:'-0.034em',
                      lineHeight:'clamp(42px,6.5vw,88px)',
                      whiteSpace:'nowrap', pointerEvents:'none',
                      opacity: i===sysIndex ? 1 : 0,
                      animation: i===sysIndex ? 'sysIn 2.8s ease forwards' : 'none',
                    }}
                  >{s}</span>
                ))}
              </div>
              <h1 style={{ fontSize:'clamp(32px,5vw,68px)', fontWeight:800, lineHeight:1.08, letterSpacing:'-0.034em', color:T.text }}>in seconds.</h1>
            </div>

            <p style={{ fontSize:'clamp(14px,1.4vw,16px)', color:T.textSub, lineHeight:1.82, animation:'fadeUp 0.65s ease 0.35s both', marginBottom:'32px', maxWidth:'420px' }}>
              Type any system name. Cohere AI generates a full architecture diagram with components, data flows, and design rationale — instantly.
            </p>

            <div className="hero-ctas" style={{ display:'flex', gap:'12px', flexWrap:'wrap', animation:'fadeUp 0.65s ease 0.45s both', marginBottom:'28px' }}>
              <button className="cta-main" onClick={onEnter} style={{ padding:'13px 30px', borderRadius:'11px', border:'none', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, color:'#fff', fontSize:'15px', fontWeight:700, cursor:'pointer', boxShadow:`0 5px 22px ${T.accent1}35`, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                {user ? 'Open App →' : 'Start Designing →'}
              </button>
              {!user && (
                <button className="cta-ghost" onClick={onAuthClick} style={{ padding:'13px 22px', borderRadius:'11px', border:`1px solid ${T.border}`, background:'transparent', color:T.textMuted, fontSize:'15px', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600 }}>
                  Sign In
                </button>
              )}
            </div>

            <div className="hero-chips" style={{ display:'flex', gap:'6px', flexWrap:'wrap', animation:'fadeUp 0.65s ease 0.55s both', maxWidth:'440px' }}>
              <span style={{ fontSize:'11px', fontFamily:"'Fira Code',monospace", color:T.textFaint, alignSelf:'center', marginRight:'2px' }}>try:</span>
              {SYSTEMS.map((s,i) => (
                <span key={s} className="chip" onClick={onEnter} style={{ padding:'4px 10px', borderRadius:'100px', border:`1px solid ${T.border}`, background:T.bgCard, color:T.textMuted, fontSize:'11px', cursor:'pointer', fontFamily:"'Fira Code',monospace", animation:`fadeIn 0.4s ease ${0.6+i*0.05}s both` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=T.accent1+'55'; e.currentTarget.style.color=T.accent1; e.currentTarget.style.background=T.accent1+'12'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.textMuted; e.currentTarget.style.background=T.bgCard; }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Terminal */}
          <div className="terminal-wrap" style={{ animation:'fadeUp 0.7s ease 0.4s both' }}>
            <div style={{ background:'rgba(8,12,20,0.95)', border:`1px solid ${T.border}`, borderRadius:'14px', overflow:'hidden', boxShadow:`0 28px 70px rgba(0,0,0,0.5), 0 0 0 1px rgba(91,163,201,0.07)` }}>
              <div style={{ padding:'11px 14px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:'8px', background:'rgba(12,18,30,0.6)' }}>
                <div style={{ display:'flex', gap:'5px' }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:'#C46060' }} />
                  <div style={{ width:10, height:10, borderRadius:'50%', background:'#C49A3C' }} />
                  <div style={{ width:10, height:10, borderRadius:'50%', background:'#4FA882' }} />
                </div>
                <div style={{ flex:1, textAlign:'center', fontSize:'11px', fontFamily:"'Fira Code',monospace", color:T.textFaint }}>archflow — terminal</div>
              </div>
              <div style={{ padding:'18px 18px 22px', minHeight:'240px' }}>
                {TERMINAL_LINES.map((line,i) => <TerminalLine key={i} {...line} />)}
                <div style={{ display:'inline-flex', alignItems:'center', marginTop:'4px' }}>
                  <span style={{ fontFamily:"'Fira Code',monospace", fontSize:'12px', color:T.textFaint }}>$ </span>
                  <span style={{ display:'inline-block', width:'7px', height:'13px', background:T.accent1, marginLeft:'2px', animation:'termCursor 1.1s step-end infinite', opacity:0.7 }} />
                </div>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:'18px', marginTop:'14px' }}>
              {[{icon:'⬡',label:'React Flow',color:T.accent1},{icon:'◈',label:'Cohere AI',color:T.accent2},{icon:'▣',label:'Node.js',color:T.green}].map(({icon,label,color}) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                  <span style={{ fontSize:'11px', color }}>{icon}</span>
                  <span style={{ fontSize:'11px', color:T.textFaint, fontFamily:"'Fira Code',monospace" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:'absolute', bottom:'24px', left:'50%', cursor:'pointer', animation:'fadeIn 1s ease 1.5s both' }} onClick={() => scrollTo('stats')}>
          <div style={{ width:20, height:32, border:`1.5px solid ${T.borderFaint}`, borderRadius:'12px', display:'flex', justifyContent:'center', padding:'5px 0', margin:'0 auto 4px' }}>
            <div style={{ width:2, height:6, background:T.accent1, borderRadius:'1px', animation:'scrollBounce 2s ease-in-out infinite' }} />
          </div>
          <div style={{ fontSize:'9px', fontFamily:"'Fira Code',monospace", color:T.textFaint, letterSpacing:'0.12em', textTransform:'uppercase', textAlign:'center' }}>scroll</div>
        </div>
      </section>

      {/* STATS */}
      <section ref={setRef('stats')} className="section-pad" style={{ paddingTop:0, paddingBottom:'72px', maxWidth:'860px', margin:'0 auto', position:'relative', zIndex:1 }}>
        <div className="stats-grid">
          {STATS.map((s,i) => (
            <div key={i} className="stat-card" style={{ textAlign:'center', padding:'24px 16px', background:T.bgCardSolid, border:`1px solid ${T.border}`, borderRadius:'14px', ...reveal('stats', i*0.1) }}>
              <div style={{ fontSize:'clamp(26px,4vw,42px)', fontWeight:800, letterSpacing:'-0.04em', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1, marginBottom:'5px' }}>
                <StatNum target={s.value} suffix={s.suffix} started={!!visible['stats']} />
              </div>
              <div style={{ fontSize:'12px', color:T.textMuted, fontFamily:"'Fira Code',monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* AUTH SECTION — shown only when NOT logged in */}
      {!user && (
        <section ref={setRef('auth')} className="section-pad" style={{ paddingTop:'20px', paddingBottom:'72px', maxWidth:'1060px', margin:'0 auto', position:'relative', zIndex:1 }}>
          <div className="auth-section" style={{ ...reveal('auth') }}>

            {/* Left: save & share pitch */}
            <div style={{ padding:'clamp(24px,3vw,40px)', background:T.bgCardSolid, border:`1px solid ${T.border}`, borderRadius:'18px', position:'relative', overflow:'hidden' }}>
              {/* Glow corner */}
              <div style={{ position:'absolute', top:-40, right:-40, width:140, height:140, background:`radial-gradient(circle,${T.orb2},transparent)`, borderRadius:'50%', pointerEvents:'none' }} />

              <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.green, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:'12px', display:'flex', alignItems:'center', gap:'7px' }}>
                <div style={{ width:14, height:1, background:T.green, opacity:0.5 }} /> with a free account
              </div>
              <h3 style={{ fontSize:'clamp(18px,2.5vw,26px)', fontWeight:800, letterSpacing:'-0.025em', color:T.text, marginBottom:'8px', lineHeight:1.15 }}>
                Save, share &amp; revisit<br/>your designs
              </h3>
              <p style={{ fontSize:'13px', color:T.textSub, lineHeight:1.72, marginBottom:'24px' }}>
                Create a free account to unlock the full ArchFlow experience — designs persist, shareable links, version history and cost estimates all in one place.
              </p>

              {/* Perks list */}
              <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'24px' }}>
                {ACCOUNT_PERKS.map((p,i) => (
                  <div key={i} className="perk-row" style={{ display:'flex', alignItems:'center', gap:'12px', animation: visible['auth'] ? `perkSlide 0.4s ease ${0.1+i*0.07}s both` : 'none', opacity: visible['auth'] ? 1 : 0 }}>
                    <div style={{ width:32, height:32, borderRadius:'8px', background:`${p.color}14`, border:`1px solid ${p.color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', color:p.color, flexShrink:0 }}>{p.icon}</div>
                    <span style={{ fontSize:'13px', color:T.textSub, fontWeight:500 }}>{p.label}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                <button className="cta-main" onClick={onAuthClick} style={{ padding:'11px 24px', borderRadius:'10px', border:'none', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, color:'#fff', fontSize:'14px', fontWeight:700, cursor:'pointer', boxShadow:`0 4px 18px ${T.accent1}30`, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                  Create Free Account →
                </button>
                <button className="cta-ghost" onClick={onAuthClick} style={{ padding:'11px 20px', borderRadius:'10px', border:`1px solid ${T.border}`, background:'transparent', color:T.textMuted, fontSize:'14px', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600 }}>
                  Sign In
                </button>
              </div>
            </div>

            {/* Right: already using without login */}
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {/* Guest mode card */}
              <div style={{ padding:'24px', background:T.bgCardSolid, border:`1px solid ${T.border}`, borderRadius:'14px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                  <div style={{ width:36, height:36, borderRadius:'9px', background:`${T.accent1}12`, border:`1px solid ${T.accent1}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', color:T.accent1 }}>⬡</div>
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:700, color:T.text }}>No account? No problem.</div>
                    <div style={{ fontSize:'12px', color:T.textMuted }}>Design instantly, no login needed</div>
                  </div>
                </div>
                <p style={{ fontSize:'13px', color:T.textSub, lineHeight:1.68, marginBottom:'14px' }}>
                  Jump straight in — generate architecture diagrams, explore nodes, and download PDFs without creating an account.
                </p>
                <button className="cta-main" onClick={onEnter} style={{ padding:'10px 22px', borderRadius:'9px', border:`1px solid ${T.accent1}40`, background:`${T.accent1}10`, color:T.accent1, fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                  Try Without Account →
                </button>
              </div>

              {/* What you miss card */}
              <div style={{ padding:'20px 22px', background:'rgba(139,126,200,0.06)', border:`1px solid rgba(139,126,200,0.15)`, borderRadius:'14px' }}>
                <div style={{ fontSize:'11px', fontFamily:"'Fira Code',monospace", color:T.accent2, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'10px' }}>Without an account</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                  {['Designs vanish on refresh','No share links','No version history','No saved PDF exports'].map((item,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ color:'rgba(196,96,96,0.7)', fontSize:'12px' }}>✕</span>
                      <span style={{ fontSize:'13px', color:T.textMuted }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section ref={setRef('how')} className="section-pad" style={{ paddingTop:'40px', paddingBottom:'72px', maxWidth:'1060px', margin:'0 auto', position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:'48px', ...reveal('how') }}>
          <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'11px', color:T.green, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            <div style={{ width:18, height:1, background:T.green, opacity:0.5 }} /> how it works <div style={{ width:18, height:1, background:T.green, opacity:0.5 }} />
          </div>
          <h2 style={{ fontSize:'clamp(22px,3.5vw,42px)', fontWeight:800, letterSpacing:'-0.026em', color:T.text }}>Three steps to a full architecture</h2>
        </div>
        <div className="steps-grid" style={{ gap:'1px', background:T.border, borderRadius:'18px', overflow:'hidden', border:`1px solid ${T.border}` }}>
          {[
            { n:'01', title:'Describe',   detail:'Type any system — "Design Twitter". No sign-up, no setup.', icon:'✦', color:T.accent1 },
            { n:'02', title:'AI Designs', detail:'Cohere AI maps components, connections, and rationale.', icon:'⬡', color:T.accent2 },
            { n:'03', title:'Explore',    detail:'Zoom, pan, click nodes. Understand every decision.', icon:'◎', color:T.green  },
          ].map((item,i) => (
            <div key={i} className="step-cell" style={{ padding:'36px 28px', background:T.bgStep, position:'relative', overflow:'hidden', ...reveal('how', i*0.12) }}>
              <div style={{ position:'absolute', bottom:-10, right:0, fontSize:'70px', fontWeight:800, color:'rgba(91,163,201,0.04)', lineHeight:1, userSelect:'none', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{item.n}</div>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${item.color}70,transparent)`, transformOrigin:'left', animation: visible['how'] ? `lineGrow 0.7s ease ${0.35+i*0.14}s both` : 'none' }} />
              <div style={{ width:38, height:38, borderRadius:'10px', background:`${item.color}12`, border:`1px solid ${item.color}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', color:item.color, marginBottom:'18px' }}>{item.icon}</div>
              <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'10px', color:item.color, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'7px', opacity:0.8 }}>Step {item.n}</div>
              <h3 style={{ fontSize:'18px', fontWeight:700, color:T.text, marginBottom:'9px', letterSpacing:'-0.015em' }}>{item.title}</h3>
              <p style={{ fontSize:'13px', color:T.textMuted, lineHeight:1.75 }}>{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section ref={setRef('feat')} className="section-pad" style={{ paddingTop:'20px', paddingBottom:'72px', maxWidth:'1060px', margin:'0 auto', position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:'48px', ...reveal('feat') }}>
          <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'11px', color:T.green, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            <div style={{ width:18, height:1, background:T.green, opacity:0.5 }} /> capabilities <div style={{ width:18, height:1, background:T.green, opacity:0.5 }} />
          </div>
          <h2 style={{ fontSize:'clamp(22px,3.5vw,42px)', fontWeight:800, letterSpacing:'-0.026em', color:T.text }}>Everything a system designer needs</h2>
        </div>
        <div className="feat-grid">
          {FEATURES.map((f,i) => (
            <div key={i} className="feat-card" style={{ padding:'28px', background:T.bgCardSolid, border:`1px solid ${T.border}`, borderRadius:'16px', ...reveal('feat', i*0.09) }}>
              <div className="f-icon" style={{ width:44, height:44, borderRadius:'11px', background:`${f.color}10`, border:`1px solid ${f.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'19px', color:f.color, marginBottom:'16px' }}>{f.icon}</div>
              <h3 style={{ fontSize:'16px', fontWeight:700, color:T.text, marginBottom:'8px', letterSpacing:'-0.015em' }}>{f.title}</h3>
              <p style={{ fontSize:'13px', color:T.textMuted, lineHeight:1.75 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section ref={setRef('stack')} className="section-pad" style={{ paddingTop:'20px', paddingBottom:'72px', maxWidth:'1060px', margin:'0 auto', position:'relative', zIndex:1 }}>
        <div style={{ border:`1px solid ${T.border}`, borderRadius:'18px', padding:'clamp(24px,4vw,48px)', background:T.bgCardSolid, position:'relative', overflow:'hidden', ...reveal('stack') }}>
          <div style={{ position:'absolute', top:-60, right:-60, width:180, height:180, background:`radial-gradient(circle,${T.orb2},transparent)`, borderRadius:'50%', pointerEvents:'none' }} />
          <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'11px', color:T.green, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:'10px', display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:16, height:1, background:T.green, opacity:0.5 }} /> built with
          </div>
          <h2 style={{ fontSize:'clamp(18px,2.8vw,34px)', fontWeight:800, letterSpacing:'-0.024em', color:T.text, marginBottom:'28px' }}>Production-grade tech stack</h2>
          <div className="stack-grid">
            {[
              { layer:'Frontend',  techs:['React + Vite','React Flow','Axios'],         color:T.accent1 },
              { layer:'Backend',   techs:['Node.js','Express','MongoDB'],               color:T.accent2 },
              { layer:'AI Engine', techs:['Cohere AI','command-a-03-2025','Structured JSON'],   color:'#C49A3C' },
            ].map((s,i) => (
              <div key={i} style={{ padding:'18px', background:'rgba(8,12,20,0.55)', borderRadius:'12px', border:`1px solid ${s.color}18`, ...reveal('stack', i*0.1) }}>
                <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'10px', color:s.color, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'12px', display:'flex', alignItems:'center', gap:'5px' }}>
                  <div style={{ width:3, height:3, borderRadius:'50%', background:s.color }} />{s.layer}
                </div>
                {s.techs.map(t => (
                  <div key={t} style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'6px' }}>
                    <div style={{ width:4, height:4, borderRadius:'50%', background:s.color, opacity:0.45 }} />
                    <span style={{ fontSize:'13px', color:T.textSub, fontFamily:"'Fira Code',monospace" }}>{t}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section ref={setRef('cta')} className="section-pad" style={{ paddingTop:'30px', paddingBottom:'100px', textAlign:'center', position:'relative', zIndex:1, ...reveal('cta') }}>
        <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)', width:'min(520px,90vw)', height:'260px', background:`radial-gradient(ellipse,${T.orb2},transparent)`, pointerEvents:'none', borderRadius:'50%' }} />
        <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'11px', color:T.green, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
          <div style={{ width:18, height:1, background:T.green, opacity:0.5 }} /> ready? <div style={{ width:18, height:1, background:T.green, opacity:0.5 }} />
        </div>
        <h2 style={{ fontSize:'clamp(26px,5vw,58px)', fontWeight:800, letterSpacing:'-0.034em', color:T.text, marginBottom:'12px', lineHeight:1.1 }}>
          Design anything.{' '}<span className="shimmer-text">Right now.</span>
        </h2>
        <p style={{ color:T.textMuted, fontSize:'14px', marginBottom:'32px', fontFamily:"'Fira Code',monospace" }}>
          {user ? 'Your designs are saved and ready.' : 'No account needed to start. Sign up to save.'}
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <button className="cta-main" onClick={onEnter} style={{ padding:'14px 40px', borderRadius:'12px', border:'none', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, color:'#fff', fontSize:'15px', fontWeight:700, cursor:'pointer', boxShadow:`0 7px 28px ${T.accent1}38`, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            {user ? 'Open App →' : 'Launch ArchFlow →'}
          </button>
          {!user && (
            <button className="cta-ghost" onClick={onAuthClick} style={{ padding:'14px 28px', borderRadius:'12px', border:`1px solid ${T.border}`, background:'transparent', color:T.textMuted, fontSize:'15px', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600 }}>
              Create Free Account
            </button>
          )}
        </div>
      </section>

      <footer style={{ borderTop:`1px solid ${T.borderFaint}`, padding:'18px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'8px', position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
          <div style={{ width:18, height:18, borderRadius:'5px', background:`linear-gradient(135deg,${T.accent1}55,${T.accent2}55)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px' }}>⬡</div>
          <span style={{ fontSize:'12px', fontFamily:"'Fira Code',monospace", color:T.textFaint }}>ArchFlow</span>
        </div>
        <span style={{ fontSize:'11px', color:T.textFaint, fontFamily:"'Fira Code',monospace" }}>AI-Powered System Design Visualizer</span>
        <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:T.green, animation:'softPulse 3s ease-in-out infinite' }} />
          <span style={{ fontSize:'11px', color:T.textFaint, fontFamily:"'Fira Code',monospace" }}>Live</span>
        </div>
      </footer>
    </div>
  );
}
