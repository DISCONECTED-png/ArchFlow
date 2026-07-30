const { cohere, SYSTEM_PROMPT } = require('../config/cohere');

const MODELS = [
  { name: 'command-a-plus-05-2026', version: 'v2' },
  { name: 'command-r-08-2024',     version: 'v1' },
  { name: 'command-r-plus-08-2024', version: 'v1' },
  { name: 'command-a-03-2025',     version: 'v1' },
];

const callCohereModel = async (modelObj, prompt, attempt) => {
  if (modelObj.version === 'v2') {
    const response = await cohere.v2.chat({
      model: modelObj.name,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Design a realistic production system for: ${prompt}` },
      ],
      temperature: attempt === 1 ? 0.3 : 0.5,
    });
    const textObj = response.message?.content?.find((item) => item.type === 'text');
    return textObj?.text ? textObj.text.trim() : '';
  } else {
    const response = await cohere.chat({
      model: modelObj.name,
      message: `Design a realistic production system for: ${prompt}`,
      preamble: SYSTEM_PROMPT,
      temperature: attempt === 1 ? 0.3 : 0.5,
    });
    return response.text ? response.text.trim() : '';
  }
};

const generateDesign = async (prompt) => {
  let lastError = null;

  for (const modelObj of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const rawText = await callCohereModel(modelObj, prompt, attempt);
        if (!rawText) continue;

        // Clean markdown backticks if any
        const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) continue;

        const design = JSON.parse(jsonMatch[0]);

        if (design.title && Array.isArray(design.nodes) && design.nodes.length > 0) {
          return design;
        }
      } catch (err) {
        console.warn(`Cohere attempt failed (Model: ${modelObj.name}, Attempt: ${attempt}):`, err.message);
        lastError = err;
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  const is422Error = lastError?.message?.includes('NO_VALID_RESPONSE_GENERATED') || lastError?.status === 422;
  if (is422Error) {
    throw new Error('The AI model could not generate a valid design for this prompt. Please try rephrasing your system description.');
  }

  throw new Error(lastError?.message || 'Failed to generate design after multiple attempts.');
};

module.exports = { generateDesign };
