import { Navigate, useLocation } from "react-router-dom";
import { TokenService } from "../../../API/taskifyAi";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = TokenService.getAccessToken();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
