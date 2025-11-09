import { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import errorHandler from './errorHandlerMiddleware';
import requestLoggerMiddleware from './RequestLoggerMiddleware';

const registerMiddlewares = async (fastify: FastifyInstance) => {
  // Register CORS first
  await fastify.register(fastifyCors, {
    origin: '*',
    credentials: true, // Allow credentials (cookies, authorization headers)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Then register other middlewares
  requestLoggerMiddleware(fastify);
  errorHandler(fastify);
};

export default registerMiddlewares;