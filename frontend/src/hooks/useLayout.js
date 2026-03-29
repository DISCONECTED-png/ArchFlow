// Auto-layout nodes in a top-down hierarchy using simple tiered positioning
export function buildLayoutedElements(rawNodes, rawEdges) {
  if (!rawNodes.length) return { nodes: [], edges: [] };

  // Build adjacency for tiers
  const inDegree = {};
  rawNodes.forEach((n) => (inDegree[n.id] = 0));
  rawEdges.forEach((e) => {
    if (inDegree[e.target] !== undefined) inDegree[e.target]++;
  });

  // BFS to assign tiers
  const tiers = {};
  const queue = rawNodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
  queue.forEach((id) => (tiers[id] = 0));

  const visited = new Set(queue);
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    rawEdges
      .filter((e) => e.source === cur)
      .forEach((e) => {
        const newTier = (tiers[cur] || 0) + 1;
        if (!visited.has(e.target) || tiers[e.target] < newTier) {
          tiers[e.target] = newTier;
        }
        if (!visited.has(e.target)) {
          visited.add(e.target);
          queue.push(e.target);
        }
      });
  }

  // Assign any unvisited nodes
  rawNodes.forEach((n) => {
    if (tiers[n.id] === undefined) tiers[n.id] = 0;
  });

  const maxTier = Math.max(...Object.values(tiers));
  const tierGroups = {};
  for (let i = 0; i <= maxTier; i++) tierGroups[i] = [];
  rawNodes.forEach((n) => tierGroups[tiers[n.id]].push(n.id));

  const NODE_W = 220;
  const NODE_H = 120;
  const H_GAP = 60;
  const V_GAP = 100;

  const positions = {};
  for (let tier = 0; tier <= maxTier; tier++) {
    const group = tierGroups[tier];
    const totalW = group.length * NODE_W + (group.length - 1) * H_GAP;
    group.forEach((id, i) => {
      positions[id] = {
        x: -totalW / 2 + i * (NODE_W + H_GAP),
        y: tier * (NODE_H + V_GAP),
      };
    });
  }

  const nodes = rawNodes.map((n) => ({
    ...n,
    position: positions[n.id] || { x: 0, y: 0 },
    type: 'archNode',
    data: {
      label: n.label,
      type: n.nodeType,
      description: n.description,
    },
  }));

  const edges = rawEdges.map((e, i) => ({
    id: `e${i}-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    label: e.label || '',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#334155', strokeWidth: 1.5 },
    labelStyle: {
      fill: '#64748B',
      fontSize: 10,
      fontFamily: "'Space Mono', monospace",
    },
    labelBgStyle: { fill: '#0A0F1A', fillOpacity: 0.8 },
  }));

  return { nodes, edges };
}
