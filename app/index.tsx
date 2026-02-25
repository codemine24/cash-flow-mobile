import { View, Text, Image, TouchableOpacity, Dimensions, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";
import { useAuth } from "@/context/auth-context";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  // Animated values — start invisible (0) and shifted down (40px)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const { authState, authReady } = useAuth();

  // Run fade-in + slide-up animation when screen loads
  useEffect(() => {
    // Determine path based on auth state
    if (authReady) {
      if (authState.isAuthenticated) {
        // If already authenticated, redirect straight to tabs
        router.replace("/(tabs)");
        return;
      }
      // Otherwise, stay on Welcome Screen and run the animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [authReady, authState.isAuthenticated, router, fadeAnim, slideAnim]);

  // If auth is still initializing, render nothing / a loader until it figures out where to go
  if (!authReady) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 24 }}>

        {/* ── App preview image ── */}
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            marginTop: height * 0.06,
            width: width * 1,
            height: height * 0.44,
          }}
        >
          <Image
            source={require("../assets/images/welcome-image.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </Animated.View>

        {/* ── Text content ── */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            alignItems: "center",
            marginTop: 36,
          }}
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "800",
              color: "#111827",
              textAlign: "center",
              letterSpacing: -0.5,
            }}
          >
            Track Every{"\n"}
            <Text className="text-primary">Cash Flow</Text>
          </Text>

          <Text className="mt-4 text-center text-md text-gray-500 leading-6">
            Track daily expenses and savings management. Share specific wallets with family or friends for real-time financial transparency.
          </Text>
        </Animated.View>

        {/* Push button to bottom */}
        <View style={{ flex: 1 }} />

        {/* ── Get Started button ── */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            width: "100%",
            marginBottom: 32,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/auth")}
            activeOpacity={0.85}
            className="rounded-2xl bg-primary p-4 flex-row items-center justify-center gap-2"
          >
            <Text className="text-white font-bold text-lg">Get Started</Text>
            <ArrowRight size={20} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}
