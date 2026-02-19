import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useExpenses } from "@/lib/expense-context";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import {
  formatCurrency,
  getMonthlyExpenses,
  getWeeklyExpenses,
  getYearlyExpenses,
  getTotalByCategory,
} from "@/lib/expense-utils";
import { cn } from "@/lib/utils";

type TimePeriod = "week" | "month" | "year";

export default function StatisticsScreen() {
  const colors = useColors();
  const { state } = useExpenses();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");

  let filteredExpenses = state.expenses;
  if (timePeriod === "week") {
    filteredExpenses = getWeeklyExpenses(state.expenses);
  } else if (timePeriod === "month") {
    filteredExpenses = getMonthlyExpenses(state.expenses);
  } else {
    filteredExpenses = getYearlyExpenses(state.expenses);
  }

  const totalByCategory = getTotalByCategory(filteredExpenses);
  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const getCategoryColor = (categoryId: string) => {
    return state.categories.find((c) => c.id === categoryId)?.color || "#B0B0B0";
  };

  const getCategoryName = (categoryId: string) => {
    return state.categories.find((c) => c.id === categoryId)?.name || "Other";
  };

  // Sort categories by spending
  const sortedCategories = Object.entries(totalByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxAmount = Math.max(...Object.values(totalByCategory), 1);

  return (
    <ScreenContainer className="p-4 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Statistics</Text>
          <Text className="text-sm text-muted mt-1">Your spending insights</Text>
        </View>

        {/* Time Period Toggle */}
        <View className="flex-row gap-2 mb-6 bg-surface rounded-lg p-1 border border-border">
          {(["week", "month", "year"] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setTimePeriod(period)}
              className={cn(
                "flex-1 py-2 rounded-md items-center justify-center",
                timePeriod === period ? "bg-primary" : "bg-transparent"
              )}
            >
              <Text
                className={cn(
                  "text-sm font-semibold capitalize",
                  timePeriod === period ? "text-white" : "text-foreground"
                )}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Spent Card */}
        <View className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 mb-6">
          <Text className="text-sm text-white/80 font-medium mb-2">Total Spent</Text>
          <Text className="text-4xl font-bold text-white">
            {formatCurrency(totalSpent)}
          </Text>
          <Text className="text-xs text-white/70 mt-3">
            {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Top Categories */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">Top Categories</Text>

          {filteredExpenses.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-muted text-center">No expenses in this period</Text>
            </View>
          ) : (
            <View className="gap-3">
              {sortedCategories.map(([categoryId, amount]) => {
                const percentage = (amount / maxAmount) * 100;
                return (
                  <View key={categoryId}>
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getCategoryColor(categoryId) }}
                        />
                        <Text className="text-sm font-medium text-foreground">
                          {getCategoryName(categoryId)}
                        </Text>
                      </View>
                      <Text className="text-sm font-bold text-foreground">
                        {formatCurrency(amount)}
                      </Text>
                    </View>
                    <View className="h-2 bg-surface rounded-full overflow-hidden border border-border">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getCategoryColor(categoryId),
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Category Breakdown */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">All Categories</Text>
          <View className="bg-surface rounded-xl border border-border overflow-hidden">
            {state.categories.map((category, index) => {
              const amount = totalByCategory[category.id] || 0;
              const percentage =
                totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : "0.0";

              return (
                <View
                  key={category.id}
                  className={cn(
                    "flex-row items-center justify-between p-4",
                    index !== state.categories.length - 1 && "border-b border-border"
                  )}
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: category.color }}
                    />
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-foreground">
                        {category.name}
                      </Text>
                      <Text className="text-xs text-muted mt-0.5">
                        {formatCurrency(amount)}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm font-semibold text-foreground">{percentage}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Average Daily Spending */}
        {filteredExpenses.length > 0 && (
          <View className="bg-surface rounded-xl p-4 border border-border">
            <Text className="text-sm text-muted font-medium mb-2">Average Daily</Text>
            <Text className="text-2xl font-bold text-foreground">
              {formatCurrency(totalSpent / (timePeriod === "week" ? 7 : timePeriod === "month" ? 30 : 365))}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
