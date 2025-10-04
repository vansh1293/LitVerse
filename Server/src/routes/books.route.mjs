import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.mjs';
import { createBook, listBooks, getBook, updateBook, deleteBook, getGenres } from '../controllers/books.controller.mjs';

const router = Router();

router.get('/', listBooks);
router.get('/genres', getGenres);
router.post('/', protect, createBook);
router.get('/:id', getBook);
router.put('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);

export default router;
