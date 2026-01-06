import { MongoClient, Db, Collection } from 'mongodb';
import logger from '../utils/logger/logger';

export interface LogDocument {
  level: string;
  time: string;
  msg: string;
  pid?: number;
  hostname?: string;
  [key: string]: any;
}

class MongoDBService {
  private static instance: MongoDBService;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private logsCollection: Collection<LogDocument> | null = null;
  private isConnected: boolean = false;
  private connectionUri: string;
  private dbName: string;
  private collectionName: string;

  private constructor() {
    this.connectionUri = process.env.MONGODB_URI || '';
    this.dbName = process.env.MONGODB_DB_NAME || 'logs';
    this.collectionName = process.env.MONGODB_COLLECTION_NAME || 'application_logs';
  }

  static getInstance(): MongoDBService {
    if (!MongoDBService.instance) {
      MongoDBService.instance = new MongoDBService();
    }
    return MongoDBService.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    if (!this.connectionUri) {
      logger.warn('MongoDB URI not configured. Batch logging to MongoDB will be disabled.');
      return;
    }

    try {
      this.client = new MongoClient(this.connectionUri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.logsCollection = this.db.collection<LogDocument>(this.collectionName);
      this.isConnected = true;

      logger.info(`MongoDB connected successfully to database: ${this.dbName}, collection: ${this.collectionName}`);

      // Create indexes for better query performance
      await this.createIndexes();
    } catch (error) {
      logger.error({ error }, 'Failed to connect to MongoDB');
      this.isConnected = false;
      throw error;
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.logsCollection) {
      return;
    }

    try {
      await this.logsCollection.createIndex({ time: -1 });
      await this.logsCollection.createIndex({ level: 1 });
      await this.logsCollection.createIndex({ time: -1, level: 1 });
      logger.debug('MongoDB indexes created successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to create MongoDB indexes');
    }
  }

  async insertLogs(logs: LogDocument[]): Promise<void> {
    if (!this.isConnected || !this.logsCollection) {
      logger.warn('MongoDB not connected. Skipping log insertion.');
      return;
    }

    if (logs.length === 0) {
      return;
    }

    try {
      const result = await this.logsCollection.insertMany(logs, { ordered: false });
      logger.debug(`Inserted ${result.insertedCount} logs to MongoDB`);
    } catch (error) {
      logger.error({ error }, 'Failed to insert logs to MongoDB');
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.close();
        this.isConnected = false;
        this.client = null;
        this.db = null;
        this.logsCollection = null;
        logger.info('MongoDB disconnected successfully');
      } catch (error) {
        logger.error({ error }, 'Error disconnecting from MongoDB');
      }
    }
  }

  isMongoConnected(): boolean {
    return this.isConnected;
  }
}

export default MongoDBService.getInstance();
