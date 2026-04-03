import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValueEvent } from 'framer-motion';

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
  { text:'  ✓ gateway: Load Balancer',            color:'#4FA882', delay:2.1  },
  { text:'  ✓ database: PostgreSQL, Cassandra',   color:'#4FA882', delay:2.5  },
  { text:'  ✓ cache: Redis, CDN Edge',            color:'#4FA882', delay:2.9  },
  { text:'  ✓ queue: Kafka Message Bus',          color:'#4FA882', delay:3.3  },
  { text:'  → Building diagram...',               color:'#8FA5BC', delay:3.8  },
  { text:'  ✓ Architecture ready  ⬡',             color:'#C49A3C', delay:4.3  },
];
const ACCOUNT_PERKS = [
  { icon:'▣', label:'Save unlimited designs',  color:'#5BA3C9' },
  { icon:'⬡', label:'Share via public URL',    color:'#8B7EC8' },
  { icon:'↺', label:'Version history',         color:'#4FA882' },
  { icon:'↓', label:'PDF with cost estimates', color:'#C49A3C' },
];

const T = {
  bg:'#080C14', bgCard:'rgba(12,18,30,0.4)', bgCardSolid:'#0C1220',
  bgStep:'rgba(11,16,32,0.6)', nav:'rgba(8,12,20,0.75)',
  border:'rgba(91,163,201,0.15)', borderFaint:'rgba(91,163,201,0.08)',
  text:'#E4EBF5', textSub:'#A0B4C8', textMuted:'#738A9F', textFaint:'#3A4C63',
  accent1:'#5BA3C9', accent2:'#8B7EC8', green:'#4FA882',
  orb1:'rgba(91,163,201,0.12)', orb2:'rgba(139,126,200,0.12)', orb3:'rgba(79,168,130,0.1)',
  grid:'rgba(91,163,201,0.03)', nodeCard:'rgba(10,16,28,0.96)',
};

// --- Framer Motion Components ---

function StatNum({ target, suffix }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let raf, s = null;
    const step = ts => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 2000, 1);
      const easeOut = 1 - Math.pow(1 - p, 4);
      setVal(Math.floor(easeOut * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isInView, target]);

  return <span ref={ref}>{val}{suffix}</span>;
}

function TerminalLine({ text, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay + 0.5, duration: 0.4 }}
      style={{ fontFamily:"'Fira Code',monospace", fontSize:'13px', lineHeight:1.8, color }}
    >
      {text}
    </motion.div>
  );
}

const FadeIn = ({ children, delay = 0, y = 30, className = '', style = {} }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ type: "spring", stiffness: 100, damping: 20, delay }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
);

export default function LandingPage({ onEnter, onAuthClick, user, onLogout }) {
  const [sysIndex, setSysIndex] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  
  const { scrollY } = useScroll();
  const orbY1 = useTransform(scrollY, [0, 1000], [0, -150]);
  const orbY2 = useTransform(scrollY, [0, 1000], [0, 150]);

  // Rotate text
  useEffect(() => {
    const id = setInterval(() => setSysIndex(i => (i + 1) % SYSTEMS.length), 3000);
    return () => clearInterval(id);
  }, []);

  // Handle Scroll for Navbar (FIXED DEPRECATION)
  useMotionValueEvent(scrollY, "change", (latest) => {
    setNavScrolled(latest > 40);
  });

  // Close menus on outside click / route change
  useEffect(() => {
    if (!userMenu) return;
    const h = () => setUserMenu(false);
    setTimeout(() => document.addEventListener('click', h), 0);
    return () => document.removeEventListener('click', h);
  }, [userMenu]);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; }
  }, [menuOpen]);

  const scrollTo = id => { 
    document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' }); 
    setMenuOpen(false); 
  };

  return (
    <div className="layout-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; background: ${T.bg}; }
        .layout-wrapper { min-height: 100vh; background: ${T.bg}; color: ${T.text}; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; position: relative; }

        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pulseGlow { 0%,100%{box-shadow: 0 0 0 0 rgba(79,168,130,0.4)} 50%{box-shadow: 0 0 0 8px rgba(79,168,130,0)} }
        @keyframes scrollBounce { 0%,100%{transform:translateX(-50%) translateY(0);opacity:.3} 50%{transform:translateX(-50%) translateY(8px);opacity:.8} }
        @keyframes termCursor { 0%,100%{opacity:1} 50%{opacity:0} }

        .shimmer-text {
          background: linear-gradient(120deg, #5BA3C9 0%, #8B7EC8 30%, #4FA882 60%, #5BA3C9 100%);
          background-size: 250% auto;
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent;
          animation: shimmer 5s linear infinite; 
          will-change: background-position;
        }

        .section-label { font-family: 'Fira Code', monospace; font-size: 11px; color: ${T.green}; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; }
        .section-label-line { width: 24px; height: 1px; background: ${T.green}; opacity: 0.4; }

        .glass-panel { background: ${T.bgCard}; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid ${T.border}; border-radius: 20px; transition: all 0.3s; }
        .glass-panel:hover { border-color: rgba(91,163,201,0.3); box-shadow: 0 12px 40px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.02); }

        .cta-main { padding: 14px 28px; border-radius: 12px; border: none; background: linear-gradient(135deg, ${T.accent1}, ${T.accent2}); color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; box-shadow: 0 8px 24px rgba(91,163,201,0.25), inset 0 1px 0 rgba(255,255,255,0.2); position: relative; overflow: hidden; }
        
        .cta-ghost { padding: 14px 28px; border-radius: 12px; border: 1px solid ${T.border}; background: rgba(255,255,255,0.02); color: ${T.textSub}; font-size: 15px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; backdrop-filter: blur(8px); }
        
        .chip { padding: 6px 14px; border-radius: 100px; border: 1px solid ${T.border}; background: rgba(12,18,30,0.6); color: ${T.textMuted}; font-size: 12px; cursor: pointer; font-family: 'Fira Code', monospace; backdrop-filter: blur(4px); }
        
        .nav-btn { background: none; border: none; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: ${T.textMuted}; font-weight: 500; cursor: pointer; padding: 8px 12px; border-radius: 8px; transition: 0.2s; }
        .nav-btn:hover { color: ${T.text}; background: rgba(255,255,255,0.05); }

        .user-menu-item { width: 100%; text-align: left; padding: 10px 12px; border-radius: 8px; background: none; border: none; color: ${T.textSub}; font-size: 13px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
        .user-menu-item:hover { background: rgba(91,163,201,0.1); color: #fff; }

        .terminal-window { background: rgba(8,12,20,0.85); backdrop-filter: blur(24px); border: 1px solid ${T.border}; border-radius: 16px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05); }

        .hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 64px; align-items: center; width: 100%; max-width: 1200px; margin: 0 auto; }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: ${T.border}; border-radius: 24px; border: 1px solid ${T.border}; overflow: hidden; }
        .feat-grid, .auth-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .stack-grid, .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        
        .hero-section { padding: 180px 5vw 100px; min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; }
        .section-pad { padding: 40px 5vw 80px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }

        .nav-mobile-btn { display: none; }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: rgba(91,163,201,0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(91,163,201,0.4); }

        /* --- MOBILE SPECIFIC CSS --- */
        @media (max-width: 960px) {
          .nav-links { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
          .hero-grid { grid-template-columns: 1fr; gap: 48px; text-align: center; }
          .hero-grid > div:first-child { display: flex; flex-direction: column; align-items: center; }
          .terminal-wrap { display: none !important; } /* Hidden on mobile */
          .sys-slot { text-align: center; display: flex; justify-content: center; }
          .hero-chips { justify-content: center; }
          .steps-grid, .feat-grid, .stack-grid, .stats-grid, .auth-grid { grid-template-columns: 1fr; }
          .hero-section { padding: 140px 24px 60px; min-height: auto; }
          .section-pad { padding: 30px 24px 60px; }
        }
      `}</style>

      {/* --- Ambient Background --- */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <motion.div style={{ position:'absolute', top:'0%', left:'10%', width:'60vw', height:'60vw', background:`radial-gradient(circle, ${T.orb1} 0%, transparent 60%)`, filter:'blur(60px)', y: orbY1 }} />
        <motion.div style={{ position:'absolute', bottom:'0%', right:'-10%', width:'70vw', height:'70vw', background:`radial-gradient(circle, ${T.orb2} 0%, transparent 60%)`, filter:'blur(80px)', y: orbY2 }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:`linear-gradient(${T.grid} 1px,transparent 1px),linear-gradient(90deg,${T.grid} 1px,transparent 1px)`, backgroundSize:'64px 64px', maskImage:'radial-gradient(ellipse at center, black 20%, transparent 80%)', WebkitMaskImage:'radial-gradient(ellipse at center, black 20%, transparent 80%)' }} />
      </div>

      {/* --- Floating Animated Navbar (FIXED LAG) --- */}
      {/* --- Floating Animated Navbar (CHROME SCROLL LAG FIX) --- */}
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display: 'flex', justifyContent: 'center', pointerEvents: 'none', padding: '16px 5vw' }}>
      <motion.nav 
          initial={false}
          animate={{
            backgroundColor: navScrolled ? 'rgba(12,18,30,0.85)' : 'rgba(8,12,20,0)',
            backdropFilter: navScrolled ? 'blur(24px)' : 'blur(0px)',
            borderColor: navScrolled ? T.border : 'rgba(255,255,255,0)',
            padding: navScrolled ? '12px 24px' : '16px 0px',
            borderRadius: navScrolled ? '24px' : '0px',
            boxShadow: navScrolled ? '0 20px 40px rgba(0,0,0,0.4)' : '0 0px 0px rgba(0,0,0,0)',
            maxWidth: navScrolled ? '1000px' : '1200px',
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} 
          style={{ 
            display:'flex', 
            alignItems:'center', 
            justifyContent:'space-between', 
            pointerEvents: 'auto',
            width: '100%',
            borderWidth: '1px',
            borderStyle: 'solid',
            // --- The magic sauce for Chrome ---
            transform: 'translateZ(0)', // Forces GPU hardware acceleration
            willChange: 'max-width, padding, background-color, backdrop-filter',
          }}
        >
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }} onClick={() => window.scrollTo(0,0)}>
            <div style={{ width:32, height:32, borderRadius:'10px', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', boxShadow:`0 4px 12px rgba(91,163,201,0.3)` }}>⬡</div>
            <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:'18px', color:T.text, letterSpacing:'-0.03em' }}>ArchFlow</span>
          </div>

          {/* Desktop Nav */}
          <div className="nav-links" style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            {[{l:'Features',id:'feat'},{l:'How it works',id:'how'},{l:'Stack',id:'stack'}].map(({l,id}) => (
              <button key={id} className="nav-btn" onClick={() => scrollTo(id)}>{l}</button>
            ))}
            <div style={{ width:1, height:24, background:T.border, margin:'0 12px' }} />

            {user ? (
              <div style={{ position:'relative' }}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={e => { e.stopPropagation(); setUserMenu(o => !o); }}
                  style={{ display:'flex', alignItems:'center', gap:'10px', padding:'6px 14px 6px 6px', borderRadius:'100px', border:`1px solid ${T.border}`, background:'rgba(255,255,255,0.03)', cursor:'pointer' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, color:'#fff' }}>
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span style={{ fontSize:'14px', color:T.text, fontWeight:500 }}>{user.name.split(' ')[0]}</span>
                </motion.div>

                <AnimatePresence>
                  {userMenu && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }}
                      style={{ position:'absolute', top:'calc(100% + 12px)', right:0, width:'220px', background:'rgba(12,18,32,0.95)', backdropFilter:'blur(20px)', border:`1px solid ${T.border}`, borderRadius:'16px', overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,0.5)', zIndex:200 }}>
                      <div style={{ padding:'16px', borderBottom:`1px solid ${T.borderFaint}`, background:'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize:'14px', fontWeight:700, color:T.text }}>{user.name}</div>
                        <div style={{ fontSize:'12px', color:T.textMuted, fontFamily:"'Fira Code',monospace" }}>{user.email}</div>
                      </div>
                      <div style={{ padding:'8px' }}>
                        <button className="user-menu-item" onClick={() => { onEnter(); setUserMenu(false); }}><span style={{ color:T.accent1 }}>⬡</span> Open Workspace</button>
                        <button className="user-menu-item" onClick={() => { onLogout(); setUserMenu(false); }} style={{ color:'#E07A7A' }}><span>↩</span> Sign Out</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                <button className="nav-btn" onClick={onAuthClick} style={{ fontWeight:600 }}>Log In</button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cta-main" onClick={onAuthClick} style={{ padding:'10px 20px', fontSize:'14px' }}>Get Started</motion.button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Icon */}
          <div className="nav-mobile-btn" style={{ zIndex:101 }}>
            <button onClick={() => setMenuOpen(o => !o)} style={{ background:'transparent', border:'none', width:44, height:44, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px', cursor:'pointer' }}>
              <motion.div animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }} style={{ width: 24, height: 2, background: T.text, borderRadius: 2, originX: 0.5 }} />
              <motion.div animate={{ opacity: menuOpen ? 0 : 1 }} style={{ width: 24, height: 2, background: T.text, borderRadius: 2 }} />
              <motion.div animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }} style={{ width: 24, height: 2, background: T.text, borderRadius: 2, originX: 0.5 }} />
            </button>
          </div>
        </motion.nav>
      </div>

      {/* --- Fullscreen Mobile Menu --- */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, backdropFilter: 'blur(0px)' }} 
            animate={{ opacity: 1, y: 0, backdropFilter: 'blur(24px)' }} 
            exit={{ opacity: 0, y: -20, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            style={{ position:'fixed', inset:0, zIndex:99, background:'rgba(8,12,20,0.95)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:'24px' }}
          >
            {[{l:'Features',id:'feat'},{l:'How it works',id:'how'},{l:'Stack',id:'stack'}].map(({l,id}, i) => (
              <motion.button key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i*0.1) }} onClick={() => scrollTo(id)} style={{ background:'none', border:'none', color:T.text, fontSize:'24px', fontWeight:700, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{l}</motion.button>
            ))}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} style={{ width:'40px', height:'2px', background:T.border, margin:'16px 0' }} />
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ display:'flex', flexDirection:'column', gap:'16px', width:'80%', maxWidth:'300px' }}>
              {user ? (
                <>
                  <button className="cta-main" onClick={() => { onEnter(); setMenuOpen(false); }}>Open Workspace</button>
                  <button className="cta-ghost" onClick={() => { onLogout(); setMenuOpen(false); }} style={{ color:'#E07A7A', borderColor:'rgba(224,122,122,0.3)' }}>Sign Out</button>
                </>
              ) : (
                <>
                  <button className="cta-main" onClick={() => { onAuthClick(); setMenuOpen(false); }}>Get Started Free</button>
                  <button className="cta-ghost" onClick={() => { onAuthClick(); setMenuOpen(false); }}>Log In</button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Hero Section --- */}
      <section className="hero-section">
        <div className="hero-grid">
          {/* Left Content */}
          <div style={{ zIndex:2 }}>
            <FadeIn delay={0.1}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', padding:'6px 16px 6px 8px', border:`1px solid rgba(79,168,130,0.3)`, borderRadius:'100px', background:`rgba(79,168,130,0.08)`, marginBottom:'32px' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:T.green, animation:'pulseGlow 2s infinite', margin:'0 4px' }} />
                <span style={{ fontSize:'13px', fontFamily:"'Fira Code',monospace", color:T.green, fontWeight:600 }}>
                  {user ? `Welcome back, ${user.name.split(' ')[0]}!` : 'ArchFlow v2.0 is live'}
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.2} style={{ marginBottom:'24px' }}>
              <h1 style={{ fontSize:'clamp(42px, 6vw, 84px)', fontWeight:800, lineHeight:1.05, letterSpacing:'-0.04em', color:T.text }}>Architect</h1>
              <div className="sys-slot" style={{ position:'relative', height:'clamp(48px, 7vw, 96px)', overflow:'hidden', margin:'4px 0' }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={sysIndex}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="shimmer-text"
                    style={{ position:'absolute', fontSize:'clamp(42px, 6vw, 84px)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:'clamp(48px, 7vw, 96px)', whiteSpace:'nowrap' }}
                  >
                    {SYSTEMS[sysIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
              <h1 style={{ fontSize:'clamp(42px, 6vw, 84px)', fontWeight:800, lineHeight:1.05, letterSpacing:'-0.04em', color:T.text }}>in seconds.</h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p style={{ fontSize:'clamp(16px, 1.5vw, 18px)', color:T.textSub, lineHeight:1.7, marginBottom:'40px', maxWidth:'480px' }}>
                Describe any system in plain English. Our AI maps it into a fully interactive, production-ready architecture diagram instantly.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', marginBottom:'36px' }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cta-main" onClick={onEnter} style={{ padding:'16px 36px', fontSize:'16px' }}>
                  {user ? 'Open Workspace →' : 'Start Designing Free →'}
                </motion.button>
              </div>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="hero-chips" style={{ display:'flex', gap:'8px', flexWrap:'wrap', maxWidth:'500px' }}>
                <span style={{ fontSize:'12px', fontFamily:"'Fira Code',monospace", color:T.textFaint, alignSelf:'center', marginRight:'4px' }}>Try prompts:</span>
                {['Netflix','WhatsApp','Uber'].map((s,i) => (
                  <motion.span key={s} whileHover={{ scale: 1.1, backgroundColor: 'rgba(91,163,201,0.1)', borderColor: T.accent1, color: T.accent1 }} className="chip" onClick={onEnter}>{s}</motion.span>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right Content: Terminal */}
          <FadeIn delay={0.6} className="terminal-wrap" style={{ perspective:'1000px' }}>
            <motion.div 
              whileHover={{ rotateX: 0, rotateY: 0, y: -5 }} 
              style={{ rotateX: 2, rotateY: -4 }}
              className="terminal-window"
            >
              <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', background:'rgba(255,255,255,0.02)' }}>
                <div style={{ display:'flex', gap:'8px' }}>
                  <div style={{ width:12, height:12, borderRadius:'50%', background:'#FF5F56' }} />
                  <div style={{ width:12, height:12, borderRadius:'50%', background:'#FFBD2E' }} />
                  <div style={{ width:12, height:12, borderRadius:'50%', background:'#27C93F' }} />
                </div>
                <div style={{ flex:1, textAlign:'center', fontSize:'12px', fontFamily:"'Fira Code',monospace", color:T.textMuted, fontWeight:500 }}>archflow-engine ~ node</div>
              </div>
              <div style={{ padding:'24px', minHeight:'280px' }}>
                {TERMINAL_LINES.map((line,i) => <TerminalLine key={i} {...line} />)}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5 }} style={{ display:'flex', alignItems:'center', marginTop:'8px' }}>
                  <span style={{ fontFamily:"'Fira Code',monospace", fontSize:'13px', color:T.accent1 }}>➜</span>
                  <span style={{ fontFamily:"'Fira Code',monospace", fontSize:'13px', color:T.textSub, margin:'0 8px' }}>~</span>
                  <span style={{ display:'inline-block', width:'8px', height:'16px', background:T.text, animation:'termCursor 1s step-end infinite' }} />
                </motion.div>
              </div>
            </motion.div>
            <div style={{ display:'flex', justifyContent:'center', gap:'24px', marginTop:'24px' }}>
              {[{icon:'⬡',label:'React Flow',c:T.accent1},{icon:'◈',label:'Cohere AI',c:T.accent2},{icon:'▣',label:'Node.js',c:T.green}].map(({icon,label,c}) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.03)', padding:'6px 12px', borderRadius:'100px', border:`1px solid rgba(255,255,255,0.05)` }}>
                  <span style={{ fontSize:'13px', color:c }}>{icon}</span>
                  <span style={{ fontSize:'12px', color:T.textMuted, fontFamily:"'Fira Code',monospace" }}>{label}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Scroll Indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} style={{ position:'absolute', bottom:'32px', left:'50%', transform:'translateX(-50%)', cursor:'pointer' }} onClick={() => scrollTo('stats')}>
          <div style={{ width:24, height:40, border:`2px solid ${T.border}`, borderRadius:'14px', display:'flex', justifyContent:'center', padding:'6px 0', margin:'0 auto 8px', background:'rgba(12,18,30,0.4)' }}>
            <div style={{ width:4, height:8, background:T.accent1, borderRadius:'2px', animation:'scrollBounce 2s ease-in-out infinite' }} />
          </div>
          <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.textMuted, letterSpacing:'0.2em', textTransform:'uppercase', textAlign:'center' }}>Scroll</div>
        </motion.div>
      </section>

      {/* --- Stats Section --- */}
      <section id="stats" className="section-pad" style={{ paddingTop:0 }}>
        <div className="stats-grid">
          {STATS.map((s,i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <motion.div whileHover={{ y: -5, borderColor: 'rgba(91,163,201,0.3)' }} className="glass-panel" style={{ textAlign:'center', padding:'32px 24px' }}>
                <div style={{ fontSize:'clamp(36px, 4vw, 54px)', fontWeight:800, letterSpacing:'-0.04em', background:`linear-gradient(135deg, ${T.accent1}, ${T.accent2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1, marginBottom:'12px' }}>
                  <StatNum target={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize:'14px', color:T.textMuted, fontFamily:"'Fira Code',monospace", fontWeight:500 }}>{s.label}</div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* --- Auth Pitch (Only for guests) --- */}
      {!user && (
        <section className="section-pad">
          <div className="auth-grid">
            <FadeIn delay={0.1} className="glass-panel" style={{ padding:'clamp(32px, 4vw, 48px)', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'center' }}>
              <div style={{ position:'absolute', top:'-20%', right:'-20%', width:'300px', height:'300px', background:`radial-gradient(circle, ${T.orb2}, transparent 70%)`, opacity:0.3, pointerEvents:'none' }} />
              <div className="section-label"><div className="section-label-line"/>Free Account Perks</div>
              <h3 style={{ fontSize:'clamp(24px, 3vw, 36px)', fontWeight:800, letterSpacing:'-0.03em', color:T.text, marginBottom:'16px', lineHeight:1.1 }}>Save, share &<br/>revisit your designs</h3>
              <p style={{ fontSize:'15px', color:T.textSub, lineHeight:1.7, marginBottom:'32px', maxWidth:'90%' }}>Unlock the full ArchFlow experience. Designs persist, generate shareable public links, track version history, and export PDF reports—all 100% free.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'16px', marginBottom:'40px' }}>
                {ACCOUNT_PERKS.map((p,i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + (i * 0.1) }} style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                    <div style={{ width:40, height:40, borderRadius:'12px', background:`${p.color}15`, border:`1px solid ${p.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', color:p.color }}>{p.icon}</div>
                    <span style={{ fontSize:'15px', color:T.text, fontWeight:600 }}>{p.label}</span>
                  </motion.div>
                ))}
              </div>
              <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cta-main" onClick={onAuthClick}>Create Free Account</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cta-ghost" onClick={onAuthClick}>Log In</motion.button>
              </div>
            </FadeIn>

            <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
              <FadeIn delay={0.3} className="glass-panel" style={{ padding:'32px', flex:1 }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:'16px', marginBottom:'16px' }}>
                  <div style={{ width:48, height:48, borderRadius:'14px', background:`${T.accent1}15`, border:`1px solid ${T.accent1}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', color:T.accent1 }}>⬡</div>
                  <div>
                    <h4 style={{ fontSize:'18px', fontWeight:700, color:T.text, marginBottom:'4px' }}>No account? No problem.</h4>
                    <p style={{ fontSize:'14px', color:T.textMuted }}>Design instantly right now.</p>
                  </div>
                </div>
                <p style={{ fontSize:'15px', color:T.textSub, lineHeight:1.7, marginBottom:'24px' }}>Jump straight into the canvas. Generate architecture graphs, explore AI rationales, and pan around without entering an email.</p>
                <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(91,163,201,0.1)' }} whileTap={{ scale: 0.98 }} className="cta-ghost" onClick={onEnter} style={{ width:'100%', borderColor:T.accent1, color:T.accent1, background:`${T.accent1}0A` }}>Try Sandbox Mode →</motion.button>
              </FadeIn>
              <FadeIn delay={0.4} className="glass-panel" style={{ padding:'24px', background:'rgba(224,122,122,0.03)', borderColor:'rgba(224,122,122,0.15)' }}>
                <div style={{ fontSize:'12px', fontFamily:"'Fira Code',monospace", color:'#E07A7A', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'16px', fontWeight:600 }}>Guest Limitations</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  {['Designs vanish on refresh','No share links','No version history','No PDF exports'].map((item,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px' }}><span style={{ color:'#E07A7A', fontSize:'14px' }}>✕</span><span style={{ fontSize:'13px', color:T.textMuted, fontWeight:500 }}>{item}</span></div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      )}

      {/* --- How It Works --- */}
      <section id="how" className="section-pad">
        <FadeIn style={{ textAlign:'center', marginBottom:'64px' }}>
          <div className="section-label" style={{ justifyContent:'center' }}><div className="section-label-line"/>How it works<div className="section-label-line"/></div>
          <h2 style={{ fontSize:'clamp(28px, 4vw, 48px)', fontWeight:800, letterSpacing:'-0.03em', color:T.text }}>Three steps to production.</h2>
        </FadeIn>
        <div className="steps-grid">
          {[
            { n:'01', title:'Describe Requirements', detail:'Type any system idea. e.g. "Design a scalable chat app". No complex drag-and-drop setup required.', icon:'✦', color:T.accent1 },
            { n:'02', title:'AI Engine Processing', detail:'Cohere AI analyzes constraints and maps out load balancers, DBs, caches, and connection protocols.', icon:'⬡', color:T.accent2 },
            { n:'03', title:'Interactive Exploration', detail:'Pan, zoom, and click into generated nodes to read the AI\'s architectural design rationale.', icon:'◎', color:T.green  },
          ].map((item,i) => (
            <FadeIn key={i} delay={i * 0.15} style={{ padding:'48px 32px', background:T.bgStep, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', bottom:'-10%', right:'-5%', fontSize:'120px', fontWeight:800, color:'rgba(255,255,255,0.02)', lineHeight:1, pointerEvents:'none' }}>{item.n}</div>
              <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 + (i * 0.2), duration: 0.8 }} style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, transparent, ${item.color}, transparent)`, transformOrigin:'left' }} />
              <div style={{ width:48, height:48, borderRadius:'14px', background:`${item.color}15`, border:`1px solid ${item.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', color:item.color, marginBottom:'24px', boxShadow:`0 8px 24px ${item.color}15` }}>{item.icon}</div>
              <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'12px', color:item.color, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'12px', fontWeight:600 }}>Phase {item.n}</div>
              <h3 style={{ fontSize:'22px', fontWeight:700, color:T.text, marginBottom:'12px', letterSpacing:'-0.02em' }}>{item.title}</h3>
              <p style={{ fontSize:'15px', color:T.textSub, lineHeight:1.7 }}>{item.detail}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* --- Features --- */}
      <section id="feat" className="section-pad">
        <FadeIn style={{ textAlign:'center', marginBottom:'64px' }}>
          <div className="section-label" style={{ justifyContent:'center' }}><div className="section-label-line"/>Capabilities<div className="section-label-line"/></div>
          <h2 style={{ fontSize:'clamp(28px, 4vw, 48px)', fontWeight:800, letterSpacing:'-0.03em', color:T.text }}>Everything a system designer needs.</h2>
        </FadeIn>
        <div className="feat-grid">
          {FEATURES.map((f,i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <motion.div whileHover={{ y: -5, borderColor: 'rgba(91,163,201,0.3)' }} className="glass-panel" style={{ padding:'36px' }}>
                <div style={{ width:56, height:56, borderRadius:'16px', background:`${f.color}15`, border:`1px solid ${f.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', color:f.color, marginBottom:'24px' }}>{f.icon}</div>
                <h3 style={{ fontSize:'20px', fontWeight:700, color:T.text, marginBottom:'12px', letterSpacing:'-0.02em' }}>{f.title}</h3>
                <p style={{ fontSize:'15px', color:T.textSub, lineHeight:1.7 }}>{f.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* --- Tech Stack --- */}
      <section id="stack" className="section-pad">
        <FadeIn className="glass-panel" style={{ padding:'clamp(32px, 5vw, 64px)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-30%', right:'-10%', width:'400px', height:'400px', background:`radial-gradient(circle, ${T.orb1}, transparent 70%)`, opacity:0.4, pointerEvents:'none' }} />
          <div className="section-label"><div className="section-label-line"/>Powered By</div>
          <h2 style={{ fontSize:'clamp(24px, 3.5vw, 40px)', fontWeight:800, letterSpacing:'-0.03em', color:T.text, marginBottom:'40px' }}>Built on a modern stack.</h2>
          <div className="stack-grid">
            {[
              { layer:'Frontend Environment', techs:['React 18', 'TypeScript', 'React Flow', 'Framer Motion'], color:T.accent1 },
              { layer:'Backend Services',  techs:['Node.js Environment', 'Express Server', 'MongoDB Atlas'], color:T.accent2 },
              { layer:'Intelligence Layer', techs:['Cohere API', 'command-a-03-2025', 'Structured JSON Output'], color:'#C49A3C' },
            ].map((s,i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }} style={{ padding:'24px', background:'rgba(0,0,0,0.2)', borderRadius:'16px', border:`1px solid ${s.color}20` }}>
                <div style={{ fontFamily:"'Fira Code',monospace", fontSize:'11px', color:s.color, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px', fontWeight:600 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:s.color, boxShadow:`0 0 10px ${s.color}` }} />{s.layer}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  {s.techs.map(t => (
                    <div key={t} style={{ display:'flex', alignItems:'center', gap:'10px' }}><div style={{ width:16, height:1, background:s.color, opacity:0.3 }} /><span style={{ fontSize:'14px', color:T.textSub, fontFamily:"'Fira Code',monospace", fontWeight:500 }}>{t}</span></div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* --- Final CTA --- */}
      <section className="section-pad" style={{ textAlign:'center', paddingBottom:'120px' }}>
        <FadeIn>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'min(600px, 90vw)', height:'300px', background:`radial-gradient(ellipse, ${T.orb2}, transparent 60%)`, filter:'blur(40px)', pointerEvents:'none', opacity:0.5 }} />
          <div className="section-label" style={{ justifyContent:'center' }}><div className="section-label-line"/>Ready?<div className="section-label-line"/></div>
          <h2 style={{ fontSize:'clamp(36px, 5vw, 64px)', fontWeight:800, letterSpacing:'-0.04em', color:T.text, marginBottom:'24px', lineHeight:1.1, position:'relative', zIndex:2 }}>Design anything. <br/><span className="shimmer-text">Right now.</span></h2>
          <p style={{ color:T.textSub, fontSize:'16px', marginBottom:'40px', position:'relative', zIndex:2, maxWidth:'500px', margin:'0 auto 40px' }}>{user ? 'Your workspace is ready and waiting.' : 'No credit card. No setup. Just instant architecture.'}</p>
          <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap', position:'relative', zIndex:2 }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cta-main" onClick={onEnter} style={{ padding:'18px 48px', fontSize:'16px', borderRadius:'14px' }}>{user ? 'Open Workspace →' : 'Launch ArchFlow →'}</motion.button>
            {!user && <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cta-ghost" onClick={onAuthClick} style={{ padding:'18px 36px', fontSize:'16px', borderRadius:'14px' }}>Create Account</motion.button>}
          </div>
        </FadeIn>
      </section>

      {/* --- Footer --- */}
      <footer style={{ borderTop:`1px solid ${T.borderFaint}`, padding:'24px 5vw', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px', background:'rgba(8,12,20,0.8)', backdropFilter:'blur(20px)', position:'relative', zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}><div style={{ width:24, height:24, borderRadius:'6px', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', color:'#fff' }}>⬡</div><span style={{ fontSize:'14px', fontWeight:700, color:T.text }}>ArchFlow</span></div>
        <span style={{ fontSize:'13px', color:T.textMuted, fontFamily:"'Fira Code',monospace" }}>Built for modern system designers.</span>
        <div style={{ display:'flex', gap:'8px', alignItems:'center', background:'rgba(79,168,130,0.1)', padding:'6px 12px', borderRadius:'100px', border:'1px solid rgba(79,168,130,0.2)' }}><div style={{ width:6, height:6, borderRadius:'50%', background:T.green, animation:'pulseGlow 2s infinite' }} /><span style={{ fontSize:'12px', color:T.green, fontFamily:"'Fira Code',monospace", fontWeight:600 }}>Systems Operational</span></div>
      </footer>
    </div>
  );
}