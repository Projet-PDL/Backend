import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/authService';
import prisma from '../services/prismaService';
import { generateToken } from '../services/jwtService';

interface LoginRequest {
  email: string;
  password: string;
  role: string;
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
  const { email, password, role } = request.body;
  const authToken = await authService.login(email, password, role);
  return reply.code(200).send({
    success: true,
    data: { token: authToken },
  });
};

export const verifyToken = async (
  request: FastifyRequest<{ Headers: { authorization: string } }>,
  reply: FastifyReply
) => {
  const token = request.headers.authorization;
  if (!token) {
    return reply.code(401).send({
      success: false,
      message: 'Authorization header missing',
    });
  }
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

  // generate token for the new user (default role 'user')
  const token = generateToken({ userId: String(user.id), role: 'user' });

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

