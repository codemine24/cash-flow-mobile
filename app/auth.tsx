import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, ArrowLeft, ShieldCheck } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useSendOtp, useVerifyOtp } from "@/api/auth";
import { useAuth } from "@/context/auth-context";

// Two steps on the same screen:
//   "email"  → user enters their email and taps "Send OTP"
//   "otp"    → user enters the 6-digit code and taps "Verify OTP"
type Step = "email" | "otp";

export default function AuthScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const sentOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const { setAuthState, authState } = useAuth();

  // Animated value for the content sliding between steps
  // Starts at 0 (visible), will slide left to -width on step change
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (authState.isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [authState.isAuthenticated, router]);

  // Slide the current content out, then swap the step, then slide new content in
  const animateToStep = (nextStep: Step) => {
    // Phase 1: fade + slide out current content
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      // Phase 2: update step (content changes) + reset position instantly
      setStep(nextStep);
      slideAnim.setValue(30);  // set below so it slides up into view
      // Phase 3: fade + slide new content in
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleSendOtp = async () => {
    if (!email.trim()) return;

    try {
      const response: any = await sentOtpMutation.mutateAsync(email);
      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: response?.message || "OTP sent!",
        });
        animateToStep("otp");
      } else {
        Toast.show({
          type: 'error',
          text1: response?.message || "Failed to send OTP",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;

    try {
      const response: any = await verifyOtpMutation.mutateAsync({ email, otp });

      if (response?.success) {
        Toast.show({
          type: 'success',
          text1: response?.message || "Verified!",
        });
        setAuthState({
          isAuthenticated: true,
          user: {
            id: response?.data?.id,
            name: response?.data?.name,
            email: response?.data?.email,
            contact_number: response?.data?.contact_number,
            role: response?.data?.role,
            avatar: response?.data?.avatar,
            status: response?.data?.status
          },
        });
        router.replace("/(tabs)");
      } else {
        Toast.show({
          type: 'error',
          text1: response?.message || "Invalid OTP",
        });
      }
    } catch (error) {
      console.error(error);
    }

  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* KeyboardAvoidingView shifts content up when the keyboard opens */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 24 }}>

          {/* ── Back button ── */}
          <TouchableOpacity
            onPress={() => {
              if (step === "otp") {
                animateToStep("email"); // go back to email step
              } else {
                router.back(); // go back to welcome screen
              }
            }}
            style={{
              marginTop: 16,
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeft size={22} color="#374151" />
          </TouchableOpacity>

          {/* ── Animated content area ── */}
          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              paddingTop: 40,
            }}
          >
            {/* Step indicator dots */}
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 32 }}>
              <View
                style={{
                  width: step === "email" ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#22c55e",
                }}
              />
              <View
                style={{
                  width: step === "otp" ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: step === "otp" ? "#22c55e" : "#d1d5db",
                }}
              />
            </View>

            {step === "email" ? (
              // ─── Email Step ───
              <>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: "#dcfce7",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <Mail size={26} color="#22c55e" />
                </View>

                <Text style={{ fontSize: 26, fontWeight: "800", color: "#111827", marginBottom: 8 }}>
                  Enter your email
                </Text>
                <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 32, lineHeight: 20 }}>
                  We&apos;ll send a one-time password{"\n"}to verify your account.
                </Text>

                <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>
                  Email address
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={{
                    backgroundColor: "#ffffff",
                    borderWidth: 1.5,
                    borderColor: "#e5e7eb",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 15,
                    color: "#111827",
                  }}
                />

                <View style={{ flex: 1 }} />

                <TouchableOpacity
                  onPress={handleSendOtp}
                  disabled={sentOtpMutation.isPending || !email.trim()}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: email.trim() ? "#22c55e" : "#d1d5db",
                    borderRadius: 14,
                    paddingVertical: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 32,
                  }}
                >
                  {sentOtpMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#ffffff" }}>
                      Send OTP
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              // ─── OTP Step ───
              <>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: "#dcfce7",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <ShieldCheck size={26} color="#22c55e" />
                </View>

                <Text style={{ fontSize: 26, fontWeight: "800", color: "#111827", marginBottom: 8 }}>
                  Check your email
                </Text>
                <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 4, lineHeight: 20 }}>
                  We sent a code to
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#22c55e", marginBottom: 32 }}>
                  {email}
                </Text>

                <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>
                  One-time password
                </Text>
                <TextInput
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter OTP"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={{
                    backgroundColor: "#ffffff",
                    borderWidth: 1.5,
                    borderColor: "#e5e7eb",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 22,
                    color: "#111827",
                    letterSpacing: 8,
                    fontWeight: "700",
                  }}
                />

                <TouchableOpacity
                  onPress={() => animateToStep("email")}
                  style={{ marginTop: 12 }}
                >
                  <Text style={{ fontSize: 13, color: "#6b7280" }}>
                    Didn&apos;t receive it?{" "}
                    <Text style={{ color: "#22c55e", fontWeight: "600" }}>Resend</Text>
                  </Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  disabled={verifyOtpMutation.isPending || otp.length < 6}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: otp.length >= 6 ? "#22c55e" : "#d1d5db",
                    borderRadius: 14,
                    paddingVertical: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 32,
                  }}
                >
                  {verifyOtpMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#ffffff" }}>
                      Verify OTP
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </Animated.View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
