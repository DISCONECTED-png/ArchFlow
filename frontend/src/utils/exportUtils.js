import { NODE_TYPES } from '../nodeConfig';

const NODE_INFO = {
  client:   { role:'Entry Point',      tech:'iOS/Android, Web browser, CLI' },
  gateway:  { role:'Traffic Router',   tech:'AWS API Gateway, Nginx, Kong' },
  service:  { role:'Business Logic',   tech:'Node.js, Go, Spring Boot' },
  cache:    { role:'Fast Storage',     tech:'Redis, Memcached, Varnish' },
  database: { role:'Persistent Store', tech:'PostgreSQL, MySQL, Cassandra' },
  queue:    { role:'Async Bridge',     tech:'Kafka, RabbitMQ, AWS SQS' },
  storage:  { role:'Object Store',     tech:'AWS S3, GCS, MinIO' },
  cdn:      { role:'Edge Cache',       tech:'CloudFront, Fastly, Cloudflare' },
  monitor:  { role:'Observability',    tech:'Prometheus, Grafana, Datadog' },
};

// ── PNG Export using React Flow's built-in toPng ──────────────────────────────
export const exportToPNG = async (reactFlowInstance) => {
  try {
    const { toPng } = await import('@xyflow/react');
    const dataUrl = await toPng(document.querySelector('.react-flow__viewport'), {
      backgroundColor: '#080C14',
      width: 2000,
      height: 1200,
    });
    const link = document.createElement('a');
    link.download = 'archflow-diagram.png';
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('PNG export failed:', err);
    alert('PNG export failed. Try again.');
  }
};

// ── SVG diagram builder for PDF ───────────────────────────────────────────────
export const buildDiagramSVG = (nodes, edges) => {
  if (!nodes.length) return '';
  const xs = nodes.map(n => n.position?.x || 0);
  const ys = nodes.map(n => n.position?.y || 0);
  const minX = Math.min(...xs) - 20;
  const minY = Math.min(...ys) - 20;
  const maxX = Math.max(...xs) + 220;
  const maxY = Math.max(...ys) + 130;
  const W = maxX - minX;
  const H = maxY - minY;
  const scale = Math.min(860 / W, 480 / H, 1);
  const svgW = (W * scale).toFixed(0);
  const svgH = (H * scale).toFixed(0);

  const colorOf = t => NODE_TYPES[t]?.color || '#8FA5BC';
  const iconOf  = t => NODE_TYPES[t]?.icon  || '◉';

  const edgeSvg = edges.map(e => {
    const src = nodes.find(n => n.id === e.source);
    const tgt = nodes.find(n => n.id === e.target);
    if (!src || !tgt) return '';
    const x1 = ((src.position.x + 100 - minX) * scale).toFixed(1);
    const y1 = ((src.position.y +  60 - minY) * scale).toFixed(1);
    const x2 = ((tgt.position.x + 100 - minX) * scale).toFixed(1);
    const y2 = ((tgt.position.y +  60 - minY) * scale).toFixed(1);
    const mx = (((+x1) + (+x2)) / 2).toFixed(1);
    const my = (((+y1) + (+y2)) / 2).toFixed(1);
    const color = colorOf(src.data?.type);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.2" stroke-opacity="0.35" stroke-dasharray="5 4"/>
            <circle cx="${mx}" cy="${my}" r="2.5" fill="${color}" opacity="0.5"/>`;
  }).join('\n');

  const nodeSvg = nodes.map(n => {
    const x   = ((n.position?.x - minX) * scale).toFixed(1);
    const y   = ((n.position?.y - minY) * scale).toFixed(1);
    const nw  = (200 * scale).toFixed(1);
    const nh  = (100 * scale).toFixed(1);
    const r   = (10  * scale).toFixed(1);
    const color = colorOf(n.data?.type);
    const icon  = iconOf(n.data?.type);
    const label = (n.data?.label || '').replace(/&/g,'&amp;').replace(/</g,'&lt;');
    const type  = (n.data?.type  || '').replace(/&/g,'&amp;');
    const fs1   = Math.max(9,  Math.round(13 * scale));
    const fs2   = Math.max(7,  Math.round(10 * scale));
    const fs3   = Math.max(14, Math.round(18 * scale));
    const px    = (+x + +nw / 2).toFixed(1);
    const ty    = (+y + +nh * 0.38).toFixed(1);
    const ly    = (+y + +nh * 0.63).toFixed(1);
    const subY  = (+y + +nh * 0.82).toFixed(1);
    return `
      <rect x="${x}" y="${y}" width="${nw}" height="${nh}" rx="${r}" fill="#0C1220" stroke="${color}" stroke-width="1.2" stroke-opacity="0.55"/>
      <rect x="${x}" y="${y}" width="${nw}" height="${(+nh*0.28).toFixed(1)}" rx="${r}" fill="${color}" fill-opacity="0.1"/>
      <text x="${px}" y="${ty}" text-anchor="middle" font-family="monospace" font-size="${fs3}" fill="${color}">${icon}</text>
      <text x="${px}" y="${ly}" text-anchor="middle" font-family="sans-serif" font-size="${fs1}" font-weight="600" fill="#E4EBF5">${label}</text>
      <text x="${px}" y="${subY}" text-anchor="middle" font-family="monospace" font-size="${fs2}" fill="${color}" opacity="0.7">${type}</text>`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="background:#080C14;border-radius:12px;display:block;max-width:100%">
    <defs><pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="rgba(91,163,201,0.12)"/></pattern></defs>
    <rect width="100%" height="100%" fill="url(#dots)"/>
    ${edgeSvg}${nodeSvg}
  </svg>`;
};

// ── PDF Download ──────────────────────────────────────────────────────────────
export const downloadPDF = (design, nodes, edges, estimate) => {
  const w = window.open('', '_blank');
  if (!w) { alert('Allow popups to download PDF'); return; }

  const componentRows = nodes.map(n => {
    const cfg   = NODE_TYPES[n.data?.type] || {};
    const info  = NODE_INFO[n.data?.type]  || {};
    const color = cfg.color || '#8FA5BC';
    const comp  = estimate?.components?.find(c => c.id === n.id);
    return `<tr>
      <td><span style="color:${color};font-size:15px">${cfg.icon||'◉'}</span></td>
      <td><strong style="color:#E4EBF5">${(n.data?.label||'').replace(/</g,'&lt;')}</strong></td>
      <td><span style="background:${color}22;color:${color};padding:2px 8px;border-radius:4px;font-size:11px;font-family:monospace">${n.data?.type||''}</span></td>
      <td style="color:#8FA5BC;font-size:12px">${info.role||''}</td>
      <td style="color:#5BA3C9;font-size:12px;text-align:right">${comp ? comp.latencyMs + ' ms' : '—'}</td>
      <td style="color:#4FA882;font-size:12px;text-align:right">${comp ? '$' + comp.monthlyCost + '/mo' : '—'}</td>
      <td style="color:#5E7A96;font-size:11px;max-width:200px">${(n.data?.description||'').replace(/</g,'&lt;')}</td>
    </tr>`;
  }).join('');

  const edgeRows = edges.map(e => {
    const src = nodes.find(n => n.id === e.source)?.data?.label || e.source;
    const tgt = nodes.find(n => n.id === e.target)?.data?.label || e.target;
    return `<tr>
      <td style="color:#8FA5BC">${src}</td>
      <td style="text-align:center;color:#5BA3C9">→</td>
      <td style="color:#8FA5BC">${tgt}</td>
      <td style="color:#5E7A96">${e.label||''}</td>
    </tr>`;
  }).join('');

  const decisions = (design.keyDecisions||[]).map((d,i) =>
    `<li><span style="color:#5BA3C9;font-family:monospace;font-size:11px;margin-right:8px">0${i+1}</span>${d}</li>`
  ).join('');

  const scoreColor = (estimate?.scalabilityScore || 0) >= 85 ? '#4FA882'
                   : (estimate?.scalabilityScore || 0) >= 70 ? '#C49A3C' : '#C46060';

  const diagramSVG = buildDiagramSVG(nodes, edges);

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>ArchFlow — ${design.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Fira+Code:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#080C14;color:#E4EBF5;font-family:'Plus Jakarta Sans',sans-serif;padding:40px;max-width:1000px;margin:0 auto;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .logo{display:flex;align-items:center;gap:10px;margin-bottom:28px}
    .logo-icon{width:30px;height:30px;border-radius:7px;background:linear-gradient(135deg,#5BA3C9,#8B7EC8);display:flex;align-items:center;justify-content:center;font-size:14px}
    h1{font-size:26px;font-weight:800;letter-spacing:-0.03em;margin-bottom:6px}
    .meta{display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap}
    .badge{font-family:'Fira Code',monospace;font-size:11px;padding:3px 10px;border-radius:100px}
    .desc{color:#8FA5BC;font-size:13px;line-height:1.7;margin-bottom:6px}
    h2{font-size:12px;font-weight:600;color:#5BA3C9;margin:28px 0 10px;border-bottom:1px solid rgba(91,163,201,0.15);padding-bottom:6px;font-family:'Fira Code',monospace;letter-spacing:0.08em;text-transform:uppercase}
    .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:4px}
    .stat-box{background:rgba(91,163,201,0.06);border:1px solid rgba(91,163,201,0.12);border-radius:10px;padding:14px;text-align:center}
    .stat-val{font-size:22px;font-weight:800;letter-spacing:-0.03em;margin-bottom:3px}
    .stat-lbl{font-size:10px;color:#5E7A96;font-family:'Fira Code',monospace;text-transform:uppercase;letter-spacing:0.08em}
    .diagram-wrap{margin:0 0 6px;border:1px solid rgba(91,163,201,0.12);border-radius:12px;overflow:hidden}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th{text-align:left;padding:6px 10px;font-family:'Fira Code',monospace;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:#5E7A96;border-bottom:1px solid rgba(91,163,201,0.1)}
    td{padding:8px 10px;border-bottom:1px solid rgba(91,163,201,0.06);vertical-align:middle;color:#8FA5BC}
    ul{padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}
    li{display:flex;align-items:flex-start;font-size:13px;color:#8FA5BC;line-height:1.6}
    .footer{margin-top:36px;padding-top:14px;border-top:1px solid rgba(91,163,201,0.08);display:flex;justify-content:space-between;color:#324560;font-family:'Fira Code',monospace;font-size:11px;flex-wrap:wrap;gap:6px}
  </style></head><body>
  <div class="logo"><div class="logo-icon">⬡</div><span style="font-family:'Fira Code',monospace;font-weight:600;font-size:13px;color:#5BA3C9">ArchFlow</span></div>
  <h1>${design.title}</h1>
  <div class="meta">
    <span class="badge" style="background:rgba(91,163,201,0.1);color:#5BA3C9">${nodes.length} components</span>
    <span class="badge" style="background:rgba(139,126,200,0.1);color:#8B7EC8">${edges.length} connections</span>
    <span class="badge" style="background:rgba(79,168,130,0.1);color:#4FA882">Cohere AI</span>
  </div>
  <p class="desc">${design.description}</p>

  ${estimate ? `
  <h2>// Estimates</h2>
  <div class="stats-row">
    <div class="stat-box"><div class="stat-val" style="color:#5BA3C9">$${estimate.totalMonthlyCost}</div><div class="stat-lbl">Monthly Cost</div></div>
    <div class="stat-box"><div class="stat-val" style="color:#8B7EC8">${estimate.criticalPathLatencyMs}ms</div><div class="stat-lbl">Critical Path</div></div>
    <div class="stat-box"><div class="stat-val" style="color:${scoreColor}">${estimate.scalabilityScore}</div><div class="stat-lbl">Scalability Score</div></div>
    <div class="stat-box"><div class="stat-val" style="color:${scoreColor};font-size:15px">${estimate.scalabilityLabel}</div><div class="stat-lbl">Rating</div></div>
  </div>` : ''}

  <h2>// Architecture Diagram</h2>
  <div class="diagram-wrap">${diagramSVG}</div>

  <h2>// Components</h2>
  <table><thead><tr><th></th><th>Name</th><th>Type</th><th>Role</th><th>Latency</th><th>Cost/mo</th><th>Description</th></tr></thead>
  <tbody>${componentRows}</tbody></table>

  <h2>// Data Flow</h2>
  <table><thead><tr><th>Source</th><th></th><th>Target</th><th>Label</th></tr></thead>
  <tbody>${edgeRows}</tbody></table>

  ${decisions ? `<h2>// Key Design Decisions</h2><ul>${decisions}</ul>` : ''}

  <div class="footer">
    <span>⬡ ArchFlow — AI System Design Visualizer</span>
    <span>Generated ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</span>
  </div>
  <script>setTimeout(()=>{window.print()},700)</script>
  </body></html>`;

  w.document.write(html);
  w.document.close();
};
