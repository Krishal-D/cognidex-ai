import express from 'express'
import { authController } from '../controllers/authController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.post('/refresh', authController.refresh)
router.put('/me', authenticate, authController.updateProfile)

export default router