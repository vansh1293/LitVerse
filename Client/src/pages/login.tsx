import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { HeroGeometric } from '../components/ui/shape-landing-hero'
import { toast } from 'react-toastify'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e: any) {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()
            if (res.ok) {
                localStorage.setItem('token', data.token)
                toast.success('Logged in')
                navigate('/dashboard')
            } else {
                toast.error(data.message || 'Login failed')
            }
        } catch (err) {
            toast.error('Network error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative">
            <HeroGeometric showContent={false} />
            <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-full max-w-md bg-white/6 backdrop-blur-md border border-white/10 rounded-xl p-8 text-white">
                    <h2 className="text-2xl font-bold mb-4">Login</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 rounded bg-white/5 border border-white/8" />
                        <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 rounded bg-white/5 border border-white/8" />
                        <button type="submit" disabled={loading} className="w-full px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700">{loading ? 'Logging...' : 'Login'}</button>
                    </form>
                    <p className="mt-4 text-sm text-white/60">Don't have an account? <Link to="/signup" className="text-indigo-200 underline">Sign up</Link></p>
                </div>
            </div>
        </div>
    )
}
