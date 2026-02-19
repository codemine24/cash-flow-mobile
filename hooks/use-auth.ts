import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { useCallback, useState } from "react";

type UseAuthOptions = {
  autoFetch?: boolean;
};

// Dummy user for local development
const DUMMY_USER: Auth.User = {
  id: 1,
  openId: "dummy_user_id",
  name: "Local User",
  email: "local@example.com",
  loginMethod: "local",
  lastSignedIn: new Date(),
};

export function useAuth(options?: UseAuthOptions) {
  // Always return the dummy user and authenticated state
  const [user, setUser] = useState<Auth.User | null>(DUMMY_USER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Mock refresh function
  const refresh = useCallback(async () => {
    console.log("[useAuth] Refreshing dummy user...");
    setUser(DUMMY_USER);
    setLoading(false);
  }, []);

  // Mock logout function
  const logout = useCallback(async () => {
    console.log("[useAuth] Logout called (mock)");
    // In a real app, this would clear the session.
    // For this dev mode, we might want to stay logged in or toggle to null.
    // But since the requirement is "remove auth logic", effectively meaning "let me in",
    // we'll just log it and do nothing or maybe set user to null if we want to test that state.
    // For now, let's keep it simple: do nothing or maybe alert.
    alert("Logout clicked (Disabled for local dev)");
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: true, // Always authenticated
    refresh,
    logout,
  };
}
