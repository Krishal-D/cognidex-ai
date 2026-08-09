import express from 'express'
import { authController } from '../controllers/authController'
import { authenticate } from '../middleware/auth'
import { authLimiter } from '../middleware/rateLimit'

const router = express.Router()

router.post('/register', authLimiter, authController.register)
router.post('/login', authLimiter, authController.login)
router.post('/logout', authController.logout)
router.post('/refresh', authController.refresh)
router.put('/me', authenticate, authController.updateProfile)

export default router