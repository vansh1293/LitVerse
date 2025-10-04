import Book from '../models/books.model.mjs';
import Review from '../models/reviews.model.mjs';

export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const [books, reviews] = await Promise.all([
            Book.find({ addedBy: userId }).sort({ createdAt: -1 }),
            Review.find({ userId }).populate('bookId', 'title author')
        ]);
        res.json({ user: req.user, books, reviews });
    } catch (error) {
        console.log('getMyProfile error', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
