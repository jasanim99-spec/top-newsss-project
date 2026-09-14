import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { checkConnection } from './db/index.js';
import { initSocket } from './socket.js';
import newsRouter from './routes/news.js';
import videosRouter from './routes/videos.js';
import settingsRouter from './routes/settings.js';
import usersRouter from './routes/users.js';
import adsRouter from './routes/ads.js';
import notificationsRouter from './routes/notifications.js';
import leavesRouter from './routes/leaves.js';
import goalsRouter from './routes/goals.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.IO Engine
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// API Routers
app.use('/news', newsRouter);
app.use('/short-videos', videosRouter);
app.use('/settings', settingsRouter);
app.use('/users', usersRouter);
app.use('/ads', adsRouter);
app.use('/notifications', notificationsRouter);
app.use('/leaves', leavesRouter);
app.use('/goals', goalsRouter);

// Health Check Route
app.get('/health', async (req, res) => {
  const dbConnected = await checkConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    realtime: 'socket.io'
  });
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Top News PostgreSQL & Socket.IO API Server',
    version: '1.0.0',
    endpoints: ['/health', '/news', '/short-videos', '/settings', '/users']
  });
});

// Start HTTP + Socket.IO Server
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  server.listen(PORT, async () => {
    console.log(`🚀 Top News Backend & Socket.IO running on http://localhost:${PORT}`);
    await checkConnection();
  });
}

export default app;

