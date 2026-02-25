import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text } from "react-native";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { authState, authReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authState.isAuthenticated) {
      router.replace("/auth");
    }
  }, [authState.isAuthenticated, router]);

  if (!authReady) {
    return <Text>Loading...</Text>;
  }

  return authState.isAuthenticated ? children : null;
}