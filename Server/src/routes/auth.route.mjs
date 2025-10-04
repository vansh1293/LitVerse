import { Router } from 'express'
import { signup, login, logout, checkAuth } from '../controllers/auth.controller.mjs'
import { protect } from '../middleware/auth.middleware.mjs'
const router = Router()
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check', protect, checkAuth);
export default router;