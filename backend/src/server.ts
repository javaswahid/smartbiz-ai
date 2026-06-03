import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '../.env') });

import app from './app';
import prisma from './config/db';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // Verify database connection is alive on startup
    await prisma.$connect();
    console.log('[Database] Koneksi PostgreSQL berhasil tersambung.');

    const server = app.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 SmartBiz AI Backend berjalan pada port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/health`);
      console.log(`📘 Swagger API Docs: http://localhost:${PORT}/api-docs`);
      console.log(`==================================================\n`);
    });

    // Handle graceful shutdown signals
    const shutdown = async () => {
      console.log('\n[Server] Shutdown signal received. Closing resources...');
      server.close(async () => {
        console.log('[Server] HTTP listener closed.');
        await prisma.$disconnect();
        console.log('[Database] Database connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('[Startup Error] Gagal menyalakan backend server:', error);
    process.exit(1);
  }
}

bootstrap();
