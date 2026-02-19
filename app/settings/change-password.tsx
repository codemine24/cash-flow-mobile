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
import { Eye, EyeOff } from "lucide-react-native";

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  isLast,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isLast?: boolean;
}) {
  const colors = useColors();
  const [show, setShow] = useState(false);

  return (
    <View className={`py-4 ${!isLast ? "border-b border-border" : ""}`}>
      <Text className="text-xs text-muted mb-1">{label}</Text>
      <View className="flex-row items-center">
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={!show}
          className="flex-1 text-base text-foreground"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setShow((s) => !s)} className="pl-3">
          {show ? (
            <EyeOff size={18} color={colors.muted} />
          ) : (
            <Eye size={18} color={colors.muted} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Your password has been updated.");
    }, 900);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Change Password" }} />
      <ScreenContainer edges={["bottom"]} className="bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 px-1">
            Password
          </Text>

          {/* All 3 fields inside one card */}
          <View className="bg-surface rounded-2xl border border-border px-4 mb-4">
            <PasswordField
              label="Current Password"
              value={oldPassword}
              onChange={setOldPassword}
              placeholder="Enter current password"
            />
            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="At least 6 characters"
            />
            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repeat new password"
              isLast
            />
          </View>

          <Text className="text-xs text-muted mb-8 px-1">
            Choose a strong password with at least 6 characters.
          </Text>

          <TouchableOpacity
            onPress={handleChange}
            disabled={isSaving}
            className={`rounded-2xl py-4 items-center justify-center ${isSaving ? "bg-primary/50" : "bg-primary"
              }`}
          >
            <Text className="text-white font-bold text-base">
              {isSaving ? "Updating..." : "Update Password"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
