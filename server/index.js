require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initPool, closePool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Blood Bank API is running' });
});

app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/donors',    require('./routes/donors'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/requests',  require('./routes/requests'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/patients',  require('./routes/patients'));
app.use('/api/camps',         require('./routes/camps'));
app.use('/api/staff',         require('./routes/staff'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/banks',         require('./routes/banks'));
app.use('/api/hospitals',     require('./routes/hospitals'));
app.use('/api/tests',         require('./routes/tests'));
app.use('/api/payments',      require('./routes/payments'));
app.use('/api/chat',          require('./routes/chat'));

async function start() {
  try {
    await initPool();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

start();
