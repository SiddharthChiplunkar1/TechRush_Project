import { Navigate } from "react-router-dom";
import { storage } from "../utils/storage";

const PublicRoute = ({ children }) => {
  const token = storage.getAccessToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;