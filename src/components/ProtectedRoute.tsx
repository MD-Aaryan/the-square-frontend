// src/components/ProtectedRoute.tsx
import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

interface Props {
  children: ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { token } = useAuth();
  const localToken = localStorage.getItem("token");

  // Allow if either auth context has token OR localStorage has token
  if (!token && !localToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
