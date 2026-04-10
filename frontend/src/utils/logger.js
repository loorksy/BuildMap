/**
 * Production-safe logger utility
 * In production, errors are silently handled or sent to monitoring service
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  error: (message, error) => {
    if (isDevelopment) {
      console.error(message, error);
    }
    // In production, send to monitoring service like Sentry
    // sentryLogger.captureException(error);
  },
  
  warn: (message, data) => {
    if (isDevelopment) {
      console.warn(message, data);
    }
  },
  
  info: (message, data) => {
    if (isDevelopment) {
      console.log(message, data);
    }
  },
  
  debug: (message, data) => {
    if (isDevelopment) {
      console.debug(message, data);
    }
  }
};
