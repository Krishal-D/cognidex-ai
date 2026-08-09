import rateLimit from 'express-rate-limit'
import type { Request } from 'express'

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please try again later.' },
})

function keyByUserOrIp(req: Request): string {
    return req.user?.id ? `user:${req.user.id}` : (req.ip ?? 'unknown')
}

export const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyByUserOrIp,
    message: { message: 'Too many questions in a short time. Please slow down.' },
})

export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyByUserOrIp,
    message: { message: 'Too many uploads in a short time. Please try again later.' },
})
