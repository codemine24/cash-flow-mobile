import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useGoals } from "@/lib/goal-context";
import { formatCurrency } from "@/lib/goal-utils";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { AddGoalEntryModal } from "@/components/add-goal-entry-modal";
import { Plus } from "lucide-react-native";
import { useGoal } from "@/api/goal";

export default function GoalDetailScreen() {
  // useLocalSearchParams reads the [id] from the URL/route
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: goal } = useGoal(id!);
  const router = useRouter();
  const colors = useColors();
  const { deleteEntry } = useGoals();
  const [showAddModal, setShowAddModal] = useState(false);

  if (!goal) {
    return (
      <ScreenContainer className="p-4 items-center justify-center">
        <Text className="text-foreground">Goal not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const progress = Math.min(
    Math.max((goal.data.balance / goal.data.target_amount) * 100, 0),
    100,
  );
  const isComplete = progress >= 100;

  const handleDeleteEntry = (entryId: string) => {
    Alert.alert("Delete Entry", "Remove this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => deleteEntry(goal.data.id, entryId),
        style: "destructive",
      },
    ]);
  };

  return (
    <>
      {/* Stack.Screen sets the header title for this screen */}
      <Stack.Screen
        options={{ title: goal.data.name, headerBackTitle: "Goals" }}
      />

      <ScreenContainer className="p-4 bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* ── Summary Card ── */}
          <View className="bg-surface rounded-xl p-6 mb-6 border border-border">
            {/* Progress ring replaced by big number + label */}
            <Text className="text-muted text-center mb-1">Saved so far</Text>
            <Text
              className="text-4xl font-bold text-center mb-1"
              style={{ color: isComplete ? colors.success : colors.primary }}
            >
              {formatCurrency(goal.data.balance)}
            </Text>
            <Text className="text-sm text-muted text-center mb-5">
              of {formatCurrency(goal.data.target_amount)} target
            </Text>

            {/* Progress bar */}
            <View className="h-3 bg-background rounded-full overflow-hidden border border-border mb-2">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: isComplete ? colors.success : colors.primary,
                }}
              />
            </View>

            {/* % and remaining */}
            <View className="flex-row justify-between">
              <Text
                className="text-sm font-bold"
                style={{ color: isComplete ? colors.success : colors.primary }}
              >
                {progress.toFixed(1)}%
              </Text>
              {!isComplete && (
                <Text className="text-sm text-muted">
                  {formatCurrency(
                    Math.max(goal.data.target_amount - goal.data.balance, 0),
                  )}{" "}
                  remaining
                </Text>
              )}
              {isComplete && (
                <Text className="text-sm font-bold text-success">
                  🎉 Goal reached!
                </Text>
              )}
            </View>

            {/* Mini stats row */}
            <View className="flex-row gap-3 mt-5">
              <View className="flex-1 bg-background rounded-lg p-3 border border-border items-center">
                <Text className="text-xs text-muted font-medium mb-1">
                  Total Added
                </Text>
                <Text className="text-base font-bold text-success">
                  {formatCurrency(goal.data.in)}
                </Text>
              </View>
              <View className="flex-1 bg-background rounded-lg p-3 border border-border items-center">
                <Text className="text-xs text-muted font-medium mb-1">
                  Withdrawn
                </Text>
                <Text className="text-base font-bold text-error">
                  {formatCurrency(goal.data.out)}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Entries list ── */}
          <Text className="text-xl font-bold text-foreground mb-4">
            History
          </Text>

          {goal.data.transactions.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">
                No entries yet
              </Text>
              <Text className="text-sm text-muted text-center">
                Tap + to add money to this goal
              </Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={goal.data.transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onLongPress={() => handleDeleteEntry(item.id)}
                  className="bg-surface rounded-xl p-4 mb-3 border border-border flex-row items-center justify-between active:opacity-70"
                >
                  <View className="flex-1 mr-4">
                    <Text
                      className="text-base font-semibold text-foreground"
                      numberOfLines={1}
                    >
                      {item.remark ||
                        (item.type === "IN" ? "Added funds" : "Withdrawal")}
                    </Text>
                    <Text className="text-xs text-muted mt-1">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <Text
                    className="text-lg font-bold"
                    style={{
                      color: item.type === "IN" ? colors.success : colors.error,
                    }}
                  >
                    {item.type === "IN" ? "+" : "-"}
                    {formatCurrency(item.amount)}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </ScrollView>
      </ScreenContainer>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        className="absolute bottom-10 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>

      <AddGoalEntryModal
        visible={showAddModal}
        goalId={goal.data.id}
        onClose={() => setShowAddModal(false)}
      />
    </>
  );
}
