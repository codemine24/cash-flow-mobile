import { ScrollView, Text, View } from "react-native";
import { Stack } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";

export default function AboutUsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "About Us" }} />
      <ScreenContainer edges={["bottom"]} className="bg-background">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
        >
          {/* Hero */}
          <View className="items-center py-6 mb-6">
            <Text style={{ fontSize: 52 }}>💸</Text>
            <Text className="text-2xl font-bold text-foreground mt-3">CashFlow</Text>
            <Text className="text-sm text-muted mt-1">Version 1.0.0</Text>
          </View>

          {/* Mission */}
          <View className="bg-surface rounded-2xl border border-border p-5 mb-4">
            <Text className="text-sm font-bold text-foreground mb-2">Our Mission</Text>
            <Text className="text-sm text-muted leading-6">
              CashFlow was built to help everyday people take control of their finances — simply and
              privately. No complicated spreadsheets, no subscription fees. Just a clean, fast app
              that works for you.
            </Text>
          </View>

          {/* Beliefs */}
          <View className="bg-surface rounded-2xl border border-border p-5 mb-4">
            <Text className="text-sm font-bold text-foreground mb-3">What We Believe</Text>
            {[
              { emoji: "🔒", text: "Your financial data belongs to you — stored on your device, always." },
              { emoji: "⚡", text: "Speed and simplicity beat feature bloat every time." },
              { emoji: "🎯", text: "Small consistent savings habits build big results over time." },
            ].map(({ emoji, text }) => (
              <View key={emoji} className="flex-row gap-3 mb-3">
                <Text style={{ fontSize: 18 }}>{emoji}</Text>
                <Text className="flex-1 text-sm text-muted leading-5">{text}</Text>
              </View>
            ))}
          </View>

          {/* Contact */}
          <View className="bg-surface rounded-2xl border border-border p-5">
            <Text className="text-sm font-bold text-foreground mb-2">Get in Touch</Text>
            <Text className="text-sm text-muted leading-6">
              Have feedback or found a bug? We&apos;d love to hear from you.{"\n"}
              📧 hello@cashflow.app
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
