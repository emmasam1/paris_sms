import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "antd";
import logo from "../../assets/logo.png"; // replace with your logo path
import { useApp } from "../../context/AppContext";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearSession } = useApp(); // make sure this exists in your context

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        navigate(-1); // go back to previous page
      } else {
        // clear session + redirect to login
        try {
          if (clearSession) clearSession();
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("token");
        } catch (err) {
          console.error("Error clearing session:", err);
        }
        navigate("/");
      }
    }, 7000);

    return () => clearTimeout(timer);
  }, [navigate, user, clearSession]);

  const handleGoBack = () => {
    if (user) navigate(-1);
    else {
      try {
        if (clearSession) clearSession();
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
      } catch (err) {
        console.error("Error clearing session:", err);
      }
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 via-white to-pink-50 px-4">
      {/* Logo */}
      <img src={logo} alt="Smart Schola" className="mb-6 w-42 h-auto" />

      {/* 404 Text */}
      <h1 className="text-7xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-2 font-medium">
        Oops! Page not found
      </p>
      <p className="text-gray-500 mb-6 text-center">
        The page{" "}
        <span className="font-mono text-gray-700">{location.pathname}</span>{" "}
        does not exist or you do not have access.
      </p>

      {/* Go Back Button */}
      <Button
        type="primary"
        size="large"
        className="!bg-blue-600 !border-none !rounded-md hover:!bg-blue-700"
        onClick={handleGoBack}
      >
        Go Back
      </Button>

      <p className="mt-4 text-gray-500 text-sm">
        You will be redirected automatically in 7 seconds...
      </p>
    </div>
  );
};

export default NotFound;
