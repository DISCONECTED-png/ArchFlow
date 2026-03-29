const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

const SYSTEM_PROMPT = `You are an expert system design architect. When given a system design prompt, respond ONLY with a valid JSON object (no markdown, no explanation) in this exact format:

{
  "title": "System Name",
  "description": "Brief 1-2 sentence overview",
  "nodes": [
    { "id": "1", "label": "Component Name", "type": "client|gateway|service|cache|database|queue|storage|cdn|monitor", "description": "What this component does" }
  ],
  "edges": [
    { "source": "1", "target": "2", "label": "optional edge label" }
  ],
  "keyDecisions": ["Decision 1", "Decision 2", "Decision 3"]
}

Node types: client, gateway, service, cache, database, queue, storage, cdn, monitor
Design realistic production systems with 8-15 components. Show real data flows.`;

module.exports = { cohere, SYSTEM_PROMPT };
