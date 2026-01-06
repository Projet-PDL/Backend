// CRITICAL: Load environment variables BEFORE any imports
// Using require() because ES6 imports are hoisted and run first
require('dotenv').config();

import Fastify from 'fastify';
import registerMiddlewares from './middlewares';
import registerRoutes from './routers';
import { PrismaClient } from './prisma/generated'
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import logger from './utils/logger/logger';
import multipart from '@fastify/multipart';
import mongoDBService from './services/mongoDBService';
import batchLoggerService from './services/batchLoggerService';

const isProd = process.env.ENV ? (process.env.ENV === 'PROD') : false;

const host = process.env.HOST || 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const domain = process.env.DOMAIN || host+':'+port;

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const fastify = Fastify({ logger: true });

// Initialize Prisma once at app startup
const prisma = new PrismaClient();

// Check database connection
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('Database connection established');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
}

async function startServer() {
  // Check database connection first
  await checkDatabaseConnection();

  // Initialize MongoDB for batch logging
  if (process.env.MONGODB_LOGGING_ENABLED === 'true') {
    try {
      await mongoDBService.connect();
      const config = batchLoggerService.getConfig();
      logger.info(`Batch logger initialized with batch size: ${config.batchSize}, flush interval: ${config.flushInterval}ms`);
    } catch (error) {
      logger.error({ error }, 'Failed to initialize MongoDB batch logging. Continuing without it.');
    }
  }

  // 1. Register middlewares
  await registerMiddlewares(fastify);


  // 2. Register Swagger plugin (generates the OpenAPI JSON/YAML endpoints)
  // Add a global security scheme for Bearer tokens so routes don't need to specify headers every time.
  fastify.register(fastifySwagger as any, {
    swagger: {
      info: {
        title: 'My API',
        description: 'API Documentation generated with Fastify Swagger',
        version: '1.0.0'
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      },
      host: domain,
      schemes: isProd ? ['https'] : ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      // Swagger 2.0 securityDefinitions
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'authorization',
          in: 'header',
          description: 'Enter your bearer token in the format **Bearer &lt;token>**',
        },
      },
      security: [{ Bearer: [] }],
    },
    // OpenAPI3 components (some swagger UI consumers use OpenAPI3)
    openapi: {
      info: {
        title: 'My API',
        description: 'API Documentation generated with Fastify Swagger',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    exposeRoute: true,
    transform: ({ schema, url }: any) => {
      // Transform the schema for file upload routes
      if (url === '/users/me/image' && schema) {
        const transformed = { ...schema };
        
        // Add formData parameter for Swagger 2.0
        if (!transformed.parameters) {
          transformed.parameters = [];
        }
        
        // Check if file parameter already exists
        const hasFileParam = transformed.parameters.some((p: any) => p.name === 'file' && p.in === 'formData');
        if (!hasFileParam) {
          transformed.parameters.push({
            in: 'formData',
            name: 'file',
            type: 'file',
            required: true,
            description: 'Profile image file to upload'
          });
        }
        
        return { schema: transformed, url };
      }
      return { schema, url };
    },
  });

  fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs'
  });

  // 2. Register routes
  registerRoutes(fastify);

  // 3. Start server
  try {
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    logger.info(`Server listening on ${host}:${port}`);
    fastify.log.info(`Server started on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Add graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully');

  // Flush any remaining logs before shutting down
  if (process.env.MONGODB_LOGGING_ENABLED === 'true') {
    try {
      await batchLoggerService.forceFlush();
      await mongoDBService.disconnect();
    } catch (error) {
      console.error('Error during batch logger shutdown:', error);
    }
  }

  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

startServer();