const T = {
  border:'rgba(91,163,201,0.08)', text:'#E4EBF5', textSub:'#8FA5BC',
  textMuted:'#5E7A96', accent1:'#5BA3C9', accent2:'#8B7EC8',
  green:'#4FA882', yellow:'#C49A3C', red:'#C46060',
};

const scoreColor = (score) =>
  score >= 85 ? T.green : score >= 70 ? T.yellow : T.red;

export default function EstimatorPanel({ estimate }) {
  if (!estimate) return null;

  const { components, totalMonthlyCost, criticalPathLatencyMs, criticalPath, scalabilityScore, scalabilityLabel } = estimate;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>

      {/* Summary stats */}
      <div style={{ padding:'14px 16px', borderBottom:`1px solid ${T.border}` }}>
        <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.accent1, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'11px', display:'flex', alignItems:'center', gap:'5px' }}>
          <div style={{ width:3, height:3, borderRadius:'50%', background:T.accent1 }} /> Estimates
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          {[
            { label:'Monthly Cost', value:`$${totalMonthlyCost}`, color:T.green, sub:'/month' },
            { label:'Critical Path', value:`${criticalPathLatencyMs}ms`, color:T.accent1, sub:'latency' },
          ].map(item => (
            <div key={item.label} style={{ background:'rgba(91,163,201,0.05)', border:`1px solid rgba(91,163,201,0.1)`, borderRadius:'9px', padding:'10px' }}>
              <div style={{ fontSize:'18px', fontWeight:800, color:item.color, letterSpacing:'-0.03em', lineHeight:1 }}>{item.value}</div>
              <div style={{ fontSize:'10px', color:T.textMuted, fontFamily:"'Fira Code',monospace", marginTop:'3px' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Scalability score bar */}
        <div style={{ marginTop:'10px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' }}>
            <span style={{ fontSize:'10px', color:T.textMuted, fontFamily:"'Fira Code',monospace", textTransform:'uppercase', letterSpacing:'0.08em' }}>Scalability</span>
            <span style={{ fontSize:'11px', fontWeight:700, color:scoreColor(scalabilityScore), fontFamily:"'Fira Code',monospace" }}>{scalabilityScore}/100 — {scalabilityLabel}</span>
          </div>
          <div style={{ height:4, background:'rgba(91,163,201,0.1)', borderRadius:'2px', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${scalabilityScore}%`, background:`linear-gradient(90deg,${T.accent1},${scoreColor(scalabilityScore)})`, borderRadius:'2px', transition:'width 1s ease' }} />
          </div>
        </div>
      </div>

      {/* Critical path */}
      {criticalPath.length > 0 && (
        <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.border}` }}>
          <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.accent1, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'8px' }}>Critical Path</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', alignItems:'center' }}>
            {criticalPath.map((node, i) => (
              <span key={i} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                <span style={{ fontSize:'11px', color:T.textSub, background:'rgba(91,163,201,0.07)', border:'1px solid rgba(91,163,201,0.12)', padding:'2px 7px', borderRadius:'4px', fontFamily:"'Fira Code',monospace" }}>{node}</span>
                {i < criticalPath.length - 1 && <span style={{ color:T.accent1, fontSize:'10px', opacity:0.5 }}>→</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Per-component breakdown */}
      <div style={{ padding:'12px 16px' }}>
        <div style={{ fontSize:'10px', fontFamily:"'Fira Code',monospace", color:T.accent1, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'8px' }}>Component Costs</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
          {[...components].sort((a,b) => b.monthlyCost - a.monthlyCost).map((c, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontSize:'11px', color:T.textSub, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{c.label}</span>
              <span style={{ fontSize:'10px', color:T.accent1, fontFamily:"'Fira Code',monospace", flexShrink:0 }}>{c.latencyMs}ms</span>
              <span style={{ fontSize:'11px', color:T.green, fontFamily:"'Fira Code',monospace", flexShrink:0, minWidth:'44px', textAlign:'right' }}>${c.monthlyCost}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop:`1px solid rgba(91,163,201,0.08)`, marginTop:'8px', paddingTop:'8px', display:'flex', justifyContent:'space-between', fontSize:'12px', fontWeight:700 }}>
          <span style={{ color:T.textMuted, fontFamily:"'Fira Code',monospace" }}>Total</span>
          <span style={{ color:T.green, fontFamily:"'Fira Code',monospace" }}>${totalMonthlyCost}/mo</span>
        </div>
      </div>
    </div>
  );
}
