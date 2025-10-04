import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.mjs';
import { getMyProfile } from '../controllers/profile.controller.mjs';

const router = Router();

router.get('/', protect, getMyProfile);

export default router;
