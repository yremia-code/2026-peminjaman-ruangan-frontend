import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRoutesProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRoutesProps) => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`Access Denied: Role '${user.role}' tidak diizinkan mengakses halaman ini.`);
    
    if (user.role === "Admin" || user.role === "Petugas Lab") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    return <Navigate to="/user" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;