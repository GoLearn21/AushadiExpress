// Comprehensive logging system for debugging and monitoring
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  error?: Error;
}

class AppLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs
  private enabledLevel: LogLevel = 'debug';

  log(level: LogLevel, module: string, message: string, data?: any, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      module,
      message,
      data,
      error
    };

    this.logs.push(entry);
    
    // Keep only recent logs to prevent memory issues
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with color coding
    const color = this.getColorForLevel(level);
    const prefix = `[${entry.timestamp.toISOString()}] [${module.toUpperCase()}]`;
    
    console.log(`%c${prefix} ${message}`, `color: ${color}`, data || '');
    if (error) {
      console.error(`%c${prefix} ERROR:`, `color: red`, error);
    }

    // Store in localStorage for persistence
    try {
      const storedLogs = this.getStoredLogs();
      storedLogs.push(entry);
      if (storedLogs.length > this.maxLogs) {
        storedLogs.splice(0, storedLogs.length - this.maxLogs);
      }
      localStorage.setItem('app-logs', JSON.stringify(storedLogs));
    } catch (e) {
      console.warn('Failed to store logs:', e);
    }
  }

  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case 'debug': return '#6b7280';
      case 'info': return '#3b82f6';
      case 'warn': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#000000';
    }
  }

  private getStoredLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem('app-logs');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  debug(module: string, message: string, data?: any) {
    this.log('debug', module, message, data);
  }

  info(module: string, message: string, data?: any) {
    this.log('info', module, message, data);
  }

  warn(module: string, message: string, data?: any) {
    this.log('warn', module, message, data);
  }

  error(module: string, message: string, error?: Error, data?: any) {
    this.log('error', module, message, data, error);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    const allLogs = [...this.logs, ...this.getStoredLogs()];
    if (!level) return allLogs;
    return allLogs.filter(log => log.level === level);
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    const allLogs = [...this.logs, ...this.getStoredLogs()];
    return allLogs.slice(-count);
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('app-logs');
  }

  exportLogs(): string {
    const allLogs = [...this.logs, ...this.getStoredLogs()];
    return JSON.stringify(allLogs, null, 2);
  }
}

// Export singleton instance
export const logger = new AppLogger();

// Module-specific loggers for convenience
export const createModuleLogger = (moduleName: string) => ({
  debug: (message: string, data?: any) => logger.debug(moduleName, message, data),
  info: (message: string, data?: any) => logger.info(moduleName, message, data),
  warn: (message: string, data?: any) => logger.warn(moduleName, message, data),
  error: (message: string, error?: Error, data?: any) => logger.error(moduleName, message, error, data)
});