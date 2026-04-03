import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMyDesigns, deleteDesign, fetchVersions } from '../services/api';

const T = {
  bg:'#080C14', panel:'rgba(12,18,32,0.95)', border:'rgba(91,163,201,0.15)',
  text:'#E4EBF5', textSub:'#A0B4C8', textMuted:'#738A9F',
  accent1:'#5BA3C9', accent2:'#8B7EC8', green:'#4FA882', red:'#E07A7A',
};

export default function SavedDesigns({ onLoadDesign, onClose }) {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [versions, setVersions] = useState({});
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchMyDesigns().then(res => setDesigns(res.data.designs)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this design and all its versions?')) return;
    setDeleting(id);
    try {
      await deleteDesign(id);
      setDesigns(d => d.filter(x => x._id !== id));
    } catch (err) { alert('Delete failed'); } 
    finally { setDeleting(null); }
  };

  const toggleVersions = async (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!versions[id]) {
      const res = await fetchVersions(id);
      setVersions(v => ({ ...v, [id]: res.data.versions }));
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });

  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, display:'flex', justifyContent:'flex-end' }}>
      {/* Backdrop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)' }} />

      {/* Modal Panel */}
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }} 
        style={{ width:'min(500px, 100vw)', height:'100vh', background:T.panel, backdropFilter:'blur(24px)', borderLeft:`1px solid ${T.border}`, display:'flex', flexDirection:'column', position:'relative', zIndex:301, boxShadow:'-20px 0 60px rgba(0,0,0,0.5)' }}>
        
        {/* Header */}
        <div style={{ padding:'24px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:'20px', fontWeight:800, color:T.text, fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-0.02em' }}>Saved Designs</div>
            <div style={{ fontSize:'12px', color:T.textMuted, marginTop:'4px', fontFamily:"'Fira Code',monospace" }}>{designs.length} total projects</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${T.border}`, borderRadius:'8px', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:T.text, cursor:'pointer' }}>✕</button>
        </div>

        {/* List */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px' }}>
          {loading && <div style={{ textAlign:'center', padding:'40px', color:T.accent1, fontFamily:"'Fira Code',monospace", fontSize:'14px' }}>Loading...</div>}
          
          {!loading && designs.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:'64px', color:T.textMuted, opacity:0.3, marginBottom:'16px' }}>⬡</div>
              <div style={{ color:T.text, fontSize:'16px', fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>No saved designs yet</div>
            </motion.div>
          )}

          <AnimatePresence>
            {designs.map((d, i) => (
              <motion.div key={d._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }} 
                style={{ marginBottom:'12px', background: expanded === d._id ? 'rgba(91,163,201,0.08)' : 'rgba(255,255,255,0.02)', border:`1px solid ${expanded === d._id ? T.accent1+'40' : T.border}`, borderRadius:'16px', padding:'20px', overflow:'hidden' }}>
                
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'16px' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'16px', fontWeight:700, color:T.text, marginBottom:'4px', fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.title}</div>
                    <div style={{ fontSize:'12px', color:T.textSub, fontFamily:"'Fira Code',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.prompt}</div>
                    <div style={{ display:'flex', gap:'12px', marginTop:'12px', alignItems:'center' }}>
                      <span style={{ fontSize:'11px', color:T.textMuted, fontFamily:"'Fira Code',monospace" }}>{formatDate(d.createdAt)}</span>
                      {d.isPublic && <span style={{ fontSize:'10px', background:`${T.green}20`, color:T.green, padding:'2px 8px', borderRadius:'6px', fontFamily:"'Fira Code',monospace", fontWeight:600 }}>Shared</span>}
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => onLoadDesign(d._id)} style={{ padding:'8px 16px', borderRadius:'8px', border:`1px solid ${T.accent1}`, background:`${T.accent1}15`, color:T.accent1, fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Load</motion.button>
                    <motion.button whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }} onClick={() => toggleVersions(d._id)} style={{ padding:'8px 12px', borderRadius:'8px', border:`1px solid ${T.border}`, background:'transparent', color:T.text, fontSize:'12px', cursor:'pointer' }}>{expanded === d._id ? '▲' : '▼'}</motion.button>
                    <motion.button whileHover={{ backgroundColor: `${T.red}15` }} onClick={() => handleDelete(d._id)} disabled={deleting === d._id} style={{ padding:'8px 12px', borderRadius:'8px', border:`1px solid ${T.red}40`, background:'transparent', color:T.red, fontSize:'12px', cursor:'pointer' }}>✕</motion.button>
                  </div>
                </div>

                <AnimatePresence>
                  {expanded === d._id && versions[d._id] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ marginTop:'16px', borderTop:`1px solid ${T.border}`, paddingTop:'16px' }}>
                      <div style={{ fontSize:'10px', color:T.accent1, fontFamily:"'Fira Code',monospace", textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'12px', fontWeight:600 }}>Versions ({versions[d._id].length})</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                        {versions[d._id].map((v) => (
                          <div key={v._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'rgba(0,0,0,0.3)', borderRadius:'10px', border:`1px solid ${T.border}` }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                              <span style={{ fontSize:'11px', background:`${T.accent2}20`, color:T.accent2, padding:'2px 8px', borderRadius:'6px', fontFamily:"'Fira Code',monospace", fontWeight:600 }}>v{v.version}</span>
                              <span style={{ fontSize:'12px', color:T.textSub, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{formatDate(v.createdAt)}</span>
                            </div>
                            <button onClick={() => onLoadDesign(v._id)} style={{ padding:'6px 12px', borderRadius:'6px', border:`1px solid ${T.accent1}40`, background:`${T.accent1}10`, color:T.accent1, fontSize:'12px', cursor:'pointer', fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Load</button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}