// Import BrowserRouter to enable routing throughout the app
// Routes and Route define which component renders at which URL
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'

function App() {
  return (
    // BrowserRouter must wrap EVERYTHING that uses routing
    // Without this, useNavigate() and <Link> crash — that was your error
    <BrowserRouter>

      {/* Navbar appears on every page because it's outside <Routes> */}
      <Navbar />

      {/* Routes looks at the current URL and renders the matching Route */}
      <Routes>
        {/* index means this is the default — renders at "/" */}
        <Route index element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>

    </BrowserRouter>
  )
}

export default App