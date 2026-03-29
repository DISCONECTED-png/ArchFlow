import { useEffect, useState } from 'react';
import { fetchMyDesigns, deleteDesign, fetchVersions } from '../services/api';

const T = {
  bg:'#080C14', panel:'#0B1020', border:'rgba(91,163,201,0.11)',
  text:'#E4EBF5', textSub:'#8FA5BC', textMuted:'#5E7A96',
  accent1:'#5BA3C9', accent2:'#8B7EC8', green:'#4FA882', red:'#C46060',
};

export default function SavedDesigns({ onLoadDesign, onClose }) {
  const [designs,  setDesigns]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [versions, setVersions] = useState({});
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchMyDesigns()
      .then(res => setDesigns(res.data.designs))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this design and all its versions?')) return;
    setDeleting(id);
    try {
      await deleteDesign(id);
      setDesigns(d => d.filter(x => x._id !== id));
    } catch (err) {
      alert('Delete failed');
    } finally {
      setDeleting(null);
    }
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
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'flex-start', justifyContent:'flex-end', background:'rgba(8,12,20,0.65)', backdropFilter:'blur(4px)', animation:'fadeIn 0.2s ease both' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:'min(480px,100vw)', height:'100vh', background:T.panel, borderLeft:`1px solid ${T.border}`, display:'flex', flexDirection:'column', animation:'slideRight 0.3s cubic-bezier(0.16,1,0.3,1) both', boxShadow:'-8px 0 40px rgba(0,0,0,0.4)' }}>

        {/* Header */}
        <div style={{ padding:'20px 20px 16px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:'16px', fontWeight:700, color:T.text, letterSpacing:'-0.01em' }}>Saved Designs</div>
            <div style={{ fontSize:'12px', color:T.textMuted, marginTop:'2px', fontFamily:"'Fira Code',monospace" }}>{designs.length} total</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.textMuted, fontSize:'18px', cursor:'pointer', opacity:0.6 }}
            onMouseEnter={e => e.currentTarget.style.opacity='1'} onMouseLeave={e => e.currentTarget.style.opacity='0.6'}>✕</button>
        </div>

        {/* List */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 16px' }}>
          {loading && (
            <div style={{ textAlign:'center', padding:'40px', color:T.textMuted, fontFamily:"'Fira Code',monospace", fontSize:'13px' }}>Loading...</div>
          )}
          {!loading && designs.length === 0 && (
            <div style={{ textAlign:'center', padding:'48px 20px' }}>
              <div style={{ fontSize:'40px', marginBottom:'12px', opacity:0.3 }}>⬡</div>
              <div style={{ color:T.textMuted, fontSize:'14px', fontWeight:600 }}>No saved designs yet</div>
              <div style={{ color:T.textFaint || T.textMuted, fontSize:'12px', marginTop:'4px' }}>Generate a design while signed in to save it</div>
            </div>
          )}

          {designs.map(d => (
            <div key={d._id} style={{ marginBottom:'8px' }}>
              <div style={{ background: expanded === d._id ? 'rgba(91,163,201,0.06)' : 'rgba(12,18,30,0.6)', border:`1px solid ${expanded === d._id ? T.accent1+'30' : T.border}`, borderRadius:'12px', padding:'14px 16px', transition:'all 0.2s' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'10px' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'14px', fontWeight:600, color:T.text, marginBottom:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.title}</div>
                    <div style={{ fontSize:'12px', color:T.textMuted, fontFamily:"'Fira Code',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.prompt}</div>
                    <div style={{ display:'flex', gap:'8px', marginTop:'6px', alignItems:'center' }}>
                      <span style={{ fontSize:'11px', color:T.textMuted }}>{formatDate(d.createdAt)}</span>
                      {d.isPublic && <span style={{ fontSize:'10px', background:`${T.green}15`, color:T.green, padding:'1px 7px', borderRadius:'4px', fontFamily:"'Fira Code',monospace" }}>shared</span>}
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                    <button onClick={() => onLoadDesign(d._id)} style={{ padding:'6px 12px', borderRadius:'7px', border:`1px solid ${T.accent1}40`, background:`${T.accent1}10`, color:T.accent1, fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:"'Fira Code',monospace", whiteSpace:'nowrap' }}>
                      Load
                    </button>
                    <button onClick={() => toggleVersions(d._id)} style={{ padding:'6px 10px', borderRadius:'7px', border:`1px solid ${T.border}`, background:'transparent', color:T.textMuted, fontSize:'11px', cursor:'pointer', fontFamily:"'Fira Code',monospace" }}>
                      {expanded === d._id ? '▲' : '▼'}
                    </button>
                    <button onClick={() => handleDelete(d._id)} disabled={deleting === d._id} style={{ padding:'6px 10px', borderRadius:'7px', border:`1px solid rgba(196,96,96,0.25)`, background:'transparent', color:T.red, fontSize:'11px', cursor:'pointer', opacity: deleting === d._id ? 0.5 : 1 }}>
                      ✕
                    </button>
                  </div>
                </div>

                {/* Versions dropdown */}
                {expanded === d._id && versions[d._id] && (
                  <div style={{ marginTop:'12px', borderTop:`1px solid ${T.border}`, paddingTop:'10px' }}>
                    <div style={{ fontSize:'10px', color:T.accent1, fontFamily:"'Fira Code',monospace", textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'7px' }}>Versions ({versions[d._id].length})</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                      {versions[d._id].map((v, i) => (
                        <div key={v._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 10px', background:'rgba(8,12,20,0.5)', borderRadius:'7px', border:`1px solid ${T.border}` }}>
                          <div>
                            <span style={{ fontSize:'11px', background:`${T.accent2}15`, color:T.accent2, padding:'1px 7px', borderRadius:'4px', fontFamily:"'Fira Code',monospace", marginRight:'8px' }}>v{v.version}</span>
                            <span style={{ fontSize:'12px', color:T.textSub }}>{formatDate(v.createdAt)}</span>
                          </div>
                          <button onClick={() => onLoadDesign(v._id)} style={{ padding:'4px 10px', borderRadius:'6px', border:`1px solid ${T.accent1}30`, background:`${T.accent1}0A`, color:T.accent1, fontSize:'11px', cursor:'pointer', fontFamily:"'Fira Code',monospace" }}>
                            Load
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(91,163,201,0.18);border-radius:2px}
      `}</style>
    </div>
  );
}
