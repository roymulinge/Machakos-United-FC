// src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  // loading = true means AuthContext is still fetching the user from the API
  // render nothing until we know who the user is — prevents flash redirect
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d08] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 bg-green-500 rotate-45 animate-pulse" />
          <p className="text-gray-600 text-xs uppercase tracking-widest">
            Authenticating…
          </p>
        </div>
      </div>
    )
  }

  // not logged in → send to login
  if (!user) {
    return <Navigate to="/login" replace />
    // replace=true removes /admin from history so back button doesn't return here
  }

  // logged in but not staff → send to home
  // is_admin_user checks is_staff OR role in (owner, manager, ticket_officer)
  if (!user.is_admin_user && !user.is_staff) {
    return <Navigate to="/" replace />
  }

  // authenticated admin — render the protected content
  return children
}