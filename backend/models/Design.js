const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  id:          String,
  label:       String,
  type:        String,
  description: String,
}, { _id: false });

const edgeSchema = new mongoose.Schema({
  source: String,
  target: String,
  label:  String,
}, { _id: false });

const designSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  prompt:       { type: String, required: true },
  title:        { type: String, required: true },
  description:  { type: String },
  nodes:        [nodeSchema],
  edges:        [edgeSchema],
  keyDecisions: [String],
  shareId:      { type: String, unique: true, sparse: true }, // for public share URL
  isPublic:     { type: Boolean, default: false },
  version:      { type: Number, default: 1 },
  parentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Design', default: null }, // for version history
  createdAt:    { type: Date, default: Date.now },
  updatedAt:    { type: Date, default: Date.now },
});

designSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Design', designSchema);
