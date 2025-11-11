import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/authService';
import prisma from '../services/prismaService';
import { generateToken } from '../services/jwtService';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export const login = async (
  request: FastifyRequest<{ Body: LoginRequest }>,
  reply: FastifyReply
) => {
  const { email, password } = request.body;
  const { token, user } = await authService.login(email, password);
  return reply.code(200).send({
    success: true,
    data: { token, user },
  });
};

export const verifyToken = async (
  request: FastifyRequest<{ Headers: { authorization: string } }>,
  reply: FastifyReply
) => {
  const raw = (request.headers.authorization || '').trim();
  if (!raw) {
    return reply.code(401).send({ success: false, message: 'Authorization header missing' });
  }
  const token = raw.startsWith('Bearer ') || raw.startsWith('bearer ') ? raw.split(' ')[1].trim() : raw;
  const decodedToken = await authService.verifyToken(token);
  if (!decodedToken) {
    return reply.code(401).send({
      success: false,
      message: 'Invalid token',
    });
  }
  return reply.code(200).send({
    success: true,
    data: decodedToken,
  });  
};

export const register = async (
  request: FastifyRequest<{ Body: RegisterRequest }> ,
  reply: FastifyReply
) => {
  const { email, password, name } = request.body;

  // create user (password will be hashed in service)
  const user = await authService.createUser(email, password, name);

  // generate token for the new user
  const token = generateToken({ userId: String(user.id) });

  return reply.code(201).send({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      token,
    },
  });
};

