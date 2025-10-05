import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../lib/auth'
import { toast } from 'react-toastify'

export default function Navbar() {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('token')
        toast.success('Logged out')
        navigate('/login')
    }

    return (
        <>
            <nav className="fixed top-0 w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-b from-black/40 via-black/30 to-transparent backdrop-blur-sm z-50">
                <div className="container mx-auto flex items-center justify-between flex-wrap gap-2">
                    {/* Logo */}
                    <h1
                        className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        📚 <span className="hidden sm:inline">LitVerse</span>
                    </h1>

                    {/* Right Side */}
                    {isAuthenticated() ? (
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Profile Button */}
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-2 sm:px-3 py-2 rounded-lg text-white transition"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.7-9.8 5v1.3h19.6V19.4c0-3.3-6.5-5-9.8-5z" />
                                </svg>
                                <span className="hidden sm:inline">Profile</span>
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 px-2 sm:px-3 py-2 rounded-lg text-white transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                                </svg>
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="px-3 sm:px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white shadow-md"
                        >
                            <span className="hidden sm:inline">Login</span>
                            <span className="sm:hidden">Log</span>
                        </button>
                    )}
                </div>
            </nav>
            {/* spacer to offset fixed navbar so page content is not hidden under it */}
            <div className="h-12 sm:h-16" />
        </>
    )
}
