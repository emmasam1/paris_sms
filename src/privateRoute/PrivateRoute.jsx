import { Navigate, Outlet } from "react-router";
import { useApp } from "../context/AppContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, initialized } = useApp();

  // Wait for context to initialize before checking user
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-medium text-gray-600">
        Checking authentication...
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Role mismatch → redirect to their correct dashboard
  if (!allowedRoles.includes(user.role)) {
    switch (user.role) {
      case "super_admin":
      case "school_admin":
      case "principal":
        return <Navigate to="/admin/dashboard" replace />;
      case "class_admin":
        return <Navigate to="/class-admin/dashboard" replace />;
      case "teacher":
        return <Navigate to="/teacher/dashboard" replace />;
      case "parent":
        return <Navigate to="/home" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;
