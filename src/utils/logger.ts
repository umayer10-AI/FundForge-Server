const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message: string, data?: any) => {
    if (isDev) console.log(`[INFO] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    if (isDev) console.warn(`[WARN] ${message}`, data || '');
  },
  debug: (message: string, data?: any) => {
    if (isDev) console.debug(`[DEBUG] ${message}`, data || '');
  },
};
