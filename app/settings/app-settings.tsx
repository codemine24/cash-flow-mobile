import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Stack } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";
import { Globe, Moon, Bell, ChevronRight } from "lucide-react-native";

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 px-1">
      {children}
    </Text>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onChange,
  trackColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  trackColor: string;
}) {
  return (
    <View className="flex-row items-center py-4 gap-3">
      <View className="w-8 items-center">{icon}</View>
      <Text className="flex-1 text-base font-medium text-foreground">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#e5e7eb", true: trackColor }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

function SelectRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center py-4 gap-3"
    >
      <View className="w-8 items-center">{icon}</View>
      <Text className="flex-1 text-base font-medium text-foreground">{label}</Text>
      <Text className="text-sm text-muted mr-1">{value}</Text>
      <ChevronRight size={16} color="#9ca3af" />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View className="h-px bg-border ml-11" />;
}

export default function AppSettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language] = useState("English");
  const [currency] = useState("USD ($)");

  return (
    <>
      <Stack.Screen options={{ title: "App Settings" }} />
      {/* edges={["bottom"]} — top is handled by the native header */}
      <ScreenContainer edges={["bottom"]} className="bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
        >
          {/* ── Appearance ── */}
          <SectionLabel>Appearance</SectionLabel>
          <View className="bg-surface rounded-2xl border border-border px-4 mb-6">
            <ToggleRow
              icon={<Moon size={20} color="#7c3aed" />}
              label="Dark Mode"
              value={darkMode}
              onChange={setDarkMode}
              trackColor="#7c3aed"
            />
          </View>

          {/* ── Localisation ── */}
          <SectionLabel>Localisation</SectionLabel>
          <View className="bg-surface rounded-2xl border border-border px-4 mb-6">
            <SelectRow
              icon={<Globe size={20} color="#2563eb" />}
              label="Language"
              value={language}
              onPress={() => { }}
            />
            <Divider />
            <SelectRow
              icon={<Text style={{ fontSize: 18 }}>💱</Text>}
              label="Currency"
              value={currency}
              onPress={() => { }}
            />
          </View>

          {/* ── Notifications ── */}
          <SectionLabel>Notifications</SectionLabel>
          <View className="bg-surface rounded-2xl border border-border px-4 mb-8">
            <ToggleRow
              icon={<Bell size={20} color="#ca8a04" />}
              label="Push Notifications"
              value={notifications}
              onChange={setNotifications}
              trackColor="#ca8a04"
            />
          </View>

          <Text className="text-center text-xs text-muted">
            Some settings may require a restart to take effect.
          </Text>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
