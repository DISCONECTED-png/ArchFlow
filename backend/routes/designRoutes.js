const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Design = require('../models/Design');
const { protect, optionalAuth } = require('../middleware/auth');
const { designLimiter } = require('../middleware/rateLimiter');
const { generateDesign } = require('../services/cohereService');
const { estimateDesign } = require('../services/estimatorService');

// POST /api/designs/generate — generate a new design via AI
router.post('/generate', designLimiter, optionalAuth, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const design = await generateDesign(prompt);

    // Estimate safely — never let estimator crash the response
    let estimate = null;
    try { estimate = estimateDesign(design.nodes, design.edges); } catch(e) { console.warn('Estimator failed:', e.message); }

    // If user is logged in, persist the design
    let saved = null;
    if (req.user) {
      saved = await Design.create({
        userId:       req.user._id,
        prompt,
        title:        design.title,
        description:  design.description,
        nodes:        design.nodes,
        edges:        design.edges,
        keyDecisions: design.keyDecisions || [],
      });
    }

    res.json({
      ...design,
      estimate,
      savedId: saved?._id || null,
    });
  } catch (err) {
    console.error('Generate error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/designs — get all designs for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const designs = await Design.find({ userId: req.user._id, parentId: null })
      .sort({ createdAt: -1 })
      .select('title prompt description createdAt version shareId isPublic');
    res.json({ designs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/designs/:id — get a single design (own or public)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ error: 'Design not found' });

    const isOwner = req.user && design.userId?.toString() === req.user._id.toString();
    if (!design.isPublic && !isOwner)
      return res.status(403).json({ error: 'Access denied' });

    // Attach estimate on fetch
    const estimate = estimateDesign(design.nodes, design.edges);
    res.json({ design, estimate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/designs/share/:shareId — public share link lookup
router.get('/share/:shareId', async (req, res) => {
  try {
    const design = await Design.findOne({ shareId: req.params.shareId, isPublic: true });
    if (!design) return res.status(404).json({ error: 'Shared design not found or no longer public' });

    const estimate = estimateDesign(design.nodes, design.edges);
    res.json({ design, estimate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/designs/:id/share — generate public share link
router.post('/:id/share', protect, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ error: 'Design not found' });
    if (design.userId?.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Not your design' });

    if (!design.shareId) design.shareId = uuidv4().slice(0, 12);
    design.isPublic = true;
    await design.save();

    res.json({ shareId: design.shareId, shareUrl: `/shared/${design.shareId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/designs/:id/unshare — revoke public access
router.post('/:id/unshare', protect, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ error: 'Design not found' });
    if (design.userId?.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Not your design' });

    design.isPublic = false;
    await design.save();
    res.json({ message: 'Sharing disabled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/designs/:id/regenerate — create new version of existing design
router.post('/:id/regenerate', protect, designLimiter, async (req, res) => {
  try {
    const parent = await Design.findById(req.params.id);
    if (!parent) return res.status(404).json({ error: 'Design not found' });
    if (parent.userId?.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Not your design' });

    const newDesign = await generateDesign(parent.prompt);
    const estimate  = estimateDesign(newDesign.nodes, newDesign.edges);

    // Count existing versions
    const versionCount = await Design.countDocuments({ parentId: req.params.id });

    const saved = await Design.create({
      userId:       req.user._id,
      prompt:       parent.prompt,
      title:        newDesign.title,
      description:  newDesign.description,
      nodes:        newDesign.nodes,
      edges:        newDesign.edges,
      keyDecisions: newDesign.keyDecisions || [],
      parentId:     req.params.id,
      version:      versionCount + 2,
    });

    res.json({ ...newDesign, estimate, savedId: saved._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/designs/:id/versions — get all versions of a design
router.get('/:id/versions', protect, async (req, res) => {
  try {
    const versions = await Design.find({ parentId: req.params.id })
      .sort({ version: -1 })
      .select('title version createdAt description');

    const parent = await Design.findById(req.params.id)
      .select('title version createdAt description');

    res.json({ versions: parent ? [parent, ...versions] : versions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/designs/:id — delete a design
router.delete('/:id', protect, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ error: 'Design not found' });
    if (design.userId?.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Not your design' });

    await Design.deleteMany({ parentId: req.params.id }); // delete child versions
    await design.deleteOne();
    res.json({ message: 'Design deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
