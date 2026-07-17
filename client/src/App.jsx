import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import AddItem from './pages/AddItem';
import Settings from './pages/Settings';

function AppLayout({ children }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #f4faf6, #e8f7f0)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-400/20 border-t-emerald-600 border-l-emerald-400 animate-spin" />
          <p className="text-emerald-800/60 font-semibold text-sm tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/items" element={<ProtectedRoute><AppLayout><Items /></AppLayout></ProtectedRoute>} />
      <Route path="/items/add" element={<ProtectedRoute><AppLayout><AddItem /></AppLayout></ProtectedRoute>} />
      <Route path="/items/:id/edit" element={<ProtectedRoute><AppLayout><AddItem /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
