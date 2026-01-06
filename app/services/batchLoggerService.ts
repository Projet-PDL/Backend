import mongoDBService, { LogDocument } from './mongoDBService';
import logger from '../utils/logger/logger';

class BatchLoggerService {
  private static instance: BatchLoggerService;
  private logBuffer: LogDocument[] = [];
  private batchSize: number;
  private flushInterval: number;
  private flushTimer: NodeJS.Timeout | null = null;
  private isShuttingDown: boolean = false;

  private constructor() {
    this.batchSize = parseInt(process.env.LOG_BATCH_SIZE || '100', 10);
    this.flushInterval = parseInt(process.env.LOG_FLUSH_INTERVAL_MS || '5000', 10);

    // Start the periodic flush timer
    this.startFlushTimer();

    // Handle graceful shutdown
    this.setupShutdownHandlers();
  }

  static getInstance(): BatchLoggerService {
    if (!BatchLoggerService.instance) {
      BatchLoggerService.instance = new BatchLoggerService();
    }
    return BatchLoggerService.instance;
  }

  /**
   * Add a log entry to the buffer
   * When buffer reaches batch size, flush asynchronously
   */
  addLog(log: LogDocument): void {
    if (this.isShuttingDown) {
      // During shutdown, flush immediately
      this.flushImmediately([log]);
      return;
    }

    this.logBuffer.push(log);

    if (this.logBuffer.length >= this.batchSize) {
      this.flushAsync();
    }
  }

  /**
   * Flush logs asynchronously (non-blocking)
   */
  private flushAsync(): void {
    if (this.logBuffer.length === 0) {
      return;
    }

    // Take current buffer and create a new one
    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    // Insert asynchronously without waiting
    setImmediate(() => {
      this.insertLogs(logsToFlush);
    });
  }

  /**
   * Flush logs immediately (blocking) - used during shutdown
   */
  private async flushImmediately(logs?: LogDocument[]): Promise<void> {
    const logsToFlush = logs || [...this.logBuffer];
    if (logsToFlush.length === 0) {
      return;
    }

    if (!logs) {
      this.logBuffer = [];
    }

    await this.insertLogs(logsToFlush);
  }

  /**
   * Insert logs to MongoDB
   */
  private async insertLogs(logs: LogDocument[]): Promise<void> {
    try {
      await mongoDBService.insertLogs(logs);
    } catch (error) {
      // Errors are already logged in mongoDBService
      // We don't want to create a logging loop here
      console.error('Batch logger failed to insert logs:', error);
    }
  }

  /**
   * Start periodic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.logBuffer.length > 0) {
        this.flushAsync();
      }
    }, this.flushInterval);
  }

  /**
   * Stop the flush timer
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Setup handlers for graceful shutdown
   */
  private setupShutdownHandlers(): void {
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) {
        return;
      }

      this.isShuttingDown = true;
      logger.info(`${signal} received. Flushing remaining logs...`);

      // Stop the periodic flush timer
      this.stopFlushTimer();

      // Flush any remaining logs
      await this.flushImmediately();

      logger.info('Batch logger shutdown complete');
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  /**
   * Get current buffer size (for monitoring/debugging)
   */
  getBufferSize(): number {
    return this.logBuffer.length;
  }

  /**
   * Get batch configuration
   */
  getConfig(): { batchSize: number; flushInterval: number } {
    return {
      batchSize: this.batchSize,
      flushInterval: this.flushInterval,
    };
  }

  /**
   * Force flush all buffered logs
   */
  async forceFlush(): Promise<void> {
    await this.flushImmediately();
  }
}

export default BatchLoggerService.getInstance();
