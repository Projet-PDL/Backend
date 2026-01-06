import path from 'path';
import fs from 'fs';
import pino from 'pino';
import { createMongoDBTransport } from './mongoTransport';

const logsDir = path.join(__dirname, '../../', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, 'combined.log');

// Create file destination
const fileDestination = pino.destination({ dest: logFile, sync: true });

// Check if MongoDB logging is enabled
const mongoLoggingEnabled = process.env.MONGODB_LOGGING_ENABLED === 'true';

let logDestination: pino.DestinationStream | pino.MultiStreamRes<pino.Level>;

if (mongoLoggingEnabled) {
  // Create MongoDB transport
  const mongoTransport = createMongoDBTransport();

  // Create a multistream that sends logs to both MongoDB and file
  logDestination = pino.multistream([
    { level: 'trace', stream: mongoTransport },
    { level: 'trace', stream: fileDestination },
  ]);
} else {
  // Only log to file if MongoDB logging is disabled
  logDestination = fileDestination;
}

export { logDestination as destination };