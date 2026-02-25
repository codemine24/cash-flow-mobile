import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";
import { CreateGoalModal } from "@/components/create-goal-modal";
import { useColors } from "@/hooks/use-colors";
import { formatCurrency } from "@/lib/goal-utils";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useGoals } from "@/api/goal";

export default function GoalsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { data: goalsData, isLoading } = useGoals();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleDeleteGoal = (goalId: string, goalName: string) => {
    Alert.alert("Delete Goal", `Delete "${goalName}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => console.log(goalId),
        style: "destructive",
      },
    ]);
  };

  return (
    <>
      <ScreenContainer className="p-4 bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground">Goals</Text>
            <Text className="text-sm text-muted mt-1">
              Track your savings goals
            </Text>
          </View>

          {/* Goals List */}
          {isLoading ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-muted">Loading...</Text>
            </View>
          ) : goalsData?.data?.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-4xl mb-3">🎯</Text>
              <Text className="text-lg font-semibold text-foreground mb-2">
                No goals yet
              </Text>
              <Text className="text-sm text-muted text-center mb-4">
                Create your first savings goal to start tracking
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                className="bg-primary rounded-lg px-6 py-2"
              >
                <Text className="text-white font-semibold">Create Goal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={goalsData?.data}
              keyExtractor={(item) => item.id}
              renderItem={({ item: goal }) => {
                const progress = Math.min(
                  Math.max((goal.balance / goal.target_amount) * 100, 0),
                  100,
                );
                const isComplete = progress >= 100;

                return (
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/goal/[id]",
                        params: { id: goal.id },
                      } as any)
                    }
                    onLongPress={() => handleDeleteGoal(goal.id, goal.name)}
                    className="bg-surface rounded-xl p-4 mb-4 border border-border active:opacity-70"
                  >
                    {/* Goal name + completion badge */}
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-lg font-bold text-foreground flex-1">
                        {goal.name}
                      </Text>
                      {isComplete && (
                        <View className="bg-success/20 rounded-full px-3 py-1 ml-2">
                          <Text className="text-xs font-bold text-success">
                            ✓ Done
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Saved vs Target */}
                    <View className="flex-row justify-between mb-3">
                      <View>
                        <Text className="text-xs text-muted font-medium mb-0.5">
                          Saved
                        </Text>
                        <Text className="text-lg font-bold text-success">
                          {formatCurrency(goal.balance)}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-xs text-muted font-medium mb-0.5">
                          Target
                        </Text>
                        <Text className="text-lg font-bold text-foreground">
                          {formatCurrency(goal.target_amount)}
                        </Text>
                      </View>
                    </View>

                    {/* Progress bar */}
                    <View className="h-2 bg-background rounded-full overflow-hidden border border-border mb-1">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: isComplete
                            ? colors.success
                            : colors.primary,
                        }}
                      />
                    </View>

                    {/* Percentage text */}
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">
                        {goal?.total_transactions} entr
                        {goal?.total_transactions !== 1 ? "ies" : "y"}
                      </Text>
                      <Text
                        className="text-xs font-bold"
                        style={{
                          color: isComplete ? colors.success : colors.primary,
                        }}
                      >
                        {progress.toFixed(1)}%
                      </Text>
                    </View>

                    <Text className="text-xs text-muted mt-2">
                      Long press to delete
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </ScrollView>
      </ScreenContainer>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setShowCreateModal(true)}
        className="absolute bottom-10 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg"
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

      <CreateGoalModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
