require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');
 
const app = express();
connectDB();
app.use(cors());
app.use(express.json());
 
app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/designs', require('./routes/designRoutes'));
 
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({ error: `Route ${req.path} not found` }));
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});
 
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`ArchFlow backend running on port ${PORT}`));