import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { store } from '../data/store';
import { jobQuerySchema, type Job, type PaginatedJobs } from '../schemas/job.schema';
import { ErrorCodes, type SuccessResponse, type ErrorResponse } from '../schemas/response.schema';
import { validate } from '../middleware/validate.middleware';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

router.get(
  '/',
  validate(jobQuerySchema, 'query'),
  (
    req: Request,
    res: Response<SuccessResponse<PaginatedJobs>>
  ): void => {
    const { q, city, salary_min, salary_max, sort, page, limit } = req.query as unknown as z.infer<typeof jobQuerySchema>;

    let filteredJobs = store.getJobs();

    if (q) {
      const searchTerm = q.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm) ||
          job.company.toLowerCase().includes(searchTerm)
      );
    }

    if (city) {
      filteredJobs = filteredJobs.filter((job) => job.city === city);
    }

    if (salary_min !== undefined || salary_max !== undefined) {
      filteredJobs = filteredJobs.filter((job) => {
        if (job.salary === null) return false;
        if (salary_min !== undefined && job.salary < salary_min) return false;
        if (salary_max !== undefined && job.salary > salary_max) return false;
        return true;
      });
    }

    filteredJobs = sortJobs(filteredJobs, sort, q);

    const total = filteredJobs.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedJobs = filteredJobs.slice(offset, offset + limit);

    res.json({
      ok: true,
      data: {
        jobs: paginatedJobs,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  }
);

router.get(
  '/:id',
  (
    req: Request,
    res: Response<SuccessResponse<Job> | ErrorResponse>
  ): void => {
    const id = parseInt(req.params.id, 10);
    const job = store.getJobById(id);

    if (!job) {
      res.status(404).json({
        ok: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Vacante no encontrada',
        },
      });
      return;
    }

    res.json({
      ok: true,
      data: job,
    });
  }
);

router.post(
  '/:id/apply',
  authMiddleware,
  (
    req: Request,
    res: Response<SuccessResponse<{ message: string }> | ErrorResponse>
  ): void => {
    const { user } = req as AuthenticatedRequest;
    const jobId = parseInt(req.params.id, 10);

    const job = store.getJobById(jobId);
    if (!job) {
      res.status(404).json({
        ok: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Vacante no encontrada',
        },
      });
      return;
    }

    if (store.hasApplied(user.id, jobId)) {
      res.status(409).json({
        ok: false,
        error: {
          code: ErrorCodes.ALREADY_APPLIED,
          message: 'Ya aplicaste a esta vacante',
        },
      });
      return;
    }

    store.addApplication(user.id, jobId);

    res.status(201).json({
      ok: true,
      data: {
        message: 'Aplicación registrada correctamente',
      },
    });
  }
);

router.delete(
  '/:id/apply',
  authMiddleware,
  (
    req: Request,
    res: Response<SuccessResponse<{ message: string }> | ErrorResponse>
  ): void => {
    const { user } = req as AuthenticatedRequest;
    const jobId = parseInt(req.params.id, 10);

    const removed = store.removeApplication(user.id, jobId);

    if (!removed) {
      res.status(404).json({
        ok: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'No existe aplicación para esta vacante',
        },
      });
      return;
    }

    res.json({
      ok: true,
      data: {
        message: 'Aplicación cancelada correctamente',
      },
    });
  }
);

router.post(
  '/:id/favorite',
  authMiddleware,
  (
    req: Request,
    res: Response<SuccessResponse<{ message: string }> | ErrorResponse>
  ): void => {
    const { user } = req as AuthenticatedRequest;
    const jobId = parseInt(req.params.id, 10);

    const job = store.getJobById(jobId);
    if (!job) {
      res.status(404).json({
        ok: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Vacante no encontrada',
        },
      });
      return;
    }

    if (store.hasFavorited(user.id, jobId)) {
      res.status(409).json({
        ok: false,
        error: {
          code: ErrorCodes.ALREADY_FAVORITED,
          message: 'Esta vacante ya está en favoritos',
        },
      });
      return;
    }

    store.addFavorite(user.id, jobId);

    res.status(201).json({
      ok: true,
      data: {
        message: 'Agregado a favoritos',
      },
    });
  }
);

router.delete(
  '/:id/favorite',
  authMiddleware,
  (
    req: Request,
    res: Response<SuccessResponse<{ message: string }> | ErrorResponse>
  ): void => {
    const { user } = req as AuthenticatedRequest;
    const jobId = parseInt(req.params.id, 10);

    const removed = store.removeFavorite(user.id, jobId);

    if (!removed) {
      res.status(404).json({
        ok: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Vacante no está en favoritos',
        },
      });
      return;
    }

    res.json({
      ok: true,
      data: {
        message: 'Eliminado de favoritos',
      },
    });
  }
);

function sortJobs(jobs: Job[], sort: string, searchTerm?: string): Job[] {
  const sorted = [...jobs];

  switch (sort) {
    case 'date_desc':
      return sorted.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    case 'date_asc':
      return sorted.sort(
        (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
      );
    case 'salary_desc':
      return sorted.sort((a, b) => (b.salary ?? 0) - (a.salary ?? 0));
    case 'salary_asc':
      return sorted.sort((a, b) => (a.salary ?? 0) - (b.salary ?? 0));
    case 'relevance':
      if (!searchTerm) return sorted;
      const term = searchTerm.toLowerCase();
      return sorted.sort((a, b) => {
        const aScore = calculateRelevance(a, term);
        const bScore = calculateRelevance(b, term);
        return bScore - aScore;
      });
    default:
      return sorted;
  }
}

function calculateRelevance(job: Job, term: string): number {
  let score = 0;
  if (job.title.toLowerCase().includes(term)) score += 10;
  if (job.company.toLowerCase().includes(term)) score += 5;
  if (job.tags.some((tag) => tag.toLowerCase().includes(term))) score += 3;
  return score;
}

export const jobsRoutes = router;
