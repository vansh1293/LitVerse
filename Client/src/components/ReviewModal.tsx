import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
export default function ReviewModal({ open, onClose, bookId, onAdded, reviewToEdit, onUpdated }: { open: boolean, onClose: () => void, bookId: string | null, onAdded?: (r: any) => void, reviewToEdit?: any, onUpdated?: (r: any) => void }) {
    const [rating, setRating] = useState(5)
    const [reviewText, setReviewText] = useState('')

    useEffect(() => {
        if (reviewToEdit) {
            setRating(reviewToEdit.rating || 5)
            setReviewText(reviewToEdit.comment || reviewToEdit.reviewText || '')
        } else {
            setRating(5)
            setReviewText('')
        }
    }, [reviewToEdit])

    if (!open || (!bookId && !reviewToEdit)) return null

    async function handleSubmit(e: any) {
        e.preventDefault()
        try {
            const token = localStorage.getItem('token')
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'
            if (reviewToEdit && reviewToEdit._id) {
                // update
                const res = await fetch(`${apiBase}/api/reviews/review/${reviewToEdit._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ rating, reviewText }),
                })
                const data = await res.json()
                if (res.ok) {
                    toast.success('⭐ Review updated')
                    onUpdated && onUpdated(data)
                    onClose()
                } else {
                    toast.error(data.message || 'Failed to update review')
                }
            } else {
                const res = await fetch(`${apiBase}/api/reviews/${bookId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ rating, reviewText }),
                })
                const data = await res.json()
                if (res.ok) {
                    toast.success('⭐ Review added')
                    onAdded && onAdded(data)
                    onClose()
                } else {
                    toast.error(data.message || 'Failed to add review')
                }
            }
        } catch {
            toast.error('Network error')
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-40">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <form onSubmit={handleSubmit} className="relative bg-white/10 backdrop-blur-md p-8 rounded-2xl text-white w-full max-w-md shadow-xl">
                <h3 className="text-2xl font-bold mb-4">{reviewToEdit ? 'Edit Review' : 'Add Review'}</h3>
                <label className="block text-sm mb-1">Rating (1–5)</label>
                <input type="number" min={1} max={5} value={rating} onChange={e => setRating(Number(e.target.value))} className="input mb-3" />
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Write your review..." className="input h-24 mb-4" />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-3 py-1 text-white/80 hover:text-white">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md">{reviewToEdit ? 'Save' : 'Submit'}</button>
                </div>
            </form>
        </div>
    )
}
