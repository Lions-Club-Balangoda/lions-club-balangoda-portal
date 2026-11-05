/**
 * server/index.ts
 * Express API entry point for the Lions Club of Balangoda portal backend.
 *
 * Layer order (NFR-04 MVC/layered architecture, mirroring the class diagram):
 *   Routes → Controllers → Services → Repositories → DatabaseConnection
 *
 * Configuration is loaded from environment variables only — no secrets in source.
 * See .env.example for required variables.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Environment variables must be validated before anything else.
// Replace this comment with: import { validateEnv } from './config/env';
// validateEnv();

const app = express();
const PORT = process.env.PORT ?? 4000;

// ---------------------------------------------------------------------------
// Security middleware (SEC-01, SEC-03)
// ---------------------------------------------------------------------------
app.use(helmet()); // Sets secure HTTP headers including Content-Security-Policy
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    credentials: true,
  })
);

// ---------------------------------------------------------------------------
// Body parsers
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10kb' })); // Keep request size bounded
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// API routes — wire in feature routers here as they are built:
// ---------------------------------------------------------------------------
// import projectsRouter   from './routes/projects';
// import newsRouter       from './routes/news';
// import boardRouter      from './routes/board';
// import authRouter       from './routes/auth';
// import submissionsRouter from './routes/submissions';
//
// app.use('/api/projects',    projectsRouter);
// app.use('/api/news',        newsRouter);
// app.use('/api/board',       boardRouter);
// app.use('/api/auth',        authRouter);
// app.use('/api/submissions', submissionsRouter);

// ---------------------------------------------------------------------------
// Global error handler (place after all routes)
// ---------------------------------------------------------------------------
// import { errorHandler } from './middleware/errorHandler';
// app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server] API listening on http://localhost:${PORT}`);
});

export default app;
