import { ScrollView, Text, View, TouchableOpacity, FlatList, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useExpenses } from "@/lib/expense-context";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import { formatCurrency } from "@/lib/expense-utils";
import { cn } from "@/lib/utils";

export default function TransactionsScreen() {
  const colors = useColors();
  const { state, deleteExpense } = useExpenses();
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredExpenses = state.expenses.filter((exp) => {
    const matchesSearch =
      exp.notes.toLowerCase().includes(searchText.toLowerCase()) ||
      exp.amount.toString().includes(searchText);
    const matchesCategory = selectedCategory ? exp.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (categoryId: string) => {
    return state.categories.find((c) => c.id === categoryId)?.color || "#B0B0B0";
  };

  const getCategoryName = (categoryId: string) => {
    return state.categories.find((c) => c.id === categoryId)?.name || "Other";
  };

  const groupedExpenses = filteredExpenses.reduce(
    (acc, exp) => {
      const date = new Date(exp.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(exp);
      return acc;
    },
    {} as Record<string, typeof state.expenses>
  );

  return (
    <ScreenContainer className="p-4 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Transactions</Text>
          <Text className="text-sm text-muted mt-1">View and manage your expenses</Text>
        </View>

        {/* Search Bar */}
        <View className="mb-4 bg-surface rounded-lg px-4 py-3 border border-border flex-row items-center">
          <Text className="text-lg text-muted mr-2">🔍</Text>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search expenses..."
            placeholderTextColor={colors.muted}
            className="flex-1 text-foreground"
          />
        </View>

        {/* Category Filter */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-muted mb-3">Filter by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              className={cn(
                "mr-3 px-4 py-2 rounded-full border",
                selectedCategory === null
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              )}
            >
              <Text
                className={cn(
                  "text-sm font-medium",
                  selectedCategory === null ? "text-white" : "text-foreground"
                )}
              >
                All
              </Text>
            </TouchableOpacity>
            {state.categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={cn(
                  "mr-3 px-4 py-2 rounded-full border",
                  selectedCategory === category.id
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                )}
              >
                <Text
                  className={cn(
                    "text-sm font-medium",
                    selectedCategory === category.id ? "text-white" : "text-foreground"
                  )}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Transactions List */}
        {filteredExpenses.length === 0 ? (
          <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
            <Text className="text-lg font-semibold text-foreground mb-2">No transactions found</Text>
            <Text className="text-sm text-muted text-center">
              {searchText || selectedCategory ? "Try adjusting your filters" : "Add your first expense to get started"}
            </Text>
          </View>
        ) : (
          <View>
            {Object.entries(groupedExpenses).map(([date, expenses]) => (
              <View key={date} className="mb-6">
                <Text className="text-sm font-semibold text-muted mb-3">{date}</Text>
                {expenses.map((expense) => (
                  <TouchableOpacity
                    key={expense.id}
                    onLongPress={() => {
                      Alert.alert("Delete this expense?", "", [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          onPress: () => deleteExpense(expense.id),
                          style: "destructive",
                        },
                      ]);
                    }}
                    className="bg-surface rounded-xl p-4 mb-3 flex-row items-center justify-between border border-border active:opacity-70"
                  >
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: getCategoryColor(expense.category) + "20" }}
                      >
                        <View
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getCategoryColor(expense.category) }}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">
                          {getCategoryName(expense.category)}
                        </Text>
                        {expense.notes && (
                          <Text className="text-xs text-muted mt-0.5 line-clamp-1">
                            {expense.notes}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text className="text-lg font-bold text-foreground ml-4">
                      {formatCurrency(expense.amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
