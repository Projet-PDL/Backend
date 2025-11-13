import { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
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
  // Register multipart to handle file uploads
  await fastify.register(fastifyMultipart, {
    // Do not attach file fields to `request.body` so AJV runtime validation
    // does not see file objects and produce JSON examples in Swagger UI.
    attachFieldsToBody: false,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit by default
    },
  });
  requestLoggerMiddleware(fastify);
  errorHandler(fastify);
};

export default registerMiddlewares;