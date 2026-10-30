import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ErrorCodes, type ErrorResponse } from '../schemas/response.schema';

type RequestLocation = 'body' | 'query' | 'params';

export function validate<T extends z.ZodTypeAny>(
  schema: T,
  location: RequestLocation = 'body'
) {
  return (
    req: Request,
    res: Response<ErrorResponse>,
    next: NextFunction
  ): void => {
    const result = schema.safeParse(req[location]);

    if (!result.success) {
      const errors = result.error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');

      res.status(422).json({
        ok: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: errors,
        },
      });
      return;
    }

    req[location] = result.data;
    next();
  };
}
