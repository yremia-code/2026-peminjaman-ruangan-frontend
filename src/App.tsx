import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import RoomsPage from './pages/Admin/RoomsPage';
import BookingsPage from './pages/Admin/BookingsPage';
import UsersPage from './pages/Admin/UsersPage';
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

          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path='/admin/rooms' element={<RoomsPage />} />
          <Route path='/admin/bookings' element={<BookingsPage />} />
          <Route path='/admin/users' element={<UsersPage />} />
        </Route>
        <Route path="*" element={<p>Halaman tidak ditemukan</p>} />
      </Routes>
    </Router>
  );
}

export default App;