import { Navigate, Outlet } from "react-router";
import { useApp } from "../context/AppContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { user } = useApp(); // user saved in session via saveSession

  if (!user) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Wrong role, redirect to correct dashboard
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

  return <Outlet />; // render the nested routes
};

export default PrivateRoute;
