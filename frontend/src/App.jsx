import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState, BackgroundVariant,
  addEdge,
} from '@xyflow/react';
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
import React from 'react';

const nodeTypes = { archNode: ArchNode };

const T = {
  bg:'#080C14', header:'rgba(8,12,20,0.94)', border:'rgba(91,163,201,0.11)',
  input:'rgba(12,18,30,0.9)', panel:'#0B1020', panelBorder:'rgba(91,163,201,0.08)',
  text:'#E4EBF5', textSub:'#8FA5BC', textMuted:'#5E7A96',
  accent1:'#5BA3C9', accent2:'#8B7EC8', green:'#4FA882',
  canvasBg:'#080C14', dot:'#1A2740',
  chip:'rgba(12,18,30,0.85)', chipBorder:'rgba(91,163,201,0.13)',
  emptyIcon:'#1A2E48',
};

const NODE_INFO = {
  client:   { role:'Entry Point',     detail:'Users interact with this directly.',                  tech:'iOS/Android app, Web browser, CLI' },
  gateway:  { role:'Traffic Router',  detail:'Routes and load-balances requests to services.',      tech:'AWS API Gateway, Nginx, Kong' },
  service:  { role:'Business Logic',  detail:'Handles a specific domain. Stateless & scalable.',   tech:'Node.js, Go, Spring Boot' },
  cache:    { role:'Fast Storage',    detail:'In-memory storage to cut DB load and latency.',       tech:'Redis, Memcached, Varnish' },
  database: { role:'Persistent Store',detail:'Source of truth for structured data.',               tech:'PostgreSQL, MySQL, Cassandra' },
  queue:    { role:'Async Bridge',    detail:'Decouples producers and consumers.',                  tech:'Kafka, RabbitMQ, AWS SQS' },
  storage:  { role:'Object Store',    detail:'Unstructured data — images, videos, backups.',       tech:'AWS S3, GCS, MinIO' },
  cdn:      { role:'Edge Cache',      detail:'Serves static assets from global edge nodes.',       tech:'CloudFront, Fastly, Cloudflare' },
  monitor:  { role:'Observability',   detail:'Tracks health, metrics, logs and alerts.',           tech:'Prometheus, Grafana, Datadog' },
};

// ── Tab type ──
const PANEL_TABS = ['Info', 'Estimate', 'History'];

// ── Node Tooltip ─────────────────────────────────────────────────────────────
function NodeTooltip({ node, onClose }) {
  const cfg   = NODE_TYPES[node.type] || {};
  const info  = NODE_INFO[node.type]  || {};
  const color = cfg.color || '#5BA3C9';
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(8,12,20,0.65)', backdropFilter:'blur(4px)', animation:'fadeIn 0.2s ease both', padding:'16px' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:'min(360px,100%)', background:'#0C1220', border:`1px solid ${color}35`, borderRadius:'18px', overflow:'hidden', boxShadow:`0 40px 80px rgba(0,0,0,0.5), 0 0 40px ${color}10`, animation:'tooltipIn 0.3s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div style={{ background:`linear-gradient(135deg,${color}18,transparent)`, borderBottom:`1px solid ${color}20`, padding:'18px 18px 14px' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'10px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'11px' }}>
              <div style={{ width:40, height:40, borderRadius:'11px', background:`${color}18`, border:`1px solid ${color}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'19px', color, flexShrink:0 }}>{cfg.icon||'◉'}</div>
              <div>
                <div style={{ fontSize:'15px', fontWeight:700, color:T.text, letterSpacing:'-0.01em' }}>{node.label}</div>
                <div style={{ fontSize:'11px', color, fontFamily:"'Fira Code',monospace", textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'2px', opacity:0.85 }}>{node.type}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', color:T.textMuted, cursor:'pointer', fontSize:'16px', opacity:0.6, lineHeight:1, flexShrink:0 }}
              onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0.6'}>✕</button>
          </div>
        </div>
        <div style={{ padding:'16px 18px 18px', display:'flex', flexDirection:'column', gap:'13px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.1em' }}>Role</span>
            <span style={{ background:`${color}15`, color, fontSize:'11px', fontFamily:"'Fira Code',monospace", padding:'3px 9px', borderRadius:'5px', fontWeight:500 }}>{info.role||node.type}</span>
          </div>
          <div>
            <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'5px' }}>What it does</div>
            <p style={{ fontSize:'13px', color:T.textSub, lineHeight:1.68 }}>{node.description || info.detail}</p>
          </div>
          {info.detail && node.description && (
            <div>
              <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'5px' }}>In this system</div>
              <p style={{ fontSize:'13px', color:T.textMuted, lineHeight:1.68 }}>{info.detail}</p>
            </div>
          )}
          {info.tech && (
            <div>
              <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'6px' }}>Common tech</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                {info.tech.split(',').map(t => (
                  <span key={t} style={{ fontSize:'11px', fontFamily:"'Fira Code',monospace", color:T.textMuted, background:'rgba(91,163,201,0.06)', border:'1px solid rgba(91,163,201,0.12)', padding:'3px 8px', borderRadius:'5px' }}>{t.trim()}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ borderTop:`1px solid rgba(91,163,201,0.08)`, padding:'9px 18px', textAlign:'center' }}>
          <span style={{ fontSize:'11px', color:T.textMuted, fontFamily:"'Fira Code',monospace" }}>click anywhere to close</span>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes tooltipIn{from{opacity:0;transform:scale(0.92) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
      `}</style>
    </div>
  );
}

// ── Share toast ───────────────────────────────────────────────────────────────
function ShareToast({ shareId, onClose }) {
  const url = `${window.location.origin}/#shared/${shareId}`;
  return (
    <div style={{ position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)', zIndex:250, background:'#0C1220', border:`1px solid ${T.green}35`, borderRadius:'12px', padding:'14px 20px', boxShadow:`0 16px 40px rgba(0,0,0,0.4), 0 0 20px ${T.green}12`, animation:'slideUpToast 0.3s ease both', display:'flex', alignItems:'center', gap:'12px', minWidth:'340px' }}>
      <div style={{ width:8, height:8, borderRadius:'50%', background:T.green, flexShrink:0 }} />
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'13px', fontWeight:600, color:T.text, marginBottom:'4px' }}>Share link ready!</div>
        <input readOnly value={url} onClick={e => { e.target.select(); navigator.clipboard.writeText(url); }}
          style={{ width:'100%', background:'rgba(8,12,20,0.6)', border:`1px solid rgba(91,163,201,0.15)`, borderRadius:'6px', padding:'6px 10px', color:T.accent1, fontSize:'12px', outline:'none', fontFamily:"'Fira Code',monospace", cursor:'pointer' }} />
        <div style={{ fontSize:'11px', color:T.textMuted, marginTop:'3px' }}>Click to copy</div>
      </div>
      <button onClick={onClose} style={{ background:'none', border:'none', color:T.textMuted, cursor:'pointer', fontSize:'16px', opacity:0.6, flexShrink:0 }}>✕</button>
      <style>{`@keyframes slideUpToast{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const getPage = () => {
    const hash = window.location.hash;
    if (hash.startsWith('#shared/')) return 'shared';
    if (hash === '#app') return 'app';
    return 'landing';
  };

  const [page,       setPage]       = useState(getPage);
  const [prompt,     setPrompt]     = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [design,     setDesign]     = useState(null);
  const [estimate,   setEstimate]   = useState(null);
  const [currentId,  setCurrentId]  = useState(null); // DB id of current design
  const [tooltip,    setTooltip]    = useState(null);
  const [panelIn,    setPanelIn]    = useState(false);
  const [panelTab,   setPanelTab]   = useState('Info');
  const [showAuth,   setShowAuth]   = useState(false);
  const [showSaved,  setShowSaved]  = useState(false);
  const [shareId,    setShareId]    = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false); // mobile panel toggle
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback((params) => setEdges(e => addEdge({ ...params, animated:true, style:{ stroke:'rgba(91,163,201,0.4)', strokeWidth:1.5 } }, e)), [setEdges]);

  const { user, loading: authLoading, logout } = useAuth();
  const legendEntries = useMemo(() => Object.entries(NODE_TYPES).map(([type,cfg]) => ({type,cfg})), []);

  // Hash routing
  useEffect(() => {
    const handler = () => { setPage(getPage()); };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // Load shared design from URL
  useEffect(() => {
    if (page !== 'shared') return;
    const shareId = window.location.hash.replace('#shared/', '');
    fetchSharedDesign(shareId)
      .then(res => applyDesignData(res.data.design, res.data.estimate))
      .catch(() => setError('Shared design not found or no longer public'));
  }, [page]);

  useEffect(() => {
    if (design) {
      const t = setTimeout(() => setPanelIn(true), 60);
      // Auto-open panel on mobile when design loads
      if (window.innerWidth <= 768) setTimeout(() => setPanelOpen(true), 300);
      return () => clearTimeout(t);
    }
    else { setPanelIn(false); setPanelOpen(false); }
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
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to generate design.');
    } finally { setLoading(false); }
  }, [prompt]);

  const handleLoadDesign = async (id) => {
    setShowSaved(false); setLoading(true); setError('');
    try {
      const { data } = await fetchDesign(id);
      applyDesignData(data.design, data.estimate);
      setCurrentId(data.design._id);
      setPrompt(data.design.prompt);
    } catch(err) {
      setError('Could not load design');
    } finally { setLoading(false); }
  };

  const handleRegenerate = async () => {
    if (!currentId) return;
    setRegenLoading(true); setError('');
    try {
      const { data } = await regenerateDesign(currentId);
      applyDesignData(data, data.estimate);
      if (data.savedId) setCurrentId(data.savedId);
    } catch(err) {
      setError('Regeneration failed');
    } finally { setRegenLoading(false); }
  };

  const handleShare = async () => {
    if (!currentId) { alert('Generate a design first, and sign in to share it.'); return; }
    try {
      const { data } = await shareDesign(currentId);
      setShareId(data.shareId);
    } catch(err) {
      alert(err.response?.data?.error || 'Share failed');
    }
  };

  const handlePDF = useCallback(() => {
    if (!design) return;
    setPdfLoading(true);
    setTimeout(() => { downloadPDF(design, nodes, edges, estimate); setPdfLoading(false); }, 100);
  }, [design, nodes, edges, estimate]);

  const goToApp  = () => { window.location.hash = 'app'; setPage('app'); };
  const goHome   = () => { window.location.hash = '';    setPage('landing'); };

  if (authLoading) return (
    <div style={{ height:'100vh', background:'#080C14', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'20px' }}>
      <div style={{ position:'relative' }}>
        <div style={{ fontSize:'40px', animation:'spin 2s linear infinite', color:'#5BA3C9' }}>⬡</div>
        <div style={{ position:'absolute', inset:'-10px', border:'1px solid rgba(91,163,201,0.2)', borderRadius:'50%', animation:'spin 3.5s linear reverse infinite' }} />
      </div>
      <div style={{ fontSize:'13px', fontFamily:"'Fira Code',monospace", color:'#5BA3C9', fontWeight:500 }}>Loading ArchFlow...</div>
      <div style={{ width:'140px', height:'2px', background:'rgba(91,163,201,0.12)', borderRadius:'1px', overflow:'hidden' }}>
        <div style={{ height:'100%', background:'linear-gradient(90deg,transparent,#5BA3C9,#8B7EC8,transparent)', backgroundSize:'50% 100%', animation:'loadBar 1.4s linear infinite' }} />
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes loadBar{0%{background-position:-100% 0}100%{background-position:200% 0}}`}</style>
    </div>
  );
  if (page === 'landing') return (
    <>
      <LandingPage onEnter={goToApp} user={user} onAuthClick={() => setShowAuth(true)} onLogout={() => { logout(); }} />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:T.bg, color:T.text, fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes softPulse{0%,100%{opacity:.65}50%{opacity:1}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideRight{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes loadBar{0%{background-position:-100% 0}100%{background-position:200% 0}}

        .app-chip{will-change:transform;transition:transform 0.18s ease,border-color 0.18s,color 0.18s,background 0.18s!important}
        .app-chip:hover{transform:translateY(-1px) scale(1.03)!important}
        .design-btn{will-change:transform;transition:transform 0.22s ease,box-shadow 0.22s ease!important}
        .design-btn:not(:disabled):hover{transform:translateY(-1px) scale(1.02)!important;box-shadow:0 5px 18px rgba(91,163,201,0.28)!important}
        .design-btn:not(:disabled):active{transform:scale(0.97)!important}
        .icon-btn{transition:all 0.18s ease!important}
        .icon-btn:hover{background:rgba(91,163,201,0.1)!important;border-color:rgba(91,163,201,0.25)!important;color:#8FA5BC!important}
        .back-btn{transition:opacity 0.2s;cursor:pointer}
        .back-btn:hover{opacity:0.7!important}
        .legend-row{transition:transform 0.18s ease}
        .legend-row:hover{transform:translateX(2px)}
        .panel-row{transition:background 0.2s}
        .panel-row:hover{background:rgba(91,163,201,0.03)!important}
        .tab-btn{transition:all 0.18s ease!important}
        .dismiss-btn{transition:background 0.2s!important}
        .dismiss-btn:hover{background:rgba(196,96,96,0.08)!important}
        .react-flow__controls{border-radius:12px!important;overflow:hidden}
        .react-flow__controls-button{transition:background 0.15s!important}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(91,163,201,0.18);border-radius:2px}

        @media(max-width:768px){
          .right-panel{position:fixed!important;right:0;top:0;bottom:0;z-index:80;transform:translateX(100%);transition:transform 0.32s cubic-bezier(0.16,1,0.3,1);width:min(300px,88vw)!important;box-shadow:none!important;opacity:1!important}
          .right-panel.open{transform:translateX(0)!important;box-shadow:-8px 0 40px rgba(0,0,0,0.5)!important}
          .panel-backdrop{display:block!important}
          .chips-bar{display:none!important}
          .header-actions{gap:6px!important}
          .hide-mobile{display:none!important}
        }
        @media(min-width:769px){
          .panel-backdrop{display:none!important}
          .panel-toggle-btn{display:none!important}
          .panel-close-btn{display:none!important}
        }
        @media(max-width:768px){
          .panel-close-btn{display:flex!important}
        }
        .panel-backdrop{display:none;position:fixed;inset:0;background:rgba(8,12,20,0.6);z-index:79;backdrop-filter:blur(2px);animation:fadeIn 0.2s ease both}
      `}</style>

      {tooltip && <NodeTooltip node={tooltip} onClose={() => setTooltip(null)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showSaved && <SavedDesigns onLoadDesign={handleLoadDesign} onClose={() => setShowSaved(false)} />}
      {shareId && <ShareToast shareId={shareId} onClose={() => setShareId(null)} />}

      {/* ── HEADER ── */}
      <header style={{ padding:'11px 16px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:'12px', flexShrink:0, background:T.header, backdropFilter:'blur(18px)', zIndex:50, boxShadow:'0 1px 20px rgba(0,0,0,0.22)', flexWrap:'wrap' }}>

        {/* Logo */}
        <div className="back-btn" style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }} onClick={goHome}>
          <div style={{ width:28, height:28, borderRadius:'7px', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', animation:'softPulse 4s ease-in-out infinite', boxShadow:`0 3px 10px ${T.accent1}28` }}>⬡</div>
          <div>
            <div style={{ fontSize:'12px', fontWeight:700, fontFamily:"'Fira Code',monospace", color:T.text, lineHeight:1.2 }}>ArchFlow</div>
            <div style={{ fontSize:'9px', color:T.accent1, fontFamily:"'Fira Code',monospace', letterSpacing:'0.05em", opacity:0.8 }}>← home</div>
          </div>
        </div>

        <div style={{ width:1, height:24, background:T.border, flexShrink:0 }} />

        {/* Input */}
        <div style={{ flex:1, display:'flex', gap:'7px', minWidth:'180px' }}>
          <input value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key==='Enter' && handleGenerate()}
            placeholder="Design Twitter, Netflix, Uber..."
            style={{ flex:1, background:T.input, border:`1px solid ${T.border}`, borderRadius:'8px', padding:'8px 12px', color:T.text, fontSize:'13px', outline:'none', fontFamily:"'Plus Jakarta Sans',sans-serif", minWidth:0, transition:'border-color 0.2s,box-shadow 0.2s' }}
            onFocus={e => { e.target.style.borderColor=T.accent1+'55'; e.target.style.boxShadow=`0 0 0 3px ${T.accent1}10`; }}
            onBlur={e => { e.target.style.borderColor=T.border; e.target.style.boxShadow='none'; }} />
          <button className="design-btn" onClick={() => handleGenerate()} disabled={loading||!prompt.trim()}
            style={{ padding:'8px 16px', borderRadius:'8px', border:'none', background: loading ? T.border : `linear-gradient(135deg,${T.accent1},${T.accent2})`, color: loading ? T.textMuted : '#fff', fontSize:'12px', fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:"'Fira Code',monospace", whiteSpace:'nowrap', opacity: loading||!prompt.trim() ? 0.55 : 1, flexShrink:0 }}>
            {loading ? '⟳' : '→ Design'}
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0, flexWrap:'wrap' }}>
          {design && (
            <>
              {/* Regenerate */}
              {currentId && user && (
                <button className="icon-btn" onClick={handleRegenerate} disabled={regenLoading} title="Regenerate new version"
                  style={{ padding:'7px 10px', borderRadius:'7px', border:`1px solid ${T.border}`, background:'transparent', color:T.textMuted, fontSize:'12px', cursor:'pointer', fontFamily:"'Fira Code',monospace", whiteSpace:'nowrap' }}>
                  {regenLoading ? '⟳' : '↺'} New version
                </button>
              )}

              {/* Share */}
              <button className="icon-btn" onClick={handleShare} title="Share design" disabled={!user}
                style={{ padding:'7px 10px', borderRadius:'7px', border:`1px solid ${T.border}`, background:'transparent', color:T.textMuted, fontSize:'12px', cursor: user ? 'pointer' : 'not-allowed', fontFamily:"'Fira Code',monospace", opacity: user ? 1 : 0.45 }}>
                ⬡ Share
              </button>

              {/* PDF */}
              <button className="icon-btn" onClick={handlePDF} disabled={pdfLoading} title="Download PDF"
                style={{ padding:'7px 10px', borderRadius:'7px', border:`1px solid ${T.green}30`, background:`${T.green}08`, color:T.green, fontSize:'12px', cursor:'pointer', fontFamily:"'Fira Code',monospace", whiteSpace:'nowrap' }}>
                {pdfLoading ? '⟳' : '↓'} PDF
              </button>
            </>
          )}

          {/* Saved designs */}
          {user && (
            <button className="icon-btn" onClick={() => setShowSaved(true)} title="My saved designs"
              style={{ padding:'7px 10px', borderRadius:'7px', border:`1px solid ${T.border}`, background:'transparent', color:T.textMuted, fontSize:'12px', cursor:'pointer', fontFamily:"'Fira Code',monospace", whiteSpace:'nowrap' }}>
              ▣ Saved
            </button>
          )}

          {/* Auth */}
          {user ? (
            <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'5px 10px', borderRadius:'7px', border:`1px solid ${T.border}`, background:'rgba(91,163,201,0.05)' }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:`linear-gradient(135deg,${T.accent1},${T.accent2})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:'#fff', flexShrink:0 }}>
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <span style={{ fontSize:'12px', color:T.textSub, maxWidth:'80px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</span>
            </div>
          ) : (
            <button className="design-btn" onClick={() => setShowAuth(true)}
              style={{ padding:'7px 14px', borderRadius:'7px', border:`1px solid ${T.accent1}40`, background:`${T.accent1}12`, color:T.accent1, fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", whiteSpace:'nowrap' }}>
              Sign In
            </button>
          )}

          {/* Mobile panel toggle — only shows on small screens when a design exists */}
          {design && (
            <button className="panel-toggle-btn" onClick={() => setPanelOpen(o => !o)}
              style={{ padding:'8px 10px', borderRadius:'7px', border:`1px solid ${panelOpen ? T.accent1+'50' : T.border}`, background: panelOpen ? T.accent1+'12' : 'transparent', color: panelOpen ? T.accent1 : T.textMuted, fontSize:'16px', cursor:'pointer', flexShrink:0, lineHeight:1, transition:'all 0.2s' }}
              title="Toggle info panel">
              ⬡
            </button>
          )}
        </div>
      </header>

      {/* Chips */}
      <div className="chips-bar" style={{ padding:'7px 16px', borderBottom:`1px solid ${T.border}`, display:'flex', gap:'5px', flexWrap:'wrap', flexShrink:0, background:T.header }}>
        {!design && !loading && (
          <>
            <span style={{ fontSize:'11px', color:T.textMuted, fontFamily:"'Fira Code',monospace", alignSelf:'center', marginRight:'4px' }}>try:</span>
            {EXAMPLE_PROMPTS.map((p,i) => (
              <button key={p} className="app-chip"
                onClick={() => { setPrompt(p); handleGenerate(p); }}
                style={{ padding:'3px 10px', borderRadius:'20px', border:`1px solid ${T.chipBorder}`, background:T.chip, color:T.textMuted, fontSize:'11px', cursor:'pointer', fontFamily:"'Fira Code',monospace", animation:`fadeIn 0.3s ease ${i*0.04}s both` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=T.accent1+'50'; e.currentTarget.style.color=T.accent1; e.currentTarget.style.background=T.accent1+'12'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=T.chipBorder; e.currentTarget.style.color=T.textMuted; e.currentTarget.style.background=T.chip; }}
              >{p}</button>
            ))}
          </>
        )}
        {design && (
          <div style={{ display:'flex', alignItems:'center', gap:'8px', animation:'fadeIn 0.3s ease both' }}>
            <span style={{ fontSize:'13px', fontWeight:600, color:T.text, letterSpacing:'-0.01em' }}>{design.title}</span>
            <span style={{ fontSize:'10px', color:T.textMuted, fontFamily:"'Fira Code',monospace" }}>{nodes.length} nodes · {edges.length} edges</span>
          </div>
        )}
      </div>

      {/* Mobile panel backdrop */}
      {panelOpen && <div className="panel-backdrop" onClick={() => setPanelOpen(false)} />}

      {/* MAIN */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', position:'relative' }}>

        {/* CANVAS */}
        <div style={{ flex:1, position:'relative' }}>
          {!design && !loading && !error && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:5, pointerEvents:'none', animation:'fadeIn 0.5s ease both', padding:'20px', textAlign:'center' }}>
              <div style={{ fontSize:'64px', color:T.emptyIcon, marginBottom:'14px', lineHeight:1, animation:'softPulse 4s ease-in-out infinite' }}>⬡</div>
              <div style={{ fontSize:'15px', fontWeight:600, color:T.emptyIcon, fontFamily:"'Fira Code',monospace" }}>Enter a system to design</div>
              <div style={{ fontSize:'11px', color:T.emptyIcon, marginTop:'6px', opacity:0.6, fontFamily:"'Fira Code',monospace" }}>Click any node to explore · Drag to rearrange · Connect nodes manually</div>
              {!user && <div style={{ marginTop:'12px', fontSize:'11px', color:T.accent1, opacity:0.7, fontFamily:"'Fira Code',monospace" }}>Sign in to save & share your designs</div>}
            </div>
          )}

          {loading && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:10, background:'rgba(8,12,20,0.86)', backdropFilter:'blur(6px)', animation:'fadeIn 0.3s ease both' }}>
              <div style={{ position:'relative', marginBottom:'20px' }}>
                <div style={{ fontSize:'38px', animation:'spin 2s linear infinite', color:T.accent1 }}>⬡</div>
                <div style={{ position:'absolute', inset:-10, border:`1px solid ${T.accent1}25`, borderRadius:'50%', animation:'spin 3.5s linear reverse infinite' }} />
              </div>
              <div style={{ fontSize:'14px', fontFamily:"'Fira Code',monospace", color:T.accent1, fontWeight:500, marginBottom:'6px' }}>Architecting your system...</div>
              <div style={{ fontSize:'11px', color:T.textMuted }}>This may take 15–20 seconds</div>
              <div style={{ marginTop:'20px', width:'140px', height:'2px', background:'rgba(91,163,201,0.12)', borderRadius:'1px', overflow:'hidden' }}>
                <div style={{ height:'100%', background:`linear-gradient(90deg,transparent,${T.accent1},${T.accent2},transparent)`, backgroundSize:'50% 100%', animation:'loadBar 1.4s linear infinite' }} />
              </div>
            </div>
          )}

          {error && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:10, animation:'fadeIn 0.3s ease both', padding:'16px' }}>
              <div style={{ background:'rgba(18,8,8,0.96)', border:'1px solid rgba(196,96,96,0.3)', borderRadius:'16px', padding:'28px 32px', maxWidth:'340px', width:'100%', textAlign:'center', animation:'slideUp 0.4s ease both' }}>
                <div style={{ fontSize:'28px', marginBottom:'10px' }}>⚠</div>
                <div style={{ color:'#C46060', fontFamily:"'Fira Code',monospace", fontSize:'10px', marginBottom:'7px', letterSpacing:'0.1em', textTransform:'uppercase' }}>Error</div>
                <div style={{ color:T.textSub, fontSize:'13px', lineHeight:1.65 }}>{error}</div>
                <button className="dismiss-btn" onClick={() => setError('')} style={{ marginTop:'16px', padding:'7px 20px', borderRadius:'7px', border:'1px solid rgba(196,96,96,0.35)', background:'transparent', color:'#C46060', cursor:'pointer', fontSize:'12px', fontFamily:"'Fira Code',monospace" }}>Dismiss</button>
              </div>
            </div>
          )}

          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setTooltip({ label:node.data.label, type:node.data.type, description:node.data.description })}
            nodeTypes={nodeTypes}
            fitView fitViewOptions={{ padding:0.22 }}
            minZoom={0.25} maxZoom={2.5}
            style={{ background:T.canvasBg }}
          >
            <Background variant={BackgroundVariant.Dots} gap={30} size={1.2} color={T.dot} />
            <Controls
              style={{ background:T.panel, border:`1px solid ${T.border}`, borderRadius:'12px', overflow:'hidden', boxShadow:'0 4px 18px rgba(0,0,0,0.22)' }}
              buttonStyle={{ background:T.panel, border:'none', color:T.textMuted, borderBottom:`1px solid ${T.border}`, height:'28px', width:'28px' }}
            />
            <MiniMap
              style={{ background:T.panel, border:`1px solid ${T.border}`, borderRadius:'12px' }}
              nodeColor={n => NODE_TYPES[n.data?.type]?.color || T.textMuted}
              maskColor="rgba(8,12,20,0.7)"
            />
          </ReactFlow>
        </div>

        {/* RIGHT PANEL */}
        {design && (
          <div className={`right-panel${panelOpen ? ' open' : ''}`} style={{ width:'282px', borderLeft:`1px solid ${T.panelBorder}`, background:T.panel, display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0, opacity: panelIn ? 1 : 0, transition:'opacity 0.45s ease' }}>

            {/* Tab bar */}
            <div style={{ display:'flex', borderBottom:`1px solid ${T.panelBorder}`, flexShrink:0, alignItems:'center' }}>
              {PANEL_TABS.map(tab => (
                <button key={tab} className="tab-btn" onClick={() => setPanelTab(tab)}
                  style={{ flex:1, padding:'11px 6px', background:'none', border:'none', borderBottom: panelTab===tab ? `2px solid ${T.accent1}` : '2px solid transparent', color: panelTab===tab ? T.accent1 : T.textMuted, fontSize:'11px', fontWeight: panelTab===tab ? 700 : 500, cursor:'pointer', fontFamily:"'Fira Code',monospace", letterSpacing:'0.04em', textTransform:'uppercase', transition:'color 0.18s, border-color 0.18s' }}>
                  {tab}
                </button>
              ))}
              {/* Mobile close button */}
              <button className="panel-close-btn" onClick={() => setPanelOpen(false)}
                style={{ padding:'8px 14px', background:'none', border:'none', borderLeft:`1px solid ${T.panelBorder}`, color:T.textMuted, fontSize:'18px', cursor:'pointer', flexShrink:0, lineHeight:1 }}>
                ✕
              </button>
            </div>

            {/* Tab: Info */}
            {panelTab === 'Info' && (
              <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column' }}>
                <div className="panel-row" style={{ padding:'14px 16px', borderBottom:`1px solid ${T.panelBorder}`, animation:'slideRight 0.45s ease 0.08s both' }}>
                  <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.accent1, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'7px', display:'flex', alignItems:'center', gap:'5px' }}>
                    <div style={{ width:3, height:3, borderRadius:'50%', background:T.accent1 }} /> Overview
                  </div>
                  <p style={{ fontSize:'12px', color:T.textSub, lineHeight:1.65, margin:0 }}>{design.description}</p>
                </div>

                <div style={{ padding:'10px 16px', borderBottom:`1px solid ${T.panelBorder}` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'7px', padding:'8px 10px', background:'rgba(91,163,201,0.05)', border:'1px solid rgba(91,163,201,0.1)', borderRadius:'8px' }}>
                    <span style={{ fontSize:'13px', color:T.accent1, opacity:0.7 }}>⬡</span>
                    <span style={{ fontSize:'11px', color:T.textMuted, fontFamily:"'Fira Code',monospace", lineHeight:1.5 }}>Click a node · Drag to rearrange · Draw edges</span>
                  </div>
                </div>

                {design.keyDecisions?.length > 0 && (
                  <div className="panel-row" style={{ padding:'13px 16px', flex:1, animation:'slideRight 0.45s ease 0.16s both' }}>
                    <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.accent1, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'9px', display:'flex', alignItems:'center', gap:'5px' }}>
                      <div style={{ width:3, height:3, borderRadius:'50%', background:T.accent1 }} /> Design Decisions
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                      {design.keyDecisions.map((d,i) => (
                        <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', animation:`slideRight 0.4s ease ${0.2+i*0.06}s both` }}>
                          <span style={{ color:T.accent1, fontFamily:"'Fira Code',monospace", fontSize:'10px', marginTop:'2px', flexShrink:0, opacity:0.6 }}>0{i+1}</span>
                          <span style={{ fontSize:'12px', color:T.textSub, lineHeight:1.62 }}>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div style={{ padding:'11px 16px', borderTop:`1px solid ${T.panelBorder}`, animation:'slideRight 0.45s ease 0.25s both', flexShrink:0 }}>
                  <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.accent1, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'9px', display:'flex', alignItems:'center', gap:'5px' }}>
                    <div style={{ width:3, height:3, borderRadius:'50%', background:T.accent1 }} /> Legend
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px' }}>
                    {legendEntries.map(({type,cfg}) => (
                      <div key={type} className="legend-row" style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                        <span style={{ color:cfg.color, fontSize:'10px' }}>{cfg.icon}</span>
                        <span style={{ fontSize:'11px', color:T.textSub, textTransform:'capitalize', fontFamily:"'Fira Code',monospace" }}>{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Estimate */}
            {panelTab === 'Estimate' && (
              <div style={{ flex:1, overflowY:'auto' }}>
                {estimate
                  ? <EstimatorPanel estimate={estimate} />
                  : <div style={{ padding:'32px 16px', textAlign:'center', color:T.textMuted, fontFamily:"'Fira Code',monospace", fontSize:'12px' }}>No estimate available</div>}
              </div>
            )}

            {/* Tab: History / Share */}
            {panelTab === 'History' && (
              <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:'10px' }}>
                {/* Share section */}
                <div>
                  <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.accent1, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'9px', display:'flex', alignItems:'center', gap:'5px' }}>
                    <div style={{ width:3, height:3, borderRadius:'50%', background:T.accent1 }} /> Share
                  </div>
                  {user && currentId ? (
                    <button onClick={handleShare} style={{ width:'100%', padding:'9px', borderRadius:'8px', border:`1px solid ${T.accent1}35`, background:`${T.accent1}0A`, color:T.accent1, fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:"'Fira Code',monospace" }}>
                      Generate Share Link →
                    </button>
                  ) : (
                    <div style={{ fontSize:'12px', color:T.textMuted, background:'rgba(91,163,201,0.04)', border:`1px solid ${T.border}`, borderRadius:'8px', padding:'10px 12px', lineHeight:1.6 }}>
                      {!user ? 'Sign in to share designs.' : 'Generate a design to share it.'}
                    </div>
                  )}
                </div>

                {/* Regenerate section */}
                <div>
                  <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.accent1, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'9px', display:'flex', alignItems:'center', gap:'5px' }}>
                    <div style={{ width:3, height:3, borderRadius:'50%', background:T.accent1 }} /> Versions
                  </div>
                  {user && currentId ? (
                    <button onClick={handleRegenerate} disabled={regenLoading} style={{ width:'100%', padding:'9px', borderRadius:'8px', border:`1px solid ${T.accent2}35`, background:`${T.accent2}0A`, color:T.accent2, fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:"'Fira Code',monospace", opacity: regenLoading ? 0.6 : 1 }}>
                      {regenLoading ? 'Regenerating...' : '↺ Regenerate New Version'}
                    </button>
                  ) : (
                    <div style={{ fontSize:'12px', color:T.textMuted, background:'rgba(91,163,201,0.04)', border:`1px solid ${T.border}`, borderRadius:'8px', padding:'10px 12px', lineHeight:1.6 }}>
                      {!user ? 'Sign in to save versions.' : 'Design something first.'}
                    </div>
                  )}
                </div>

                {/* View all saved */}
                {user && (
                  <button onClick={() => setShowSaved(true)} style={{ width:'100%', padding:'9px', borderRadius:'8px', border:`1px solid ${T.border}`, background:'transparent', color:T.textMuted, fontSize:'12px', cursor:'pointer', fontFamily:"'Fira Code',monospace" }}>
                    ▣ View All Saved Designs
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
