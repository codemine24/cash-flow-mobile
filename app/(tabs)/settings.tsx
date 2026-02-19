import { ScrollView, Text, View, TouchableOpacity, Alert, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useExpenses } from "@/lib/expense-context";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const colors = useColors();
  const { state } = useExpenses();
  const [darkMode, setDarkMode] = useState(false);

  const totalExpenses = state.expenses.length;
  const totalSpent = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete all your expenses and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("expenses");
              Alert.alert("Success", "All data has been cleared");
            } catch (error) {
              Alert.alert("Error", "Failed to clear data");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const data = {
        expenses: state.expenses,
        categories: state.categories,
        exportDate: new Date().toISOString(),
      };
      const jsonString = JSON.stringify(data, null, 2);
      Alert.alert("Export Data", `Total size: ${(jsonString.length / 1024).toFixed(2)} KB\n\nData is ready to export`);
    } catch (error) {
      Alert.alert("Error", "Failed to export data");
    }
  };

  return (
    <ScreenContainer className="p-4 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Settings</Text>
          <Text className="text-sm text-muted mt-1">Manage your preferences</Text>
        </View>

        {/* Statistics Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">Statistics</Text>
          <View className="bg-surface rounded-xl border border-border overflow-hidden">
            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <Text className="text-sm text-muted">Total Expenses</Text>
              <Text className="text-lg font-bold text-foreground">{totalExpenses}</Text>
            </View>
            <View className="flex-row items-center justify-between p-4">
              <Text className="text-sm text-muted">Total Spent</Text>
              <Text className="text-lg font-bold text-foreground">
                ${totalSpent.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">Preferences</Text>
          <View className="bg-surface rounded-xl border border-border overflow-hidden">
            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <Text className="text-sm font-medium text-foreground">Dark Mode</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={darkMode ? colors.primary : colors.surface}
              />
            </View>
            <View className="flex-row items-center justify-between p-4">
              <Text className="text-sm font-medium text-foreground">Currency</Text>
              <Text className="text-sm text-muted">USD ($)</Text>
            </View>
          </View>
        </View>

        {/* Data Management Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">Data Management</Text>
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleExportData}
              className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between active:opacity-70"
            >
              <View>
                <Text className="text-sm font-semibold text-foreground">Export Data</Text>
                <Text className="text-xs text-muted mt-1">Download your expenses as JSON</Text>
              </View>
              <Text className="text-lg text-primary">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClearData}
              className="bg-surface rounded-xl p-4 border border-error flex-row items-center justify-between active:opacity-70"
            >
              <View>
                <Text className="text-sm font-semibold text-error">Clear All Data</Text>
                <Text className="text-xs text-muted mt-1">Delete all expenses permanently</Text>
              </View>
              <Text className="text-lg text-error">→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">About</Text>
          <View className="bg-surface rounded-xl border border-border overflow-hidden p-4">
            <View className="mb-3">
              <Text className="text-xs text-muted font-medium mb-1">App Name</Text>
              <Text className="text-sm text-foreground">Expense Tracker</Text>
            </View>
            <View className="mb-3">
              <Text className="text-xs text-muted font-medium mb-1">Version</Text>
              <Text className="text-sm text-foreground">1.0.0</Text>
            </View>
            <View>
              <Text className="text-xs text-muted font-medium mb-1">Built with</Text>
              <Text className="text-sm text-foreground">React Native & Expo</Text>
            </View>
          </View>
        </View>

        {/* Help Section */}
        <View className="bg-surface rounded-xl p-4 border border-border">
          <Text className="text-sm font-semibold text-foreground mb-2">Need Help?</Text>
          <Text className="text-xs text-muted leading-relaxed">
            Expense Tracker helps you track your daily spending. Add expenses, categorize them, and view insights about your spending patterns.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
