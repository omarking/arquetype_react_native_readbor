import { Router, type Request, type Response } from 'express';
import { store } from '../data/store';
import type { Job } from '../schemas/job.schema';
import type { SuccessResponse } from '../schemas/response.schema';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

router.get(
  '/applications',
  authMiddleware,
  (
    req: Request,
    res: Response<SuccessResponse<Job[]>>
  ): void => {
    const { user } = req as AuthenticatedRequest;
    const applications = store.getApplications(user.id);

    res.json({
      ok: true,
      data: applications,
    });
  }
);

router.get(
  '/favorites',
  authMiddleware,
  (
    req: Request,
    res: Response<SuccessResponse<Job[]>>
  ): void => {
    const { user } = req as AuthenticatedRequest;
    const favorites = store.getFavorites(user.id);

    res.json({
      ok: true,
      data: favorites,
    });
  }
);

export const userRoutes = router;
