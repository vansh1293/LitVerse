import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
export default function AddBookModal({ open, onClose, onAdded, bookToEdit, onUpdated }: { open: boolean, onClose: () => void, onAdded?: (b: any) => void, bookToEdit?: any, onUpdated?: (b: any) => void }) {
    const [title, setTitle] = useState('')
    const [author, setAuthor] = useState('')
    const [description, setDescription] = useState('')
    const [genre, setGenre] = useState('')
    const [year, setYear] = useState<number | ''>('')

    useEffect(() => {
        if (bookToEdit) {
            setTitle(bookToEdit.title || '')
            setAuthor(bookToEdit.author || '')
            setDescription(bookToEdit.description || '')
            setGenre(bookToEdit.genre || '')
            setYear(bookToEdit.year || '')
        } else {
            setTitle('')
            setAuthor('')
            setDescription('')
            setGenre('')
            setYear('')
        }
    }, [bookToEdit])

    if (!open) return null

    async function handleSubmit(e: any) {
        e.preventDefault()
        try {
            const token = localStorage.getItem('token')
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'
            if (bookToEdit && bookToEdit._id) {
                // update
                const res = await fetch(`${apiBase}/api/books/${bookToEdit._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ title, author, description, genre, year }),
                })
                const data = await res.json()
                if (res.ok) {
                    toast.success('✅ Book updated')
                    onUpdated && onUpdated(data)
                    onClose()
                } else {
                    toast.error(data.message || 'Failed to update book')
                }
            } else {
                const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/books', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ title, author, description, genre, year }),
                })
                const data = await res.json()
                if (res.ok) {
                    toast.success('✅ Book added')
                    onAdded && onAdded(data)
                    onClose()
                } else {
                    toast.error(data.message || 'Failed to add book')
                }
            }
        } catch {
            toast.error('Network error')
        }
    }

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <form
                onSubmit={handleSubmit}
                className="relative bg-white/10 backdrop-blur-md p-8 rounded-2xl text-white w-full max-w-md shadow-xl"
            >
                <h3 className="text-2xl font-bold mb-4">{bookToEdit ? 'Edit Book' : 'Add New Book'}</h3>
                <div className="space-y-3">
                    <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="input" />
                    <input required value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author" className="input" />
                    <input value={genre} onChange={e => setGenre(e.target.value)} placeholder="Genre" className="input" />
                    <input value={year as any} onChange={e => setYear(Number(e.target.value) || '')} placeholder="Year" className="input" />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="input h-24" />
                </div>
                <div className="flex justify-end gap-2 mt-5">
                    <button type="button" onClick={onClose} className="px-3 py-1 text-white/80 hover:text-white">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg shadow-md">{bookToEdit ? 'Save' : 'Add Book'}</button>
                </div>
            </form>
        </div>
    )
}
