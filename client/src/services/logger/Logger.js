class Logger {
  static LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
  };

  constructor() {
    this.logLevel = process.env.REACT_APP_LOG_LEVEL || 'INFO';
    this.shouldLogToServer = process.env.REACT_APP_ENABLE_REMOTE_LOGGING === 'true';
    this.buffer = [];
    this.bufferSize = 50;
  }

  error(message, error = null, context = {}) {
    if (this.shouldLog(Logger.LOG_LEVELS.ERROR)) {
      this.logMessage('ERROR', message, error, context);
    }
  }

  warn(message, context = {}) {
    if (this.shouldLog(Logger.LOG_LEVELS.WARN)) {
      this.logMessage('WARN', message, null, context);
    }
  }

  info(message, context = {}) {
    if (this.shouldLog(Logger.LOG_LEVELS.INFO)) {
      this.logMessage('INFO', message, null, context);
    }
  }

  debug(message, context = {}) {
    if (this.shouldLog(Logger.LOG_LEVELS.DEBUG)) {
      this.logMessage('DEBUG', message, null, context);
    }
  }

  logMessage(level, message, error = null, context = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
    };

    if (error) {
      logEntry.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    }

    // Console logging
    this.logToConsole(logEntry);

    // Buffer management
    this.buffer.push(logEntry);
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }

    // Remote logging if enabled
    if (this.shouldLogToServer) {
      this.sendToServer(logEntry);
    }
  }

  shouldLog(level) {
    return level <= Logger.LOG_LEVELS[this.logLevel];
  }

  logToConsole(logEntry) {
    const formattedMessage = `[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}`;
    
    switch (logEntry.level) {
      case 'ERROR':
        console.error(formattedMessage, logEntry.error || '', logEntry.context);
        break;
      case 'WARN':
        console.warn(formattedMessage, logEntry.context);
        break;
      case 'INFO':
        console.info(formattedMessage, logEntry.context);
        break;
      case 'DEBUG':
        console.debug(formattedMessage, logEntry.context);
        break;
    }
  }

  async sendToServer(logEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      console.error('Failed to send log to server:', error);
    }
  }

  getLogs() {
    return [...this.buffer];
  }

  clearLogs() {
    this.buffer = [];
  }
}

export const logger = new Logger(); 