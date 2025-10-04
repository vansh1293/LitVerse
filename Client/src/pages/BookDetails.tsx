import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

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
    userId: { fullName?: string } | string
    rating: number
    reviewText?: string
    createdAt?: string
}

export default function BookDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [book, setBook] = useState<Book | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [average, setAverage] = useState<number>(0)

    useEffect(() => {
        if (!id) {
            navigate('/')
            return
        }

        const fetchBook = async () => {
            setLoading(true)
            try {
                const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'
                const res = await fetch(`${apiBase}/api/books/${id}`)

                if (res.status === 404) {
                    toast.error('Book not found')
                    navigate('/')
                    return
                }

                const contentType = res.headers.get('content-type') || ''
                if (!contentType.includes('application/json')) {
                    const txt = await res.text()
                    throw new Error('Unexpected response from server:\n' + txt.slice(0, 1000))
                }

                if (!res.ok) {
                    const dataErr = await res.json().catch(() => null)
                    throw new Error((dataErr && (dataErr.message || JSON.stringify(dataErr))) || 'Failed to load book')
                }

                const data = await res.json()
                setBook(data.book || null)
                setReviews(data.reviews || [])
                setAverage(typeof data.averageRating === 'number' ? data.averageRating : 0)
            } catch (err: any) {
                console.error('Book details load error', err)
                toast.error(err?.message || 'Unable to load book')
            } finally {
                setLoading(false)
            }
        }

        fetchBook()
    }, [id, navigate])

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-white/80">Loading book...</div></div>

    if (!book) return <div className="min-h-screen flex items-center justify-center"><div className="text-white/80">Book not found</div></div>

    return (
        <div className="min-h-screen pb-24 bg-black/60">
            <div className="container mx-auto px-6 pt-28">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-6">
                    <div className="flex items-start gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white">{book.title}</h1>
                            <div className="mt-1 text-sm text-white/70">by <span className="font-medium text-white">{book.author || 'Unknown'}</span> {book.year ? `• ${book.year}` : ''}</div>
                            <div className="mt-4 text-white/70">{book.description || 'No description provided.'}</div>

                            <div className="mt-6 flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="text-sm text-white/70">Average rating:</div>
                                    <div className="text-lg font-semibold text-white">{average.toFixed(2)}</div>
                                </div>
                                <div className="text-sm text-white/60">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</div>
                            </div>
                        </div>

                        <div className="w-44 text-right">
                            <button onClick={() => navigate(-1)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white">Back</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <h2 className="text-xl text-white/90 font-semibold mb-4">Reviews</h2>

                        {reviews.length === 0 ? (
                            <div className="text-white/70">No reviews yet. Be the first to review this book!</div>
                        ) : (
                            <ul className="space-y-4">
                                {reviews.map((r) => {
                                    const author = typeof r.userId === 'object' ? (r.userId as any).fullName : 'Anonymous'
                                    return (
                                        <li key={r._id} className="bg-white/5 border border-white/5 rounded-xl p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="text-sm text-white/70">By</div>
                                                    <div className="font-medium text-white">{author}</div>
                                                </div>
                                                <div className="text-sm text-white/80">Rating: <span className="font-semibold">{r.rating}/5</span></div>
                                            </div>

                                            {r.reviewText && <p className="mt-3 text-white/70 whitespace-pre-wrap">{r.reviewText}</p>}

                                            <div className="mt-3 text-xs text-white/60">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>

                    <aside>
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                            <h3 className="text-lg text-white font-semibold">Book Info</h3>
                            <div className="mt-3 text-white/70">Genre: <span className="font-medium text-white">{book.genre || 'General'}</span></div>
                            <div className="mt-2 text-white/70">Year: <span className="font-medium text-white">{book.year || '—'}</span></div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
