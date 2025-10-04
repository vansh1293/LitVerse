// React imported implicitly by JSX runtime - no named import required

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }: {
    open: boolean
    title?: string
    message?: string
    onConfirm: () => void
    onCancel: () => void
}) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
            <div className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6 w-full max-w-md z-10">
                <h3 className="text-lg font-semibold text-white mb-2">{title || 'Confirm'}</h3>
                <p className="text-sm text-white/80 mb-4">{message || 'Are you sure?'}</p>

                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-md text-white">Delete</button>
                </div>
            </div>
        </div>
    )
}
