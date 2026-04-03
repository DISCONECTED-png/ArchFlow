import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, BackgroundVariant, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ArchNode from './components/ArchNode';
import AuthModal from './components/AuthModal';
import EstimatorPanel from './components/EstimatorPanel';
import SavedDesigns from './pages/SavedDesigns';
import LandingPage from './LandingPage';
import { buildLayoutedElements } from './hooks/useLayout';
import { EXAMPLE_PROMPTS, NODE_TYPES } from './nodeConfig';
import { useAuth } from './context/AuthContext';
import { generateDesign, fetchDesign, fetchSharedDesign, shareDesign, regenerateDesign } from './services/api';
import { downloadPDF } from './utils/exportUtils';

const nodeTypes = { archNode: ArchNode };

const T = {
  bg:'#080C14', header:'rgba(8,12,20,0.85)', border:'rgba(91,163,201,0.15)',
  input:'rgba(12,18,30,0.6)', panel:'rgba(11,16,32,0.85)', panelBorder:'rgba(91,163,201,0.1)',
  text:'#E4EBF5', textSub:'#A0B4C8', textMuted:'#738A9F',
  accent1:'#5BA3C9', accent2:'#8B7EC8', green:'#4FA882',
  canvasBg:'#080C14', dot:'#1A2740', emptyIcon:'#1A2E48',
  chip:'rgba(255,255,255,0.03)', chipBorder:'rgba(255,255,255,0.08)',
};

const NODE_INFO = {
  client:   { role:'Entry Point',   detail:'Users interact with this directly.',                  tech:'iOS/Android app, Web browser, CLI' },
  gateway:  { role:'Traffic Router',  detail:'Routes and load-balances requests to services.',      tech:'AWS API Gateway, Nginx, Kong' },
  service:  { role:'Business Logic',  detail:'Handles a specific domain. Stateless & scalable.',   tech:'Node.js, Go, Spring Boot' },
  cache:    { role:'Fast Storage',    detail:'In-memory storage to cut DB load and latency.',       tech:'Redis, Memcached, Varnish' },
  database: { role:'Persistent Store',detail:'Source of truth for structured data.',               tech:'PostgreSQL, MySQL, Cassandra' },
  queue:    { role:'Async Bridge',    detail:'Decouples producers and consumers.',                  tech:'Kafka, RabbitMQ, AWS SQS' },
  storage:  { role:'Object Store',    detail:'Unstructured data — images, videos, backups.',       tech:'AWS S3, GCS, MinIO' },
  cdn:      { role:'Edge Cache',      detail:'Serves static assets from global edge nodes.',       tech:'CloudFront, Fastly, Cloudflare' },
  monitor:  { role:'Observability',   detail:'Tracks health, metrics, logs and alerts.',           tech:'Prometheus, Grafana, Datadog' },
};

const PANEL_TABS = ['Info', 'Estimate', 'History'];

function NodeTooltip({ node, onClose }) {
  const cfg   = NODE_TYPES[node.type] || {};
  const info  = NODE_INFO[node.type]  || {};
  const color = cfg.color || '#5BA3C9';
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(8,12,20,0.65)', backdropFilter:'blur(4px)', padding:'16px' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={e => e.stopPropagation()} style={{ width:'min(360px,100%)', background:'rgba(12,18,32,0.95)', backdropFilter:'blur(16px)', border:`1px solid ${color}35`, borderRadius:'20px', overflow:'hidden', boxShadow:`0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)` }}>
        <div style={{ background:`linear-gradient(135deg,${color}15,transparent)`, borderBottom:`1px solid ${color}20`, padding:'20px 20px 16px' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:44, height:44, borderRadius:'12px', background:`${color}15`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', color, flexShrink:0, boxShadow:`0 4px 12px ${color}15` }}>{cfg.icon||'◉'}</div>
              <div>
                <div style={{ fontSize:'16px', fontWeight:700, color:T.text, letterSpacing:'-0.02em', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{node.label}</div>
                <div style={{ fontSize:'11px', color, fontFamily:"'Fira Code',monospace", textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'4px', fontWeight:600 }}>{node.type}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${T.border}`, borderRadius:'8px', width:'28px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center', color:T.textMuted, cursor:'pointer', transition:'0.2s' }}>✕</button>
          </div>
        </div>
        <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <span style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.15em' }}>Role</span>
            <span style={{ background:`${color}15`, color, fontSize:'12px', fontFamily:"'Fira Code',monospace", padding:'4px 10px', borderRadius:'6px', fontWeight:600 }}>{info.role||node.type}</span>
          </div>
          <div>
            <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'6px' }}>What it does</div>
            <p style={{ fontSize:'14px', color:T.textSub, lineHeight:1.7, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{node.description || info.detail}</p>
          </div>
          {info.detail && node.description && (
            <div>
              <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'6px' }}>In this system</div>
              <p style={{ fontSize:'13px', color:T.textMuted, lineHeight:1.7, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{info.detail}</p>
            </div>
          )}
          {info.tech && (
            <div>
              <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'8px' }}>Common tech</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {info.tech.split(',').map(t => (
                  <span key={t} style={{ fontSize:'12px', fontFamily:"'Fira Code',monospace", color:T.textSub, background:'rgba(255,255,255,0.03)', border:`1px solid ${T.border}`, padding:'4px 10px', borderRadius:'6px' }}>{t.trim()}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ShareToast({ shareId, onClose }) {
  const url = `${window.location.origin}/#shared/${shareId}`;
  return (
    <motion.div initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }} transition={{ type: "spring", damping: 20 }} style={{ position:'fixed', bottom:'32px', left:'50%', zIndex:250, background:'rgba(12,18,32,0.95)', backdropFilter:'blur(16px)', border:`1px solid ${T.green}40`, borderRadius:'16px', padding:'16px 24px', boxShadow:`0 20px 40px rgba(0,0,0,0.5), 0 0 30px ${T.green}15`, display:'flex', alignItems:'center', gap:'16px', minWidth:'360px' }}>
      <div style={{ width:10, height:10, borderRadius:'50%', background:T.green, boxShadow:`0 0 10px ${T.green}` }} />
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'14px', fontWeight:700, color:T.text, marginBottom:'6px', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Share link ready!</div>
        <input readOnly value={url} onClick={e => { e.target.select(); navigator.clipboard.writeText(url); }} style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:`1px solid ${T.border}`, borderRadius:'8px', padding:'8px 12px', color:T.accent1, fontSize:'13px', outline:'none', fontFamily:"'Fira Code',monospace", cursor:'pointer' }} />
      </div>
      <button onClick={onClose} style={{ background:'none', border:'none', color:T.textMuted, cursor:'pointer', fontSize:'18px', padding:'4px' }}>✕</button>
    </motion.div>
  );
}

export default function App() {
  const getPage = () => {
    const hash = window.location.hash;
    if (hash.startsWith('#shared/')) return 'shared';
    if (hash === '#app') return 'app';
    return 'landing';
  };

  const [page, setPage] = useState(getPage);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [design, setDesign] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [panelTab, setPanelTab] = useState('Info');
  const [showAuth, setShowAuth] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [shareId, setShareId] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback((params) => setEdges(e => addEdge({ ...params, animated:true, style:{ stroke:T.accent1, strokeWidth:2, opacity:0.6 } }, e)), [setEdges]);

  const { user, loading: authLoading, logout } = useAuth();
  const legendEntries = useMemo(() => Object.entries(NODE_TYPES).map(([type,cfg]) => ({type,cfg})), []);

  useEffect(() => {
    const handler = () => { setPage(getPage()); };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  useEffect(() => {
    if (page !== 'shared') return;
    const shareId = window.location.hash.replace('#shared/', '');
    fetchSharedDesign(shareId)
      .then(res => applyDesignData(res.data.design, res.data.estimate))
      .catch(() => setError('Shared design not found or no longer public'));
  }, [page]);

  useEffect(() => {
    if (design && window.innerWidth <= 768) setTimeout(() => setPanelOpen(true), 300);
  }, [design]);

  const applyDesignData = (d, est) => {
    const rawNodes = (d.nodes||[]).map(n => ({ id:n.id, label:n.label, nodeType:n.type, description:n.description }));
    const rawEdges = (d.edges||[]).map(e => ({ source:e.source, target:e.target, label:e.label }));
    const { nodes:ln, edges:le } = buildLayoutedElements(rawNodes, rawEdges);
    setNodes(ln); setEdges(le); setDesign(d); setEstimate(est || null);
  };

  const handleGenerate = useCallback(async (inputPrompt) => {
    const q = (inputPrompt || prompt).trim();
    if (!q) return;
    setLoading(true); setError(''); setDesign(null); setTooltip(null); setCurrentId(null);
    try {
      const { data } = await generateDesign(q);
      applyDesignData(data, data.estimate);
      if (data.savedId) setCurrentId(data.savedId);
    } catch(err) { setError(err.response?.data?.error || 'Failed to generate design.'); } 
    finally { setLoading(false); }
  }, [prompt]);

  const handleLoadDesign = async (id) => {
    setShowSaved(false); setLoading(true); setError('');
    try {
      const { data } = await fetchDesign(id);
      applyDesignData(data.design, data.estimate);
      setCurrentId(data.design._id);
      setPrompt(data.design.prompt);
    } catch(err) { setError('Could not load design'); } 
    finally { setLoading(false); }
  };

  const handleRegenerate = async () => {
    if (!currentId) return;
    setRegenLoading(true); setError('');
    try {
      const { data } = await regenerateDesign(currentId);
      applyDesignData(data, data.estimate);
      if (data.savedId) setCurrentId(data.savedId);
    } catch(err) { setError('Regeneration failed'); } 
    finally { setRegenLoading(false); }
  };

  const handleShare = async () => {
    if (!currentId) { alert('Generate a design first, and sign in to share it.'); return; }
    try {
      const { data } = await shareDesign(currentId);
      setShareId(data.shareId);
    } catch(err) { alert(err.response?.data?.error || 'Share failed'); }
  };

  const handlePDF = useCallback(() => {
    if (!design) return;
    setPdfLoading(true);
    setTimeout(() => { downloadPDF(design, nodes, edges, estimate); setPdfLoading(false); }, 100);
  }, [design, nodes, edges, estimate]);

  const goToApp  = () => { window.location.hash = 'app'; setPage('app'); };
  const goHome   = () => { window.location.hash = '';    setPage('landing'); };

  if (authLoading) return (
    <div style={{ height:'100vh', background:T.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'24px' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ fontSize:'48px', color:T.accent1 }}>⬡</motion.div>
      <div style={{ fontSize:'14px', fontFamily:"'Fira Code',monospace", color:T.text, fontWeight:600 }}>Loading ArchFlow...</div>
    </div>
  );

  if (page === 'landing') return (
    <>
      <LandingPage onEnter={goToApp} user={user} onAuthClick={() => setShowAuth(true)} onLogout={logout} />
      <AnimatePresence>{showAuth && <AuthModal onClose={() => setShowAuth(false)} />}</AnimatePresence>
    </>
  );

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:T.bg, color:T.text, fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:'hidden' }}>
      <AnimatePresence>{tooltip && <NodeTooltip node={tooltip} onClose={() => setTooltip(null)} />}</AnimatePresence>
      <AnimatePresence>{showAuth && <AuthModal onClose={() => setShowAuth(false)} />}</AnimatePresence>
      <AnimatePresence>{showSaved && <SavedDesigns onLoadDesign={handleLoadDesign} onClose={() => setShowSaved(false)} />}</AnimatePresence>
      <AnimatePresence>{shareId && <ShareToast shareId={shareId} onClose={() => setShareId(null)} />}</AnimatePresence>

      {/* HEADER */}
      <header style={{ padding:'12px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:'16px', background:T.header, backdropFilter:'blur(24px)', zIndex:50, flexWrap:'wrap' }}>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={goHome} style={{ display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }}>
          <div style={{ width:32, height:32, borderRadius:'10px', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', boxShadow:`0 4px 12px rgba(91,163,201,0.3)` }}>⬡</div>
          <div>
            <div style={{ fontSize:'14px', fontWeight:800, fontFamily:"'Plus Jakarta Sans',sans-serif", color:T.text, lineHeight:1.2 }}>ArchFlow</div>
            <div style={{ fontSize:'10px', color:T.accent1, fontFamily:"'Fira Code',monospace", fontWeight:600 }}>← home</div>
          </div>
        </motion.div>

        <div style={{ width:1, height:24, background:T.border }} />

        <div style={{ flex:1, display:'flex', gap:'8px', minWidth:'200px' }}>
          <input value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key==='Enter' && handleGenerate()} placeholder="Design a scalable chat app..."
            style={{ flex:1, background:T.input, border:`1px solid ${T.border}`, borderRadius:'10px', padding:'10px 14px', color:T.text, fontSize:'14px', outline:'none', fontFamily:"'Plus Jakarta Sans',sans-serif", transition:'all 0.2s', boxShadow:'inset 0 2px 4px rgba(0,0,0,0.2)' }}
            onFocus={e => { e.target.style.borderColor=T.accent1; e.target.style.background='rgba(12,18,30,0.8)'; }} onBlur={e => { e.target.style.borderColor=T.border; e.target.style.background=T.input; }} />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleGenerate()} disabled={loading||!prompt.trim()}
            style={{ padding:'10px 20px', borderRadius:'10px', border:'none', background: loading ? T.border : `linear-gradient(135deg,${T.accent1},${T.accent2})`, color: '#fff', fontSize:'13px', fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", whiteSpace:'nowrap', opacity: loading||!prompt.trim() ? 0.6 : 1, boxShadow: loading ? 'none' : `0 4px 12px rgba(91,163,201,0.3)` }}>
            {loading ? 'Processing...' : 'Generate →'}
          </motion.button>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
          {design && (
            <>
              {currentId && user && (
                <motion.button whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }} onClick={handleRegenerate} disabled={regenLoading} style={{ padding:'8px 12px', borderRadius:'8px', border:`1px solid ${T.border}`, background:'transparent', color:T.text, fontSize:'13px', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600 }}>
                  {regenLoading ? '⟳' : '↺'} Regenerate
                </motion.button>
              )}
              <motion.button whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }} onClick={handleShare} disabled={!user} style={{ padding:'8px 12px', borderRadius:'8px', border:`1px solid ${T.border}`, background:'transparent', color:T.text, fontSize:'13px', cursor: user ? 'pointer' : 'not-allowed', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600, opacity: user ? 1 : 0.5 }}>⬡ Share</motion.button>
              <motion.button whileHover={{ backgroundColor: `${T.green}20` }} onClick={handlePDF} disabled={pdfLoading} style={{ padding:'8px 12px', borderRadius:'8px', border:`1px solid ${T.green}40`, background:`${T.green}15`, color:T.green, fontSize:'13px', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600 }}>↓ Export PDF</motion.button>
            </>
          )}
          {user && <motion.button whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }} onClick={() => setShowSaved(true)} style={{ padding:'8px 12px', borderRadius:'8px', border:`1px solid ${T.border}`, background:'transparent', color:T.text, fontSize:'13px', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600 }}>▣ Saved</motion.button>}
          {user ? (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 12px', borderRadius:'100px', border:`1px solid ${T.border}`, background:'rgba(255,255,255,0.03)' }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#fff' }}>{user.name?.[0]?.toUpperCase()}</div>
            </div>
          ) : (
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowAuth(true)} style={{ padding:'8px 16px', borderRadius:'8px', border:`1px solid ${T.border}`, background:'rgba(255,255,255,0.05)', color:T.text, fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Log In</motion.button>
          )}
          {design && window.innerWidth <= 768 && (
            <button onClick={() => setPanelOpen(o => !o)} style={{ padding:'8px', borderRadius:'8px', border:`1px solid ${T.accent1}`, background:`${T.accent1}20`, color:T.accent1, fontSize:'16px', cursor:'pointer' }}>⬡</button>
          )}
        </div>
      </header>

      {/* CHIPS */}
      <div style={{ padding:'10px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', gap:'8px', flexWrap:'wrap', background:T.header }}>
        {!design && !loading && (
          <>
            <span style={{ fontSize:'12px', color:T.textMuted, fontFamily:"'Fira Code',monospace", alignSelf:'center', marginRight:'8px' }}>Try prompts:</span>
            {EXAMPLE_PROMPTS.map((p,i) => (
              <motion.button key={p} whileHover={{ scale: 1.05, borderColor: T.accent1, color: T.accent1, backgroundColor: 'rgba(91,163,201,0.1)' }} onClick={() => { setPrompt(p); handleGenerate(p); }}
                style={{ padding:'6px 14px', borderRadius:'100px', border:`1px solid ${T.chipBorder}`, background:T.chip, color:T.textMuted, fontSize:'12px', cursor:'pointer', fontFamily:"'Fira Code',monospace" }}>{p}</motion.button>
            ))}
          </>
        )}
        {design && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <span style={{ fontSize:'15px', fontWeight:700, color:T.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{design.title}</span>
            <span style={{ fontSize:'12px', color:T.textMuted, fontFamily:"'Fira Code',monospace", background:'rgba(255,255,255,0.05)', padding:'4px 10px', borderRadius:'6px' }}>{nodes.length} nodes · {edges.length} edges</span>
          </motion.div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', position:'relative' }}>
        {/* CANVAS */}
        <div style={{ flex:1, position:'relative' }}>
          
          {/* Empty State */}
          {!design && !loading && !error && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
              <div style={{ fontSize:'80px', color:T.emptyIcon, marginBottom:'20px' }}>⬡</div>
              <div style={{ fontSize:'18px', fontWeight:700, color:T.textMuted, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Enter a system to start designing.</div>
            </motion.div>
          )}

          {/* Epic God-Tier Loading Overlay (For initial & regenerate) */}
          <AnimatePresence>
            {(loading || regenLoading) && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                style={{ position:'absolute', inset:0, zIndex:10, background:'rgba(8,12,20,0.85)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}
              >
                <div style={{ position:'relative', marginBottom:'28px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ fontSize:'54px', color:T.accent1, lineHeight:1, zIndex:2 }}>⬡</motion.div>
                  <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }} style={{ position:'absolute', inset:-12, border:`1px solid ${T.accent1}30`, borderRadius:'50%', zIndex:1 }} />
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} style={{ position:'absolute', width:'40px', height:'40px', background:`${T.accent1}`, filter:'blur(20px)', borderRadius:'50%', zIndex:0 }} />
                </div>
                
                <div style={{ fontSize:'16px', fontFamily:"'Fira Code',monospace", color:T.accent1, fontWeight:600, marginBottom:'8px' }}>
                  {regenLoading ? 'Re-architecting system...' : 'Architecting system...'}
                </div>
                
                <div style={{ fontSize:'13px', color:T.textMuted, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:'24px' }}>
                  This usually takes 15–20 seconds
                </div>
                
                <div style={{ width:'180px', height:'3px', background:'rgba(91,163,201,0.12)', borderRadius:'3px', overflow:'hidden', position:'relative' }}>
                  <motion.div 
                    animate={{ x: ['-100%', '100%'] }} 
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} 
                    style={{ position:'absolute', inset:0, background:`linear-gradient(90deg, transparent, ${T.accent1}, ${T.accent2}, transparent)` }} 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ position:'absolute', inset:0, zIndex:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ background:'rgba(224,122,122,0.1)', border:'1px solid rgba(224,122,122,0.3)', borderRadius:'16px', padding:'32px', textAlign:'center', backdropFilter:'blur(16px)' }}>
                <div style={{ fontSize:'32px', marginBottom:'16px' }}>⚠️</div>
                <div style={{ color:'#E07A7A', fontSize:'15px', fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:'16px' }}>{error}</div>
                <button onClick={() => setError('')} style={{ padding:'8px 24px', borderRadius:'8px', border:'1px solid #E07A7A', background:'transparent', color:'#E07A7A', cursor:'pointer', fontWeight:600 }}>Dismiss</button>
              </div>
            </motion.div>
          )}

          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_, node) => setTooltip({ label:node.data.label, type:node.data.type, description:node.data.description })} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding:0.2 }} minZoom={0.2} maxZoom={3} style={{ background:T.canvasBg }}>
            <Background variant={BackgroundVariant.Dots} gap={30} size={1.5} color={T.dot} />
            <Controls style={{ background:T.panel, border:`1px solid ${T.border}`, borderRadius:'12px', overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }} buttonStyle={{ background:T.panel, border:'none', color:T.text, borderBottom:`1px solid ${T.border}` }} />
            <MiniMap style={{ background:T.panel, border:`1px solid ${T.border}`, borderRadius:'12px' }} nodeColor={n => NODE_TYPES[n.data?.type]?.color || T.textMuted} maskColor="rgba(8,12,20,0.8)" />
          </ReactFlow>
        </div>

        {/* RIGHT PANEL */}
        <AnimatePresence>
          {(design && (window.innerWidth > 768 || panelOpen)) && (
            <>
              {window.innerWidth <= 768 && panelOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanelOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:79, backdropFilter:'blur(4px)' }} />}
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }} 
                style={{ width:'320px', background:'rgba(12,18,32,0.95)', backdropFilter:'blur(24px)', borderLeft:`1px solid ${T.border}`, display:'flex', flexDirection:'column', zIndex:80, position: window.innerWidth <= 768 ? 'fixed' : 'relative', right:0, top:0, bottom:0 }}>
                
                <div style={{ display:'flex', borderBottom:`1px solid ${T.border}` }}>
                  {PANEL_TABS.map(tab => (
                    <button key={tab} onClick={() => setPanelTab(tab)} style={{ flex:1, padding:'16px 8px', background:'none', border:'none', borderBottom: panelTab===tab ? `2px solid ${T.accent1}` : '2px solid transparent', color: panelTab===tab ? T.accent1 : T.textMuted, fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:"'Fira Code',monospace", textTransform:'uppercase', transition:'0.2s' }}>{tab}</button>
                  ))}
                  {window.innerWidth <= 768 && <button onClick={() => setPanelOpen(false)} style={{ padding:'0 16px', background:'none', border:'none', color:T.text, fontSize:'20px' }}>✕</button>}
                </div>

                <div style={{ flex:1, overflowY:'auto' }}>
                  {panelTab === 'Info' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'24px' }}>
                      <div>
                        <div style={{ fontSize:'11px', fontFamily:"'Fira Code',monospace", color:T.accent1, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'8px' }}>Overview</div>
                        <p style={{ fontSize:'14px', color:T.textSub, lineHeight:1.7, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{design.description}</p>
                      </div>
                      {design.keyDecisions?.length > 0 && (
                        <div>
                          <div style={{ fontSize:'11px', fontFamily:"'Fira Code',monospace", color:T.accent1, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'12px' }}>Decisions</div>
                          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                            {design.keyDecisions.map((d,i) => (
                              <div key={i} style={{ display:'flex', gap:'12px' }}>
                                <span style={{ color:T.accent1, fontFamily:"'Fira Code',monospace", fontSize:'12px', opacity:0.6 }}>0{i+1}</span>
                                <span style={{ fontSize:'13px', color:T.text, lineHeight:1.6 }}>{d}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                  {panelTab === 'Estimate' && <EstimatorPanel estimate={estimate} />}
                  {panelTab === 'History' && (
                    <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'16px' }}>
                      <motion.button whileHover={{ scale: 1.02 }} onClick={handleShare} style={{ width:'100%', padding:'12px', borderRadius:'10px', border:`1px solid ${T.accent1}`, background:`${T.accent1}15`, color:T.accent1, fontWeight:600, cursor:'pointer' }}>Generate Share Link →</motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} onClick={handleRegenerate} style={{ width:'100%', padding:'12px', borderRadius:'10px', border:`1px solid ${T.accent2}`, background:`${T.accent2}15`, color:T.accent2, fontWeight:600, cursor:'pointer' }}>↺ New Version</motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowSaved(true)} style={{ width:'100%', padding:'12px', borderRadius:'10px', border:`1px solid ${T.border}`, background:'transparent', color:T.text, fontWeight:600, cursor:'pointer' }}>▣ View Saved</motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}