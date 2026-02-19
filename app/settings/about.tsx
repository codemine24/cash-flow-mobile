import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { ShieldCheck, FileText, Info, ChevronRight } from "lucide-react-native";

function AboutRow({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center py-4"
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        <Text className="text-xs text-muted mt-0.5">{subtitle}</Text>
      </View>
      <ChevronRight size={18} color="#9ca3af" />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View className="h-px bg-border ml-14" />;
}

export default function AboutScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "About CashFlow" }} />
      <ScreenContainer edges={["bottom"]} className="bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
        >
          {/* App identity block */}
          <View className="items-center py-6 mb-6">
            <View className="w-20 h-20 rounded-3xl bg-primary/10 items-center justify-center mb-4 border border-primary/20">
              <Text style={{ fontSize: 38 }}>💸</Text>
            </View>
            <Text className="text-2xl font-bold text-foreground">CashFlow</Text>
            <Text className="text-sm text-muted mt-1">Version 1.0.0</Text>
          </View>

          {/* Sub-links */}
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 px-1">
            Legal & Info
          </Text>
          <View className="bg-surface rounded-2xl border border-border px-4">
            <AboutRow
              iconBg="#dcfce7"
              icon={<ShieldCheck size={20} color="#16a34a" />}
              title="Privacy Policy"
              subtitle="How we handle your data"
              onPress={() => router.push("/settings/privacy-policy" as any)}
            />
            <Divider />
            <AboutRow
              iconBg="#dbeafe"
              icon={<FileText size={20} color="#2563eb" />}
              title="Terms & Conditions"
              subtitle="Rules for using CashFlow"
              onPress={() => router.push("/settings/terms" as any)}
            />
            <Divider />
            <AboutRow
              iconBg="#fef9c3"
              icon={<Info size={20} color="#ca8a04" />}
              title="About Us"
              subtitle="The team behind CashFlow"
              onPress={() => router.push("/settings/about-us" as any)}
            />
          </View>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
