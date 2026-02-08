import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;