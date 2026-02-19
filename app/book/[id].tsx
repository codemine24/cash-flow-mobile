import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useBooks } from "@/lib/book-context";
import { calculateBookBalance, formatCurrency } from "@/lib/book-utils";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useState } from "react";
import { AddTransactionModal } from "@/components/add-transaction-modal";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { state, deleteTransaction } = useBooks();
  const [showAddModal, setShowAddModal] = useState(false);

  const book = state.books.find((b) => b.id === id);

  if (!book) {
    return (
      <ScreenContainer className="p-4 items-center justify-center">
        <Text className="text-foreground">Book not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const { totalIn, totalOut, balance } = calculateBookBalance(book);

  const handleDeleteTransaction = (transactionId: string) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => deleteTransaction(book.id, transactionId),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: book.name, headerBackTitle: "Books" }} />
      <ScreenContainer className="p-4 bg-background">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header Card */}
          <View className="bg-surface rounded-xl p-6 mb-6 border border-border">
            <Text className="text-muted text-center mb-2">Current Balance</Text>
            <Text
              className={`text-4xl font-bold text-center mb-6 ${balance >= 0 ? "text-success" : "text-error"
                }`}
            >
              {formatCurrency(balance)}
            </Text>

            <View className="flex-row gap-4">
              <View className="flex-1 bg-background rounded-lg p-3 border border-border items-center">
                <Text className="text-xs text-muted font-medium mb-1">Income</Text>
                <Text className="text-lg font-bold text-success">{formatCurrency(totalIn)}</Text>
              </View>
              <View className="flex-1 bg-background rounded-lg p-3 border border-border items-center">
                <Text className="text-xs text-muted font-medium mb-1">Expenses</Text>
                <Text className="text-lg font-bold text-error">{formatCurrency(totalOut)}</Text>
              </View>
            </View>
          </View>

          {/* Transactions List */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-foreground">Transactions</Text>
          </View>

          {book.transactions.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">No transactions</Text>
              <Text className="text-sm text-muted text-center">
                Add your first transaction to start tracking
              </Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={[...book.transactions].reverse()} // Show newest first
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onLongPress={() => handleDeleteTransaction(item.id)}
                  className="bg-surface rounded-xl p-4 mb-3 border border-border flex-row items-center justify-between active:opacity-70"
                >
                  <View className="flex-1 mr-4">
                    <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                      {item.description || item.category}
                    </Text>
                    <Text className="text-xs text-muted mt-1">
                      {new Date(item.date).toLocaleDateString()} • {item.category}
                    </Text>
                  </View>
                  <Text
                    className={`text-lg font-bold ${item.type === "deposit" ? "text-success" : "text-error"
                      }`}
                  >
                    {item.type === "deposit" ? "+" : "-"}
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
        <IconSymbol size={24} name="plus" color="white" />
      </TouchableOpacity>

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        bookId={book.id}
      />
    </>
  );
}
