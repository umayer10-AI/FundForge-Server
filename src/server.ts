import app from './app';
import { config, validateConfig } from './config';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

const start = async () => {
  try {
    validateConfig();
    await connectDatabase();

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`Health check: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
