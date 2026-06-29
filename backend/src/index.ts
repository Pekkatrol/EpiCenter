import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import activitiesRoutes from './routes/activities.routes';
import memosRoutes from './routes/memos.routes';
import authRoutes from './routes/auth.routes';
import pollsRoutes from './routes/polls.routes';
import suggestionsRoutes from './routes/suggestions.routes';
import bannersRoutes from './routes/banners.routes';

const app = express();

app.use(cors({
  origin: ['https://epi-center-one.vercel.app', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/activities', activitiesRoutes);
app.use('/api/memos', memosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollsRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/banners', bannersRoutes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('ERREUR:', err.message);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});