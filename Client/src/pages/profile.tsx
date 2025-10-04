import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { isAuthenticated } from '../lib/auth'
import BookCard from '../components/BookCard'
import { toast } from 'react-toastify'
import ConfirmModal from '../components/ConfirmModal'
import AddBookModal from '../components/AddBookModal'
import ReviewModal from '../components/ReviewModal'

type Book = {
    _id: string
    title: string
    author?: string
    description?: string
    genre?: string
    year?: number
}

type Review = {
    _id: string
    bookId: Book | string
    rating: number
    comment: string
    createdAt?: string
}

export default function ProfilePage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [books, setBooks] = useState<Book[]>([])
    const [reviews, setReviews] = useState<Review[]>([])
    const [userName, setUserName] = useState<string | null>(null)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [confirmTarget, setConfirmTarget] = useState<{ type: 'book' | 'review'; id: string | null; item?: any } | null>(null)
    const [bookModalOpen, setBookModalOpen] = useState(false)
    const [bookToEdit, setBookToEdit] = useState<any | null>(null)
    const [reviewModalOpen, setReviewModalOpen] = useState(false)
    const [reviewToEdit, setReviewToEdit] = useState<any | null>(null)

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login')
            return
        }

        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }

        const fetchProfile = async () => {
            setLoading(true)
            try {
                const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'
                const res = await fetch(`${apiBase}/api/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                // If unauthorized, send user to login
                if (res.status === 401 || res.status === 403) {
                    throw new Error('Unauthorized')
                }

                const contentType = res.headers.get('content-type') || ''
                if (!contentType.includes('application/json')) {
                    // backend returned HTML (probably the frontend index) or other text
                    const txt = await res.text()
                    throw new Error('Non-JSON response from server:\n' + txt.slice(0, 1000))
                }

                if (!res.ok) {
                    const dataErr = await res.json().catch(() => null)
                    const msg = (dataErr && (dataErr.message || JSON.stringify(dataErr))) || 'Failed to fetch profile'
                    throw new Error(msg)
                }

                const data = await res.json()

                // backend may return { user, books, reviews } or { books, reviews }
                if (data.user) {
                    setUserName(data.user.name || null)
                    setUserEmail(data.user.email || null)
                }

                setBooks(data.books || [])
                setReviews(data.reviews || [])
            } catch (err: any) {
                console.error('Profile load error', err)
                // If unauthorized, redirect to login
                if (err && /unauthor/i.test(err.message)) {
                    toast.error('Session expired. Please login again.')
                    navigate('/login')
                    return
                }

                // For non-JSON responses or other errors, show a helpful toast and keep on page
                if (err && /Non-JSON response from server/.test(err.message)) {
                    toast.error('Server returned an unexpected response. Is the backend running?')
                } else {
                    toast.error(err?.message || 'Unable to load profile')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [navigate])

    const handleDeleteReview = async (reviewId: string) => {
        const token = localStorage.getItem('token')
        if (!token) {
            toast.error('Not authenticated')
            navigate('/login')
            return
        }

        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'
            const res = await fetch(`${apiBase}/api/reviews/review/${reviewId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.status === 401 || res.status === 403) {
                toast.error('Session expired. Please login again.')
                navigate('/login')
                return
            }

            if (!res.ok) {
                // try json
                const data = await res.json().catch(() => null)
                const msg = (data && (data.message || JSON.stringify(data))) || 'Failed to delete review'
                toast.error(msg)
                return
            }

            // success
            setReviews(prev => prev.filter(r => r._id !== reviewId))
            toast.success('Review deleted')
        } catch (err: any) {
            console.error('Delete review error', err)
            toast.error(err?.message || 'Unable to delete review')
        } finally {
            setConfirmOpen(false)
            setConfirmTarget(null)
        }
    }

    const handleDeleteBook = async (book: Book) => {
        const token = localStorage.getItem('token')
        if (!token) {
            toast.error('Not authenticated')
            navigate('/login')
            return
        }

        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'
            const res = await fetch(`${apiBase}/api/books/${book._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.status === 401 || res.status === 403) {
                toast.error('Session expired. Please login again.')
                navigate('/login')
                return
            }

            if (!res.ok) {
                const data = await res.json().catch(() => null)
                const msg = (data && (data.message || JSON.stringify(data))) || 'Failed to delete book'
                toast.error(msg)
                return
            }

            // success: remove book and its reviews from local state
            setBooks(prev => prev.filter(b => b._id !== book._id))
            setReviews(prev => prev.filter(r => {
                const bid = typeof r.bookId === 'object' ? (r.bookId as Book)._id : (r.bookId as string)
                return bid !== book._id
            }))
            toast.success('Book deleted')
        } catch (err: any) {
            console.error('Delete book error', err)
            toast.error(err?.message || 'Unable to delete book')
        } finally {
            setConfirmOpen(false)
            setConfirmTarget(null)
        }
    }

    const openConfirm = (type: 'book' | 'review', id: string, item?: any) => {
        setConfirmTarget({ type, id, item })
        setConfirmOpen(true)
    }

    const onConfirm = () => {
        if (!confirmTarget) return
        if (confirmTarget.type === 'book') {
            handleDeleteBook(confirmTarget.item)
        } else {
            handleDeleteReview(confirmTarget.id as string)
        }
    }

    const openEditBook = (book: any) => {
        setBookToEdit(book)
        setBookModalOpen(true)
    }

    const onBookUpdated = (updated: any) => {
        setBooks(prev => prev.map(b => (b._id === updated._id ? updated : b)))
    }
    const openEditReview = (review: any) => {
        setReviewToEdit(review)
        setReviewModalOpen(true)
    }

    const onReviewUpdated = (updated: any) => {
        setReviews(prev => prev.map(r => (r._id === updated._id ? updated : r)))
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white/80">Loading profile...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-24 bg-black/60">
            <div className="container mx-auto px-6 pt-28">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/5 backdrop-blur-lg border border-white/5 rounded-2xl p-6 mb-8"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                            {userName ? userName.charAt(0).toUpperCase() : 'U'}
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-white">{userName || 'Your profile'}</h2>
                            {userEmail && <p className="text-sm text-white/70">{userEmail}</p>}

                            <div className="mt-3 flex gap-3">
                                <div className="text-sm text-white/80 bg-white/5 px-3 py-1 rounded-lg">
                                    Books: <span className="font-medium">{books.length}</span>
                                </div>
                                <div className="text-sm text-white/80 bg-white/5 px-3 py-1 rounded-lg">
                                    Reviews: <span className="font-medium">{reviews.length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="ml-auto flex items-center gap-3">
                            <button
                                onClick={() => navigate('/')}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white"
                            >
                                Explore
                            </button>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <h3 className="text-xl text-white/90 font-semibold mb-4">My Books</h3>
                        {books.length === 0 ? (
                            <div className="text-white/70">You haven't added any books yet.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {books.map((b) => (
                                    <BookCard key={b._id}
                                        book={b}
                                        onDelete={(book) => openConfirm('book', book._id, book)}
                                        onEdit={(book) => openEditBook(book)}
                                        hideReview
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <aside>
                        <h3 className="text-xl text-white/90 font-semibold mb-4">My Reviews</h3>
                        {reviews.length === 0 ? (
                            <div className="text-white/70">No reviews yet.</div>
                        ) : (
                            <ul className="space-y-4">
                                {reviews.map((r) => {
                                    // bookId might be populated or just an id
                                    const bookTitle = typeof r.bookId === 'object' ? (r.bookId as Book).title : 'Book'
                                    return (
                                        <li key={r._id} className="bg-white/5 border border-white/5 rounded-xl p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="text-sm text-white/70">On</div>
                                                    <div className="font-medium text-white">{bookTitle}</div>
                                                </div>
                                                <div className="text-sm text-white/80">Rating: <span className="font-semibold">{r.rating}/5</span></div>
                                            </div>

                                            <p className="mt-3 text-white/70 line-clamp-3">{r.comment}</p>

                                            <div className="mt-4 flex items-center gap-3">
                                                <button
                                                    onClick={() => openEditReview(r)}
                                                    className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => openConfirm('review', r._id, r)}
                                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 rounded-lg text-white text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </aside>
                </div>
                <ConfirmModal
                    open={confirmOpen}
                    title={confirmTarget?.type === 'book' ? 'Delete book' : 'Delete review'}
                    message={confirmTarget?.type === 'book' ? 'Delete this book and all its reviews? This cannot be undone.' : 'Delete this review? This action cannot be undone.'}
                    onConfirm={onConfirm}
                    onCancel={() => { setConfirmOpen(false); setConfirmTarget(null) }}
                />
                <AddBookModal
                    open={bookModalOpen}
                    onClose={() => { setBookModalOpen(false); setBookToEdit(null) }}
                    bookToEdit={bookToEdit || undefined}
                    onUpdated={(b) => { onBookUpdated(b) }}
                />

                <ReviewModal
                    open={reviewModalOpen}
                    onClose={() => { setReviewModalOpen(false); setReviewToEdit(null) }}
                    bookId={reviewToEdit?.bookId?._id || (typeof reviewToEdit?.bookId === 'string' ? reviewToEdit.bookId : null)}
                    reviewToEdit={reviewToEdit || undefined}
                    onUpdated={(r) => { onReviewUpdated(r) }}
                />
            </div>
        </div>
    )
}

