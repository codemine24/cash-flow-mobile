import { useBook } from "@/api/books";
import { useDeleteTransaction } from "@/api/transaction";
import { AddTransactionModal } from "@/components/add-transaction-modal";
import { ScreenContainer } from "@/components/screen-container";

import { formatCurrency } from "@/lib/book-utils";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: book, isLoading } = useBook(id!);
  const deleteTransaction = useDeleteTransaction();
  const [showAddModal, setShowAddModal] = useState(false);
  const [defaultType, setDefaultType] = useState<"IN" | "OUT">("OUT");

  if (isLoading) {
    return (
      <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
        <Text className="text-muted">Loading...</Text>
      </View>
    );
  }

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

  const handleDeleteTransaction = async (transactionId: string) => {
    const res: any = await deleteTransaction.mutateAsync([transactionId]);

    if (res?.success) {
      Toast.show({
        type: "success",
        text1: "Transaction deleted successfully",
      });
    } else {
      Toast.show({
        type: "error",
        text1: res?.message || "Failed to delete transaction",
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{ title: book.data.name, headerBackTitle: "Books" }}
      />
      <ScreenContainer className="p-4 bg-background">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header Card */}
          <View className="bg-surface rounded-xl p-6 mb-6 border border-border">
            <Text className="text-muted text-center mb-2 text-lg">
              Current Balance
            </Text>
            <Text
              className={`text-4xl font-bold text-center mb-6 ${book.data.balance >= 0 ? "text-success" : "text-error"
                }`}
            >
              {formatCurrency(book.data.balance)}
            </Text>

            <View className="flex-row gap-4">
              <View className="flex-1 bg-background rounded-lg p-3 border border-border items-center">
                <Text className="text-xs text-muted font-medium mb-1">
                  Income
                </Text>
                <Text className="text-lg font-bold text-success">
                  {formatCurrency(book.data.in)}
                </Text>
              </View>
              <View className="flex-1 bg-background rounded-lg p-3 border border-border items-center">
                <Text className="text-xs text-muted font-medium mb-1">
                  Expenses
                </Text>
                <Text className="text-lg font-bold text-error">
                  {formatCurrency(book.data.out)}
                </Text>
              </View>
            </View>
          </View>

          {/* Transactions List */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-foreground">
              Transactions
            </Text>
          </View>

          {book.data.transactions.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">
                No transactions
              </Text>
              <Text className="text-sm text-muted text-center">
                Add your first transaction to start tracking
              </Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={[...book.data.transactions].reverse()} // Show newest first
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    onLongPress={() => handleDeleteTransaction(item.id)}
                    className="bg-surface rounded-xl p-4 mb-3 border border-border flex-row items-center justify-between active:opacity-70"
                  >
                    <View className="flex-1 mr-4">
                      <Text
                        className="text-base font-semibold text-foreground"
                        numberOfLines={1}
                      >
                        {item.remark || item.category}
                      </Text>
                      <Text className="text-xs text-muted mt-1">
                        {new Date(item.created_at).toLocaleDateString()} •{" "}
                        {item.category}
                      </Text>
                    </View>
                    <Text
                      className={`text-lg font-bold ${item.type === "IN" ? "text-success" : "text-error"
                        }`}
                    >
                      {item.type === "IN" ? "+" : "-"}
                      {formatCurrency(item.amount)}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </ScrollView>
      </ScreenContainer>

      {/* Floating Action Button */}
      {/* Floating Action Buttons */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingBottom: 32,
          paddingTop: 12,
          backgroundColor: "#FFFFFF",
          gap: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setDefaultType("IN");
            setShowAddModal(true);
          }}
          style={{
            flex: 1,
            backgroundColor: "#2E7D32",
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 14,
              letterSpacing: 1,
            }}
          >
            + CASH IN
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setDefaultType("OUT");
            setShowAddModal(true);
          }}
          style={{
            flex: 1,
            backgroundColor: "#C62828",
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 14,
              letterSpacing: 1,
            }}
          >
            - CASH OUT
          </Text>
        </TouchableOpacity>
      </View>

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        bookId={book.data.id}
        initialType={defaultType}
      />
    </>
  );
}
