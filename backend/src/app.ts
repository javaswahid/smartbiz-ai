import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { apiLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import apiRouter from './routes/api';
import swaggerDocument from './config/swagger.json';

const app = express();

// 1. Core middlewares
app.use(cors({
  origin: '*', // In production, adjust to allow only specific trusted frontends
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 2. Global Rate Limiter
app.use('/api/', apiLimiter);

// 3. API Documentation (OpenAPI Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 4. Base health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 5. REST API routes mounting
app.use('/api/v1', apiRouter);

// 6. 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} tidak ditemukan` });
});

// 7. Global Error Handler
app.use(errorHandler);

export default app;
