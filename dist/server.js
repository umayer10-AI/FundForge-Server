"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const database_1 = require("./config/database");
const logger_1 = require("./utils/logger");
const start = async () => {
    try {
        (0, config_1.validateConfig)();
        await (0, database_1.connectDatabase)();
        app_1.default.listen(config_1.config.port, () => {
            logger_1.logger.info(`Server running on port ${config_1.config.port} in ${config_1.config.nodeEnv} mode`);
            logger_1.logger.info(`Health check: http://localhost:${config_1.config.port}/api/health`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map