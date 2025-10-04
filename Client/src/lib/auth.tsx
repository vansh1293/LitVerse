import { Navigate } from 'react-router-dom'

export const isAuthenticated = (): boolean => {
    try {
        const t = localStorage.getItem('token')
        return !!t
    } catch (e) {
        return false
    }
}

export const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    if (!isAuthenticated()) return <Navigate to="/login" replace />
    return children
}

export const PublicRoute = ({ children }: { children: React.ReactElement }) => {
    if (isAuthenticated()) return <Navigate to="/" replace />
    return children
}

export default null
