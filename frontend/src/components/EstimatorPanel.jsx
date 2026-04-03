import React from 'react';
import { motion } from 'framer-motion';

const T = {
  border:'rgba(91,163,201,0.15)', text:'#E4EBF5', textSub:'#A0B4C8',
  textMuted:'#738A9F', accent1:'#5BA3C9', accent2:'#8B7EC8',
  green:'#4FA882', yellow:'#C49A3C', red:'#E07A7A',
};

const scoreColor = (score) => score >= 85 ? T.green : score >= 70 ? T.yellow : T.red;

export default function EstimatorPanel({ estimate }) {
  if (!estimate) return null;
  const { components, totalMonthlyCost, criticalPathLatencyMs, criticalPath, scalabilityScore, scalabilityLabel } = estimate;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display:'flex', flexDirection:'column', gap:0, padding:'20px' }}>
      
      <div style={{ fontSize:'11px', fontFamily:"'Fira Code',monospace", color:T.accent1, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'16px', fontWeight:600 }}>Metrics Dashboard</div>
      
      {/* Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px' }}>
        {[
          { label:'Monthly Cost', value:`$${totalMonthlyCost}`, color:T.green },
          { label:'Critical Path', value:`${criticalPathLatencyMs}ms`, color:T.accent1 },
        ].map(item => (
          <motion.div key={item.label} whileHover={{ y: -2 }} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${T.border}`, borderRadius:'12px', padding:'16px', boxShadow:'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize:'24px', fontWeight:800, color:item.color, letterSpacing:'-0.03em', lineHeight:1, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{item.value}</div>
            <div style={{ fontSize:'11px', color:T.textMuted, fontFamily:"'Fira Code',monospace", marginTop:'8px', fontWeight:500 }}>{item.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Scalability Bar */}
      <div style={{ marginBottom:'24px', background:'rgba(255,255,255,0.02)', padding:'16px', borderRadius:'12px', border:`1px solid ${T.border}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
          <span style={{ fontSize:'11px', color:T.textMuted, fontFamily:"'Fira Code',monospace", textTransform:'uppercase', letterSpacing:'0.1em' }}>Scalability</span>
          <span style={{ fontSize:'12px', fontWeight:700, color:scoreColor(scalabilityScore), fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{scalabilityScore}/100 — {scalabilityLabel}</span>
        </div>
        <div style={{ height:6, background:'rgba(0,0,0,0.4)', borderRadius:'3px', overflow:'hidden', boxShadow:'inset 0 1px 2px rgba(0,0,0,0.5)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${scalabilityScore}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ height:'100%', background:`linear-gradient(90deg, ${T.accent1}, ${scoreColor(scalabilityScore)})`, borderRadius:'3px' }} />
        </div>
      </div>

      {/* Critical path logic */}
      {criticalPath.length > 0 && (
        <div style={{ marginBottom:'24px' }}>
          <div style={{ fontSize:'11px', fontFamily:"'Fira Code',monospace", color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'12px' }}>Critical Path Flow</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', alignItems:'center' }}>
            {criticalPath.map((node, i) => (
              <React.Fragment key={i}>
                <span style={{ fontSize:'12px', color:T.text, background:'rgba(91,163,201,0.1)', border:`1px solid ${T.accent1}40`, padding:'4px 10px', borderRadius:'6px', fontFamily:"'Fira Code',monospace", fontWeight:500 }}>{node}</span>
                {i < criticalPath.length - 1 && <span style={{ color:T.accent1, fontSize:'14px', opacity:0.6 }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div>
        <div style={{ fontSize:'11px', fontFamily:"'Fira Code',monospace", color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'12px' }}>Cost Breakdown</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {[...components].sort((a,b) => b.monthlyCost - a.monthlyCost).map((c, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px', background:'rgba(255,255,255,0.02)', borderRadius:'8px', border:`1px solid transparent` }}>
              <span style={{ fontSize:'13px', color:T.text, flex:1, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:500 }}>{c.label}</span>
              <span style={{ fontSize:'11px', color:T.accent1, fontFamily:"'Fira Code',monospace" }}>{c.latencyMs}ms</span>
              <span style={{ fontSize:'12px', color:T.green, fontFamily:"'Fira Code',monospace", fontWeight:600 }}>${c.monthlyCost}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}