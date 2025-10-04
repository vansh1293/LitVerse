import Book from '../models/books.model.mjs';
import Review from '../models/reviews.model.mjs';

export const createBook = async (req, res) => {
    try {
        const { title, author, description, genre, year } = req.body;
        if (!title || !author) return res.status(400).json({ message: 'Title and author required' });
        const book = new Book({ title, author, description, genre, year, addedBy: req.user._id });
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        console.log('createBook error', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const listBooks = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1'));
        const limit = 5;
        const skip = (page - 1) * limit;
        // handle search (q) and genre filter
        const q = (req.query.q || '').toString().trim();
        const genreFilter = (req.query.genre || '').toString().trim();

        // sort can be: 'year' | 'rating' | default (newest)
        const sortParam = (req.query.sort || '').toString();
        let sortStage = { createdAt: -1 };
        if (sortParam === 'year') sortStage = { year: -1 };
        else if (sortParam === 'rating') sortStage = { averageRating: -1 };

        const pipeline = [];

        // apply search / genre filters early
        const match = {};
        if (q) {
            match.$or = [
                { title: { $regex: q, $options: 'i' } },
                { author: { $regex: q, $options: 'i' } }
            ];
        }
        if (genreFilter) {
            // Match genre in a forgiving way: allow small variations like 'Non-Fiction', 'nonfiction', 'Non Fiction'
            const parts = genreFilter.split(/[^a-zA-Z0-9]+/).filter(Boolean).map(s => s.replace(/[^a-zA-Z0-9]/g, ''))
            if (parts.length) {
                const pattern = parts.join('.*')
                match.genre = { $regex: new RegExp(pattern, 'i') }
            } else {
                match.genre = genreFilter
            }
        }
        if (Object.keys(match).length) pipeline.push({ $match: match });

        // bring in reviews to compute average
        pipeline.push({ $lookup: { from: 'reviews', localField: '_id', foreignField: 'bookId', as: 'reviews' } });
        pipeline.push({ $addFields: { averageRating: { $cond: [{ $gt: [{ $size: '$reviews' }, 0] }, { $avg: '$reviews.rating' }, 0] } } });
        // include addedBy details
        pipeline.push({ $lookup: { from: 'users', localField: 'addedBy', foreignField: '_id', as: 'addedBy' } });
        pipeline.push({ $unwind: { path: '$addedBy', preserveNullAndEmptyArrays: true } });
        pipeline.push({ $project: { reviews: 0 } });

        pipeline.push({ $sort: sortStage });
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        const [books, total] = await Promise.all([
            Book.aggregate(pipeline),
            // total should respect filters too
            Book.countDocuments(match)
        ]);

        const booksClean = books.map(b => ({ ...b, averageRating: typeof b.averageRating === 'number' ? Number(b.averageRating.toFixed(2)) : 0 }));

        res.json({ books: booksClean, page, totalPages: Math.ceil(total / limit), total });
    } catch (error) {
        console.log('listBooks error', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getGenres = async (req, res) => {
    try {
        const raw = await Book.distinct('genre')
        const normalizeKey = (s) => s.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        const toTitle = (s) => s.toString().trim().split(/[^a-zA-Z0-9]+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')

        const map = new Map()
        for (const g of raw) {
            if (!g) continue
            const key = normalizeKey(g)
            // treat 'nonfiction' and variants as 'Non Fiction'
            if (key === 'nonfiction') {
                map.set('nonfiction', 'Non Fiction')
                continue
            }
            if (!map.has(key)) map.set(key, toTitle(g))
        }

        const genres = Array.from(map.values()).sort()
        res.json({ genres })
    } catch (error) {
        console.error('getGenres error', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

export const getBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id).populate('addedBy', 'fullName email');
        if (!book) return res.status(404).json({ message: 'Book not found' });
        const reviews = await Review.find({ bookId: book._id }).populate('userId', 'fullName');
        const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
        res.json({ book, reviews, averageRating: Number(avg.toFixed(2)) });
    } catch (error) {
        console.log('getBook error', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        if (String(book.addedBy) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
        const { title, author, description, genre, year } = req.body;
        Object.assign(book, { title, author, description, genre, year });
        await book.save();
        res.json(book);
    } catch (error) {
        console.log('updateBook error', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        if (String(book.addedBy) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
        // remove reviews associated with this book to avoid orphans
        await Review.deleteMany({ bookId: book._id });
        await Book.deleteOne({ _id: book._id });
        res.json({ message: 'Book and associated reviews deleted' });
    } catch (error) {
        console.error('deleteBook error', error && error.stack ? error.stack : error);
        res.status(500).json({ message: error?.message || 'Internal Server Error' });
    }
};
