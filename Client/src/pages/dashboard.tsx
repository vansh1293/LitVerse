import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BookCard from '../components/BookCard'
import AddBookModal from '../components/AddBookModal'
import ReviewModal from '../components/ReviewModal'

export default function DashboardPage() {
    const [books, setBooks] = useState<any[]>([])
    const [sort, setSort] = useState<'year' | 'rating'>('year')
    const [q, setQ] = useState<string>('')
    const [genre, setGenre] = useState<string>('')
    const [genres, setGenres] = useState<string[]>([])
    const [adding, setAdding] = useState(false)
    const [reviewingBook, setReviewingBook] = useState<any | null>(null)

    const fetchBooks = async () => {
        const params = new URLSearchParams()
        params.set('sort', sort)
        if (q.trim()) params.set('q', q.trim())
        if (genre) {
            // send the display genre string to the server (server normalizes/matches variants)
            params.set('genre', genre)
        }
        const url = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/books?' + params.toString()
        const res = await fetch(url)
        const data = await res.json()
        setBooks(data.books || [])
    }

    const fetchGenres = async () => {
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/books/genres')
            const data = await res.json()
            const serverGenres: string[] = data.genres || []

            // fallback/common genres to ensure dropdown has variety
            const fallbacks = [
                'Fiction',
                'Non Fiction',
                'Science Fiction',
                'Fantasy',
                'Drama',
                'Biography',
                'History',
                'Mystery',
                'Romance',
                'Philosophy'
            ]

            // Merge preserving server-provided first, then add missing fallbacks
            const merged: string[] = [...serverGenres]
            for (const f of fallbacks) {
                if (!merged.some(g => g && g.toLowerCase() === f.toLowerCase())) merged.push(f)
            }

            setGenres(merged)
        } catch (e) { }
    }

    useEffect(() => { fetchBooks() }, [sort, q, genre])
    useEffect(() => { fetchGenres() }, [])

    return (
        <div className="min-h-screen relative bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
            <Navbar />
            <main className="container mx-auto px-4 py-28">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 className="text-3xl font-bold tracking-tight">📚 All Books</h2>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <input
                                value={q}
                                onChange={e => setQ(e.target.value)}
                                placeholder="Search by title or author"
                                aria-label="Search books"
                                className="bg-white/5 text-white px-3 py-2 rounded-lg w-full sm:w-64"
                            />

                            <select
                                value={genre}
                                onChange={e => setGenre(e.target.value)}
                                aria-label="Filter by genre"
                                className="bg-white/5 text-white px-3 py-2 rounded-lg w-full sm:w-auto"
                            >
                                <option value="">All genres</option>
                                {genres.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <label className="text-sm text-white/80">Sort:</label>
                                <select
                                    value={sort}
                                    onChange={(e) => { setSort(e.target.value as any) }}
                                    aria-label="Sort books"
                                    className="bg-white/5 text-white px-3 py-2 rounded-lg w-full sm:w-auto"
                                >
                                    <option value="year">Published Year</option>
                                    <option value="rating">Average Rating</option>
                                </select>
                            </div>

                            <button
                                onClick={() => setAdding(true)}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 rounded-lg shadow-md transition w-full sm:w-auto"
                            >
                                + Add Book
                            </button>
                        </div>
                    </div>
                </div>

                {books.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {books.map(b => (
                            <BookCard key={b._id} book={b} onReview={(book) => setReviewingBook(book)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-white/70 text-lg">No books added yet 📖</div>
                )}
            </main>
            <Footer />

            <AddBookModal
                open={adding}
                onClose={() => setAdding(false)}
                onAdded={(b) => setBooks(prev => [b, ...prev])}
            />
            <ReviewModal
                open={!!reviewingBook}
                bookId={reviewingBook?._id || null}
                onClose={() => setReviewingBook(null)}
                onAdded={() => { }}
            />
        </div>
    )
}
