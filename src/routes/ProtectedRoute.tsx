import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hook/AuthContext";
import socketService from "../socket/Socket";

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      socketService.connect();
      navigate("/home")
    }
  }, [isAuthenticated]);

  return children;
};

export default ProtectedRoute;
