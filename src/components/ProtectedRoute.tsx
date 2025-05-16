
import { Navigate, useLocation } from "react-router-dom";
import Footer from "./Footer";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  // Mock authentication - replace with actual authentication logic
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {children}
      <Footer />
    </div>
  );
};

export default ProtectedRoute;
