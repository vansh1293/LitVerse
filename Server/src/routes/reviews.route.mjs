import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.mjs';
import { addReview, updateReview, deleteReview, listReviewsForBook } from '../controllers/reviews.controller.mjs';

const router = Router();

router.get('/:bookId', listReviewsForBook);
router.post('/:bookId', protect, addReview);
router.put('/review/:id', protect, updateReview);
router.delete('/review/:id', protect, deleteReview);

export default router;
