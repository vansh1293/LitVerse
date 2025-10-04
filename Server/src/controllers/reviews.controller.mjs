import Review from '../models/reviews.model.mjs';
import Book from '../models/books.model.mjs';

export const addReview = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { rating, reviewText } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating 1-5 required' });
        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        const existing = await Review.findOne({ bookId, userId: req.user._id });
        if (existing) return res.status(400).json({ message: 'You have already reviewed this book' });
        const review = new Review({ bookId, userId: req.user._id, rating, reviewText });
        await review.save();
        res.status(201).json(review);
    } catch (error) {
        console.log('addReview error', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (String(review.userId) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
        const { rating, reviewText } = req.body;
        if (rating) review.rating = rating;
        if (reviewText !== undefined) review.reviewText = reviewText;
        await review.save();
        res.json(review);
    } catch (error) {
        console.log('updateReview error', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (String(review.userId) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
        await review.deleteOne();
        res.json({ message: 'Review deleted' });
    } catch (error) {
        console.error('deleteReview error', error && error.stack ? error.stack : error);
        res.status(500).json({ message: error?.message || 'Internal Server Error' });
    }
};

export const listReviewsForBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const reviews = await Review.find({ bookId }).populate('userId', 'fullName');
        res.json(reviews);
    } catch (error) {
        console.log('listReviewsForBook error', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
