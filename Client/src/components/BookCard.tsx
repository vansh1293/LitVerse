import { useNavigate } from 'react-router-dom'

type Props = {
    book: any
    onReview?: (b: any) => void
    onDelete?: (b: any) => void
    onEdit?: (b: any) => void
    hideReview?: boolean
}

export default function BookCard({ book, onReview, onDelete, onEdit, hideReview }: Props) {
    const navigate = useNavigate()

    return (
        <div className="bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 transition rounded-xl p-5 shadow-lg hover:shadow-2xl">
            <h3 className="text-xl font-semibold mb-1 cursor-pointer" onClick={() => navigate(`/books/${book._id}`)}>{book.title}</h3>
            <p className="text-sm text-white/70 mb-2">
                by <span className="text-white font-medium">{book.author}</span>
                {book.year && <>  {book.year}</>}
            </p>
            <p className="text-white/70 line-clamp-3 mb-4">{book.description}</p>
            <div className="flex items-center justify-between">
                <div className="text-sm text-white/60">🎭 {book.genre || 'General'}</div>
                <div className="flex items-center gap-2">
                    {!hideReview && onReview && (
                        <button
                            onClick={() => onReview(book)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition text-sm shadow-sm"
                        >
                            Review
                        </button>
                    )}

                    {onEdit && (
                        <button
                            onClick={() => onEdit(book)}
                            className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition text-sm text-white"
                        >
                            Edit
                        </button>
                    )}

                    {onDelete && (
                        <button
                            onClick={() => onDelete(book)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 rounded-lg transition text-sm text-white"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
