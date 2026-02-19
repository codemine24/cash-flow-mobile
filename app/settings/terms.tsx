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

export default function TermsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Terms & Conditions" }} />
      <ScreenContainer edges={["bottom"]} className="bg-background">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
        >
          <Text className="text-xs text-muted mb-6">Last updated: February 2025</Text>

          <Section title="1. Acceptance of Terms">
            By downloading and using CashFlow, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the app.
          </Section>
          <Section title="2. Use of the App">
            CashFlow is provided for personal financial tracking purposes only. You agree not to use the app for any unlawful purpose or in any way that could damage, disable, or impair the app.
          </Section>
          <Section title="3. User Accounts">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </Section>
          <Section title="4. Intellectual Property">
            All content, features, and functionality of CashFlow, including but not limited to text, graphics, logos, and software, are the property of CashFlow and are protected by applicable intellectual property laws.
          </Section>
          <Section title="5. Disclaimer of Warranties">
            CashFlow is provided on an &quot;as is&quot; basis without any warranties of any kind, either express or implied. We do not guarantee that the app will be error-free or uninterrupted.
          </Section>
          <Section title="6. Limitation of Liability">
            CashFlow shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use or inability to use the app.
          </Section>
          <Section title="7. Changes to Terms">
            We reserve the right to modify these Terms at any time. Continued use of the app after changes constitutes acceptance of the new Terms.
          </Section>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
