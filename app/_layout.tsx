import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform } from "react-native";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { BookProvider } from "@/lib/book-context";
import { GoalProvider } from "@/lib/goal-context";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import Toast from 'react-native-toast-message';
import { AuthProvider } from "@/context/auth-context";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      }),
  );

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <trpc.Provider client={trpcClient} queryClient={queryClient}> */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BookProvider>
            <GoalProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  // Shared style for ALL screens that opt in to headerShown: true
                  headerBackTitle: "Back",
                  headerShadowVisible: false,
                  headerStyle: { backgroundColor: "transparent" },
                  headerTitleStyle: { fontSize: 17, fontWeight: "600" },
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="goal/[id]" options={{ headerShown: true }} />
                <Stack.Screen name="book/[id]" options={{ headerShown: true }} />
                <Stack.Screen name="book/add-transaction" options={{ headerShown: true }} />
                <Stack.Screen name="settings/app-settings" options={{ headerShown: true }} />
                <Stack.Screen name="settings/profile" options={{ headerShown: true }} />
                <Stack.Screen name="settings/change-password" options={{ headerShown: true }} />
                <Stack.Screen name="settings/about" options={{ headerShown: true }} />
                <Stack.Screen name="settings/privacy-policy" options={{ headerShown: true }} />
                <Stack.Screen name="settings/terms" options={{ headerShown: true }} />
                <Stack.Screen name="settings/about-us" options={{ headerShown: true }} />
                <Stack.Screen name="oauth/callback" />

              </Stack>
              {/* Toast */}
              <Toast />
              <StatusBar style="auto" />
            </GoalProvider>
          </BookProvider>
        </AuthProvider>
      </QueryClientProvider>
      {/* </trpc.Provider> */}
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}
