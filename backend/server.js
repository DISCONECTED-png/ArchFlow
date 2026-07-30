require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

const app = express();

// Explicit CORS Headers Middleware for Vercel & Browser preflight OPTIONS requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors());
app.use(express.json());

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error in request:', err.message);
    return res.status(500).json({ error: `Database connection failed: ${err.message}. Check MONGO_URI and MongoDB Atlas IP access.` });
  }
});

app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/designs', require('./routes/designRoutes'));

app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({ error: `Route ${req.path} not found` }));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.header('Access-Control-Allow-Origin', '*');
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`ArchFlow backend running on port ${PORT}`));