import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import {
  Settings,
  User,
  Lock,
  Info,
  LogOut,
  ChevronRight,
} from "lucide-react-native";

// ─── Reusable row component ───────────────────────────────────────────────
function SettingsRow({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center py-4"
    >
      {/* Icon bubble */}
      <View
        className="w-11 h-11 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </View>

      {/* Text */}
      <View className="flex-1">
        <Text
          className="text-base font-semibold"
          style={danger ? { color: "#ef4444" } : undefined}
        // NativeWind doesn't support conditional class well here, use style prop
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-xs text-muted mt-0.5">{subtitle}</Text>
        ) : null}
      </View>

      {/* Arrow or danger icon */}
      {danger ? null : <ChevronRight size={18} color="#9ca3af" />}
    </TouchableOpacity>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────
function Divider() {
  return <View className="h-px bg-border ml-16" />;
}

// ─── Main screen ─────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => router.replace("/"),
      },
    ]);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}
      >
        {/* ── Header ── */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Settings</Text>
          <Text className="text-sm text-muted mt-1">Manage your account &amp; preferences</Text>
        </View>

        {/* ── Main settings group ── */}
        <View className="bg-surface rounded-2xl border border-border px-4 mb-4">
          <SettingsRow
            iconBg="#ede9fe"
            icon={<Settings size={22} color="#7c3aed" />}
            title="App Settings"
            subtitle="Language, Theme, Notifications"
            onPress={() => router.push("/settings/app-settings" as any)}
          />
          <Divider />
          <SettingsRow
            iconBg="#dbeafe"
            icon={<User size={22} color="#2563eb" />}
            title="Your Profile"
            subtitle="Name, Avatar, Email"
            onPress={() => router.push("/settings/profile" as any)}
          />
          <Divider />
          <SettingsRow
            iconBg="#dcfce7"
            icon={<Lock size={22} color="#16a34a" />}
            title="Change Password"
            subtitle="Update your password"
            onPress={() => router.push("/settings/change-password" as any)}
          />
          <Divider />
          <SettingsRow
            iconBg="#fef9c3"
            icon={<Info size={22} color="#ca8a04" />}
            title="About CashFlow"
            subtitle="Privacy Policy, T&C, About us"
            onPress={() => router.push("/settings/about" as any)}
          />
        </View>

        {/* ── Logout ── */}
        <View className="bg-surface rounded-2xl border border-border px-4">
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            className="flex-row items-center py-4 gap-3"
          >
            <View className="w-11 h-11 rounded-xl items-center justify-center bg-red-50">
              <LogOut size={22} color="#ef4444" />
            </View>
            <Text className="text-base font-semibold text-red-500">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
