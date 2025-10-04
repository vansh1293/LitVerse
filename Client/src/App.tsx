import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/login'
import SignupPage from './pages/signup'
import Home from './pages/Home'
import DashboardPage from './pages/dashboard'
import ProfilePage from './pages/profile'
import BookDetails from './pages/BookDetails'
import { ProtectedRoute, PublicRoute, isAuthenticated } from './lib/auth'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    try {
      document.documentElement.classList.add('dark')
    } catch (e) { }
  }, [])

  const authenticated = isAuthenticated()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={authenticated ? <Navigate to="/dashboard" /> : <Home />}
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/:id"
          element={<ProtectedRoute><BookDetails /></ProtectedRoute>}
        />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  )
}
