import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { authRoutes } from './routes/auth.routes';
import { jobsRoutes } from './routes/jobs.routes';
import { userRoutes } from './routes/user.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/jobs', jobsRoutes);
app.use('/applications', userRoutes);
app.use('/favorites', userRoutes);

app.get('/health', (_, res) => {
  res.json({ ok: true, data: { status: 'healthy' } });
});

app.use((_, res) => {
  res.status(404).json({
    ok: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint no encontrado',
    },
  });
});

app.listen(env.port, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${env.port}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   POST /auth/login`);
  console.log(`   POST /auth/logout`);
  console.log(`   GET  /auth/me`);
  console.log(`   GET  /jobs`);
  console.log(`   GET  /jobs/:id`);
  console.log(`   POST /jobs/:id/apply`);
  console.log(`   DELETE /jobs/:id/apply`);
  console.log(`   POST /jobs/:id/favorite`);
  console.log(`   DELETE /jobs/:id/favorite`);
  console.log(`   GET  /applications`);
  console.log(`   GET  /favorites`);
});
