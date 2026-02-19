import { ScrollView, Text, View } from "react-native";
import { Stack } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View className="mb-6">
      <Text className="text-sm font-bold text-foreground mb-2">{title}</Text>
      <Text className="text-sm text-muted leading-6">{children}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Privacy Policy" }} />
      <ScreenContainer edges={["bottom"]} className="bg-background">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
        >
          <Text className="text-xs text-muted mb-6">Last updated: February 2025</Text>

          <Section title="1. Information We Collect">
            We collect information you provide directly to us, such as when you create an account, add expense books, or set savings goals. This includes your name, email address, and financial transaction data stored locally on your device.
          </Section>
          <Section title="2. How We Use Your Information">
            Your data is used to provide and improve the CashFlow app experience. All financial data is stored locally on your device and is never transmitted to our servers without your explicit consent.
          </Section>
          <Section title="3. Data Storage">
            CashFlow stores all your expense and goal data locally on your device using AsyncStorage. We do not have access to your personal financial records.
          </Section>
          <Section title="4. Third-Party Services">
            We do not share your personal data with third parties. The app may use analytics tools to understand general usage patterns, but these do not include any personally identifiable information.
          </Section>
          <Section title="5. Your Rights">
            You have the right to access, correct, or delete your data at any time from within the app. You can clear all data via Settings → App Settings.
          </Section>
          <Section title="6. Contact Us">
            If you have any questions about this Privacy Policy, please contact us at privacy@cashflow.app.
          </Section>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
