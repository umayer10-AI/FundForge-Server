"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const isDev = process.env.NODE_ENV === 'development';
exports.logger = {
    info: (message, data) => {
        if (isDev)
            console.log(`[INFO] ${message}`, data || '');
    },
    error: (message, error) => {
        console.error(`[ERROR] ${message}`, error || '');
    },
    warn: (message, data) => {
        if (isDev)
            console.warn(`[WARN] ${message}`, data || '');
    },
    debug: (message, data) => {
        if (isDev)
            console.debug(`[DEBUG] ${message}`, data || '');
    },
};
//# sourceMappingURL=logger.js.map