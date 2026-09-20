import type { NextFunction, Request, Response } from 'express';
import { config } from './config.js';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export function auth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new ApiError(401, 'UNAUTHORIZED', 'Missing or malformed Authorization header'));
    return;
  }
  if (header.slice('Bearer '.length) !== config.apiKey) {
    next(new ApiError(401, 'UNAUTHORIZED', 'Invalid API key'));
    return;
  }
  next();
}
