import { useBook } from "@/api/books";
import { useDeleteTransaction } from "@/api/transaction";
import { AddTransactionModal } from "@/components/add-transaction-modal";
import { ScreenContainer } from "@/components/screen-container";

import { formatCurrency } from "@/lib/book-utils";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useMemo, useState } from "react";
import {
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

  const groupedTransactions = useMemo(() => {
    if (!book?.data?.transactions) return [];

    const sorted = [...book.data.transactions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    let runningBalance = book.data.balance;
    const annotated = sorted.map((t) => {
      const current = runningBalance;
      if (t.type === "IN") {
        runningBalance -= t.amount;
      } else {
        runningBalance += t.amount;
      }
      return { ...t, runningBalance: current };
    });

    const groups: { date: string; data: typeof annotated }[] = [];
    annotated.forEach((t) => {
      const date = new Date(t.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const group = groups.find((g) => g.date === date);
      if (group) {
        group.data.push(t);
      } else {
        groups.push({ date, data: [t] });
      }
    });

    return groups;
  }, [book?.data?.transactions, book?.data?.balance]);

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
      {/* <ScreenContainer className="px-4"> */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        // contentContainerStyle={{ paddingBottom: 100 }}
        className="px-4"
      >
        {/* Header Card */}
        <View className="bg-white mt-4 rounded mb-6 shadow-sm border border-border ">
          <View className="px-4 py-4 flex-row justify-between items-center border-b border-border">
            <Text className="text-gray-900 font-bold text-[15px]">Net Balance</Text>
            <Text className="text-gray-900 font-bold text-[15px]">
              {formatCurrency(book.data.balance)}
            </Text>
          </View>
          <View className="px-4 py-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-900 font-bold text-[13px]">Total In (+)</Text>
              <Text className="text-[#2E7D32] font-semibold text-[13px]">
                {formatCurrency(book.data.in)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-900 font-bold text-[13px]">Total Out (-)</Text>
              <Text className="text-[#C62828] font-semibold text-[13px]">
                {formatCurrency(book.data.out)}
              </Text>
            </View>
          </View>
        </View>

        {/* Showing X entries */}
        <View className="flex-row items-center justify-center mb-5 px-6">
          <View className="flex-1 h-[1px] bg-gray-200" />
          <Text className="text-gray-500 font-medium text-[11px] mx-4 tracking-wide">
            Showing {book.data.transactions.length} entries
          </Text>
          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>

        {/* Transactions List */}
        {book.data.transactions.length === 0 ? (
          <View className="mx-4 bg-white rounded-xl p-8 items-center justify-center border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              No transactions
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              Add your first transaction to start tracking
            </Text>
          </View>
        ) : (
          <View className="bg-transparent w-full">
            {groupedTransactions.map((group) => (
              <View key={group.date}>
                {/* Date Header: Full width */}
                <View className="bg-[#f0f0f0] py-2 px-4 border-y border-gray-200">
                  <Text className="text-gray-500 text-[13px] font-bold tracking-wide">
                    {group.date}
                  </Text>
                </View>

                {/* Transactions */}
                {group.data.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    onLongPress={() => handleDeleteTransaction(item.id)}
                    delayLongPress={200}
                    activeOpacity={0.7}
                    className={`px-4 py-4 flex-row justify-between bg-white ${index !== group.data.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                  >
                    <View className="flex-1 mr-2">
                      <View className="bg-[#E6F3FF] self-start px-2 py-[2px] rounded mb-2">
                        <Text className="text-[#0E5B8E] text-[11px] font-bold uppercase tracking-wider">
                          {item.category || "Cash"}
                        </Text>
                      </View>
                      <Text className="text-gray-900 text-[15px] mb-2 font-medium tracking-tight">
                        {item.remark || item.category || "No remark"}
                      </Text>
                      <Text className="text-[12px] text-gray-500">
                        <Text className="text-[#51449B] font-bold">Entry by You</Text> at{" "}
                        {new Date(item.created_at).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        }).toLowerCase()}
                      </Text>
                    </View>
                    <View className="items-end pt-1">
                      <Text
                        className={`text-[16px] font-bold mb-1 ${item.type === "IN" ? "text-[#2E7D32]" : "text-[#C62828]"
                          }`}
                      >
                        {formatCurrency(item.amount)}
                      </Text>
                      <Text className="text-[11px] text-gray-500 font-medium tracking-tight">
                        Balance: {formatCurrency(item.runningBalance)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      {/* </ScreenContainer> */}

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
