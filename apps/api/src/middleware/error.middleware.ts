import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  console.error(`[Error] ${errorCode}: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: err.message || 'Terjadi kesalahan internal pada server.',
      request_id: (req.headers['x-request-id'] as string) || undefined,
    },
  });
}
