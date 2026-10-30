import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { store } from '../data/store';
import { ErrorCodes, type ErrorResponse } from '../schemas/response.schema';
import type { User } from '../schemas/auth.schema';

export interface AuthenticatedRequest extends Request {
  user: User;
  token: string;
}

export function authMiddleware(
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      ok: false,
      error: {
        code: ErrorCodes.AUTH_REQUIRED,
        message: 'Token de autenticación requerido',
      },
    });
    return;
  }

  const token = authHeader.substring(7);

  if (store.isTokenBlacklisted(token)) {
    res.status(401).json({
      ok: false,
      error: {
        code: ErrorCodes.TOKEN_EXPIRED,
        message: 'Token inválido o expirado',
      },
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as User;
    (req as AuthenticatedRequest).user = decoded;
    (req as AuthenticatedRequest).token = token;
    next();
  } catch (error) {
    res.status(401).json({
      ok: false,
      error: {
        code: ErrorCodes.TOKEN_EXPIRED,
        message: 'Token inválido o expirado',
      },
    });
  }
}
