const { cohere, SYSTEM_PROMPT } = require('../config/cohere');

const generateDesign = async (prompt) => {
  const response = await cohere.chat({
    model: 'command-a-03-2025',
    message: `Design a system for: ${prompt}`,
    preamble: SYSTEM_PROMPT,
    temperature: 0.3,
  });

  const text = response.text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in AI response');

  const design = JSON.parse(jsonMatch[0]);

  if (!design.title || !Array.isArray(design.nodes)) {
    throw new Error('Invalid design structure returned by AI');
  }

  return design;
};

module.exports = { generateDesign };
