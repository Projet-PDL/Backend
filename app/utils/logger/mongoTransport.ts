import { Writable } from 'stream';
import batchLoggerService from '../../services/batchLoggerService';
import { LogDocument } from '../../services/mongoDBService';

/**
 * Custom Pino transport that sends logs to MongoDB batch logger
 */
export class MongoDBTransport extends Writable {
  constructor() {
    super({
      objectMode: true,
    });
  }

  _write(chunk: any, encoding: string, callback: Function): void {
    try {
      // Parse the log entry if it's a string
      const logEntry = typeof chunk === 'string' ? JSON.parse(chunk) : chunk;

      // Convert to LogDocument format
      const logDocument: LogDocument = {
        level: logEntry.level,
        time: logEntry.time,
        msg: logEntry.msg,
        pid: logEntry.pid,
        hostname: logEntry.hostname,
        ...logEntry, // Include all other fields
      };

      // Send to batch logger asynchronously
      batchLoggerService.addLog(logDocument);

      callback();
    } catch (error) {
      // Don't fail the logging pipeline if MongoDB logging fails
      console.error('MongoDB transport error:', error);
      callback();
    }
  }
}

export function createMongoDBTransport(): MongoDBTransport {
  return new MongoDBTransport();
}
