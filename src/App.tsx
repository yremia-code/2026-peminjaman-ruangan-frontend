import { BrowserRouter as Router, Routes, Route, href } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import RoomsPage from './pages/Admin/RoomsPage';
import BookingsPage from './pages/Admin/BookingsPage';
import ProtectedRoute from './components/ProtectedRoute'; 
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman utama langsung ke Login */}
        <Route path="/" element={<Login />} />
        
        {/* Halaman dashboard untuk daftar ruangan */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path='/admin/rooms' element={<RoomsPage />} />
          <Route path='/admin/bookings' element={<BookingsPage />} />
        </Route>
        <Route path="*" element={<p>Halaman tidak ditemukan</p>} />
      </Routes>
    </Router>
  );
}

export default App;