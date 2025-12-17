// src/lib/utils/logger.ts
// Configurable logger for SDK debugging

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

class Logger {
  private config: LoggerConfig = {
    enabled: false,
    level: 'warn',
    prefix: '[ZoPassport]',
  };

  /**
   * Configure the logger
   * @param options - Logger configuration
   */
  configure(options: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...options };
  }

  /**
   * Enable debug logging
   */
  enable(): void {
    this.config.enabled = true;
  }

  /**
   * Disable all logging
   */
  disable(): void {
    this.config.enabled = false;
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.config.prefix, ...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.config.prefix, ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.config.prefix, ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.config.prefix, ...args);
    }
  }
}

// Singleton instance
export const logger = new Logger();

// Export for testing/advanced usage
export { Logger };
export type { LogLevel, LoggerConfig };

