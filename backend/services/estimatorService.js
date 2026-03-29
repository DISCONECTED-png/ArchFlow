
const LATENCY_MS = {
  client:   0,
  cdn:      5,
  gateway:  8,
  service:  15,
  cache:    2,
  database: 20,
  queue:    10,
  storage:  30,
  monitor:  5,
};

const MONTHLY_COST = {
  client:   0,
  cdn:      12,
  gateway:  18,
  service:  45,
  cache:    35,
  database: 80,
  queue:    25,
  storage:  20,
  monitor:  30,
};

const COMPONENT_NOTES = {
  client:   'End-user device — no cloud cost',
  cdn:      'CloudFront / Fastly edge caching',
  gateway:  'API Gateway + Load Balancer',
  service:  'Containerised microservice (2 vCPU, 4 GB)',
  cache:    'Redis / Memcached (cache.t3.medium)',
  database: 'Managed DB — RDS / Atlas (db.t3.medium)',
  queue:    'Managed Kafka / SQS standard tier',
  storage:  'Object storage — 500 GB S3 / GCS',
  monitor:  'Observability stack (Grafana Cloud / Datadog)',
};

const findCriticalPath = (nodes, edges) => {
  const adj = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(e => { if (adj[e.source]) adj[e.source].push(e.target); });

  let maxLatency = 0;
  let criticalPath = [];

  const starts = nodes.filter(n => n.type === 'client');
  const startNodes = starts.length ? starts : (nodes[0] ? [nodes[0]] : []);

  for (const startNode of startNodes) {
    const stack = [[startNode.id, [], 0, new Set([startNode.id])]];

    while (stack.length > 0) {
      const [nodeId, path, latency, visited] = stack.pop();
      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      const newLatency = latency + (LATENCY_MS[node.type] || 10);
      const newPath    = [...path, node.label];
      const neighbors  = (adj[nodeId] || []).filter(t => !visited.has(t));

      if (neighbors.length === 0) {
        if (newLatency > maxLatency) {
          maxLatency = newLatency;
          criticalPath = newPath;
        }
      } else {
        for (const target of neighbors) {
          stack.push([target, newPath, newLatency, new Set([...visited, target])]);
        }
      }

      if (stack.length > 5000) break;
    }
  }

  return { maxLatency, criticalPath };
};

const estimateDesign = (nodes, edges) => {
  const components = nodes.map(n => ({
    id:          n.id,
    label:       n.label,
    type:        n.type,
    latencyMs:   LATENCY_MS[n.type] ?? 10,
    monthlyCost: MONTHLY_COST[n.type] ?? 20,
    note:        COMPONENT_NOTES[n.type] || 'Custom component',
  }));

  const totalMonthlyCost = components.reduce((s, c) => s + c.monthlyCost, 0);
  const { maxLatency, criticalPath } = findCriticalPath(nodes, edges);

  let score = 60;
  const types = nodes.map(n => n.type);

  if (types.includes('cache'))   score += 10;
  if (types.includes('cdn'))     score += 8;
  if (types.includes('queue'))   score += 7;
  if (types.includes('monitor')) score += 5;
  if (types.filter(t => t === 'database').length > 1) score += 5;
  if (types.filter(t => t === 'service').length > 3)  score += 5;

  score = Math.min(score, 100);

  return {
    components,
    totalMonthlyCost,
    criticalPathLatencyMs: maxLatency,
    criticalPath,
    scalabilityScore: score,
    scalabilityLabel:
      score >= 85 ? 'Excellent' :
      score >= 70 ? 'Good' :
      score >= 55 ? 'Fair' : 'Needs work',
  };
};

module.exports = { estimateDesign };