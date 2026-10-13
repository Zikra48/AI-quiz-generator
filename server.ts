import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import generateQuizHandler from './api/generate-quiz.ts';
import gradeQuizHandler from './api/grade-quiz.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API endpoints
  app.all('/api/generate-quiz', async (req, res) => {
    try {
      await generateQuizHandler(req, res);
    } catch (err: any) {
      console.error('Unhandled error in /api/generate-quiz:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: err?.message || 'Server error' });
      }
    }
  });

  app.all('/api/grade-quiz', async (req, res) => {
    try {
      await gradeQuizHandler(req, res);
    } catch (err: any) {
      console.error('Unhandled error in /api/grade-quiz:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: err?.message || 'Server error' });
      }
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'quiz-studio' });
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Quiz Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
