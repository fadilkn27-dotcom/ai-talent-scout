import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Landing from "./Landing";

export default function Index() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const path = user.role === "client" ? "/client" : user.role === "worker" ? "/worker" : "/hr";
    return <Navigate to={path} replace />;
  }

  return <Landing />;
}
