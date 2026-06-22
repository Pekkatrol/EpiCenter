const express = require('express');
const cors = require('cors');
require('dotenv').config();
const activitiesRoutes = require('./routes/activities.routes');
const memosRoutes = require('./routes/memos.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/activities', activitiesRoutes);
app.use('/api/memos', memosRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});