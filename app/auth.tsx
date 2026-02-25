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

type Step = "email" | "otp";

export default function AuthScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const sentOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();
  const { setAuthState, authState, authReady } = useAuth();

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (authReady && authState.isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [authReady, authState.isAuthenticated, router]);

  if (!authReady) {
    return null;
  }

  const animateToStep = (nextStep: Step) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      slideAnim.setValue(30);
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
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          <TouchableOpacity
            onPress={() => {
              if (step === "otp") {
                animateToStep("email");
              } else {
                router.back();
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
          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              paddingTop: 40,
            }}
          >
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 32 }}>
              <View
                style={{
                  width: step === "email" ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#00929A",
                }}
              />
              <View
                style={{
                  width: step === "otp" ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: step === "otp" ? "#00929A" : "#d1d5db",
                }}
              />
            </View>

            {step === "email" ? (
              <>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: "rgba(0, 146, 154, 0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <Mail size={26} color="#00929A" />
                </View>

                <Text
                  style={{
                    fontSize: 30,
                    fontWeight: "800",
                    color: "#111827",
                    letterSpacing: -0.5,
                  }}
                >
                  Enter your email
                </Text>

                <Text className="mt-4 text-md text-gray-500 leading-6 mb-4">
                  We&apos;ll send a one-time password to verify your account.
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

                <TouchableOpacity
                  onPress={handleSendOtp}
                  disabled={sentOtpMutation.isPending || !email.trim()}
                  activeOpacity={0.85}
                  className="mt-4 rounded-2xl"
                  style={{
                    backgroundColor: email.trim() ? "#00929A" : "#d1d5db",
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
              <>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: "rgba(0, 146, 154, 0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <ShieldCheck size={26} color="#00929A" />
                </View>

                <Text style={{ fontSize: 26, fontWeight: "800", color: "#111827", marginBottom: 8 }}>
                  Check your email
                </Text>
                <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 4, lineHeight: 20 }}>
                  We sent a code to
                </Text>
                <Text style={{ fontSize: 14, color: "#00929A" }} className="mb-4">
                  {email}
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
                    fontSize: 15,
                    color: "#111827",
                  }}
                />

                <TouchableOpacity
                  onPress={() => animateToStep("email")}
                  className="pt-4"
                >
                  <Text style={{ fontSize: 13, color: "#6b7280" }}>
                    Didn&apos;t receive it?{" "}
                    <Text style={{ color: "#00929A", fontWeight: "600" }}>Resend</Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  disabled={verifyOtpMutation.isPending || otp.length < 6}
                  activeOpacity={0.85}
                  className="mt-4 rounded-2xl"
                  style={{
                    backgroundColor: otp.length >= 6 ? "#00929A" : "#d1d5db",
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
