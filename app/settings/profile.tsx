import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import { Camera, User } from "lucide-react-native";

export default function ProfileScreen() {
  const colors = useColors();
  const [name, setName] = useState("John Doe");
  const email = "john@example.com";
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert("Saved", "Your profile has been updated.");
    }, 800);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Your Profile" }} />
      <ScreenContainer edges={["bottom"]} className="bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Avatar ── */}
          <View className="items-center mb-8">
            <View className="relative">
              <View className="w-24 h-24 rounded-full bg-surface border-2 border-border items-center justify-center">
                <User size={44} color={colors.muted} />
              </View>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Coming soon", "Avatar upload will be available soon.")
                }
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full items-center justify-center border-2 border-background"
              >
                <Camera size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-muted mt-3">Tap the camera icon to change avatar</Text>
          </View>

          {/* ── Name (editable) ── */}
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 px-1">
            Account Info
          </Text>
          <View className="bg-surface rounded-2xl border border-border px-4 mb-6">
            <View className="py-4 border-b border-border">
              <Text className="text-xs text-muted mb-1">Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.muted}
                className="text-base text-foreground"
              />
            </View>

            {/* ── Email (locked) ── */}
            <View className="py-4">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-xs text-muted">Email</Text>
                <View className="bg-background border border-border rounded-full px-2 py-0.5">
                  <Text className="text-xs text-muted">locked</Text>
                </View>
              </View>
              <Text className="text-base text-muted">{email}</Text>
            </View>
          </View>

          <Text className="text-xs text-muted mb-6 px-1">
            Email cannot be changed after registration.
          </Text>

          {/* ── Save button ── */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            className={`rounded-2xl py-4 items-center justify-center ${isSaving ? "bg-primary/50" : "bg-primary"
              }`}
          >
            <Text className="text-white font-bold text-base">
              {isSaving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
