import type { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
    status?: number;
}

// Express only recognizes error-handling middleware by its 4-argument arity, so _req/_next
// must stay even though they're unused (see .eslintrc.json's argsIgnorePattern for "^_").
export const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction): void => {
    const status = err.status ?? 500;
    const message = err.message || "Internal server error";

    res.status(status).json({ message });
};