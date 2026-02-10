import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/LoginPage';
import Dashboard from './pages/User/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import RoomsPage from './pages/Admin/RoomsPage';
import BookingsPage from './pages/Admin/BookingsPage';
import UsersPage from './pages/Admin/UsersPage';
import ProtectedRoute from './components/ProtectedRoute'; 
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/rooms" element={<RoomsPage />} />
          <Route path="/admin/bookings" element={<BookingsPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Mahasiswa"]} />}>
          <Route path="/user" element={<Dashboard />} />
        </Route>
        
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;