import express from "express";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/auth.route.mjs';
import booksRoutes from './routes/books.route.mjs';
import reviewsRoutes from './routes/reviews.route.mjs';
import profileRoutes from './routes/profile.route.mjs';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Configure CORS whitelist from environment (comma-separated origins). If not set, allow all.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
if (allowedOrigins.length) {
    app.use(cors({
        origin: function (origin, callback) {
            // allow requests with no origin (mobile apps, curl)
            if (!origin) return callback(null, true)
            if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true)
            return callback(new Error('CORS policy: Origin not allowed'), false)
        }
    }))
} else {
    // no whitelist configured — keep default permissive CORS
    app.use(cors())
}

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => res.send('API is running...'));

// simple health/readiness endpoint for deploy platforms
app.get('/health', (req, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { autoIndex: true })
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });
