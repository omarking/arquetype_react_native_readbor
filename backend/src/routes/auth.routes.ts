import { Router, type Request, type Response } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { store } from '../data/store';
import { mockUser, mockPassword } from '../data/seed';
import { loginSchema, type AuthResponse, type User } from '../schemas/auth.schema';
import { ErrorCodes, type SuccessResponse, type ErrorResponse } from '../schemas/response.schema';
import { validate } from '../middleware/validate.middleware';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

router.post(
  '/login',
  validate(loginSchema, 'body'),
  (
    req: Request,
    res: Response<SuccessResponse<AuthResponse> | ErrorResponse>
  ): void => {
    const { email, password } = req.body;

    if (email !== mockUser.email || password !== mockPassword) {
      res.status(401).json({
        ok: false,
        error: {
          code: ErrorCodes.INVALID_CREDENTIALS,
          message: 'Credenciales inválidas',
        },
      });
      return;
    }

    const signOptions: SignOptions = { expiresIn: '1h' };
    const token = jwt.sign(
      { id: mockUser.id, email: mockUser.email, name: mockUser.name },
      env.jwtSecret,
      signOptions
    );

    res.json({
      ok: true,
      data: {
        user: mockUser,
        token,
      },
    });
  }
);

router.post(
  '/logout',
  authMiddleware,
  (
    req: Request,
    res: Response<SuccessResponse<{ message: string }>>
  ): void => {
    const { token } = req as AuthenticatedRequest;
    store.blacklistToken(token);

    res.json({
      ok: true,
      data: {
        message: 'Sesión cerrada correctamente',
      },
    });
  }
);

router.get(
  '/me',
  authMiddleware,
  (
    req: Request,
    res: Response<SuccessResponse<User>>
  ): void => {
    const { user } = req as AuthenticatedRequest;

    res.json({
      ok: true,
      data: user,
    });
  }
);

export const authRoutes = router;
