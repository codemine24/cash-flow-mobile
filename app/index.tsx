import { View, Text, Image, TouchableOpacity, Dimensions, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  // Animated values — start invisible (0) and shifted down (40px)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  // Run fade-in + slide-up animation when screen loads
  useEffect(() => {
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
  }, [fadeAnim, slideAnim]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 24 }}>

        {/* ── App preview image ── */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginTop: height * 0.06,
            width: width * 0.72,
            height: height * 0.44,
            borderRadius: 24,
            overflow: "hidden",
            shadowColor: "#22c55e",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 12,
          }}
        >
          <Image
            source={require("../assets/images/welcome-preview.png")}
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
            <Text style={{ color: "#22c55e" }}>Cash Flow</Text>
          </Text>

          <Text
            style={{
              fontSize: 15,
              color: "#6b7280",
              textAlign: "center",
              marginTop: 12,
              lineHeight: 22,
            }}
          >
            Manage your books, track income{"\n"}and expenses — all in one place.
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
            style={{
              backgroundColor: "#22c55e",
              borderRadius: 16,
              paddingVertical: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#ffffff" }}>
              Get Started
            </Text>
            <ArrowRight size={20} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}
