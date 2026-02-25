import { useBook } from "@/api/books";
import { useDeleteTransaction } from "@/api/transaction";
import { AddTransactionModal } from "@/components/add-transaction-modal";
import { ScreenContainer } from "@/components/screen-container";

import { formatCurrency } from "@/lib/book-utils";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import Popover from 'react-native-popover-view';
import { MoreVertical, Edit3, Trash2, MoreHorizontal } from "lucide-react-native";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: book, isLoading } = useBook(id!);
  const deleteTransaction = useDeleteTransaction();
  const [showAddModal, setShowAddModal] = useState(false);
  const [defaultType, setDefaultType] = useState<"IN" | "OUT">("OUT");
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [activeMenuTransaction, setActiveMenuTransaction] = useState<string | null>(null);

  console.log("book.......", JSON.stringify(book?.data, null, 2));

  const groupedTransactions = useMemo(() => {
    if (!book?.data?.transactions) return [];

    const sorted = [...book.data.transactions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    let runningBalance = book.data.balance;
    const annotated = sorted.map((t) => {
      const current = runningBalance;
      const amountValue = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
      if (t.type === "IN") {
        runningBalance -= amountValue;
      } else {
        runningBalance += amountValue;
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
    setActiveMenuTransaction(null);
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
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
          },
        },
      ]
    );
  };

  const handleEditTransaction = (item: any) => {
    setActiveMenuTransaction(null);
    setEditingTransaction(item);
    setShowAddModal(true);
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
        <View className="bg-white mt-4 rounded-2xl mb-6 shadow-sm border border-border">
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
        <View className="flex-row items-center justify-center mb-5 px-6 rounded-2xl">
          <View className="flex-1 h-[1px] bg-gray-200" />
          <Text className="text-gray-500 font-medium text-[11px] mx-4 tracking-wide">
            Showing {book?.data?.transactions?.length} entries
          </Text>
          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>

        {/* Transactions List */}
        {book?.data?.transactions?.length === 0 ? (
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
                  <View
                    key={item.id}
                    className={`px-4 py-4 flex-row justify-between bg-white ${index !== group.data.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                  >
                    <View className="flex-1 mr-2 ">
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="bg-[#E6F3FF] px-2 py-[2px] rounded">
                          <Text className="text-primary text-[11px] font-bold uppercase tracking-wider">
                            {item.category || "Cash in"}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-sm mb-2 font-medium">
                        {item.remark || item.category || "No remark"}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Added on{" "}
                        {new Date(item.created_at).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        }).toLowerCase()}
                      </Text>
                    </View>
                    <View className="items-end ">
                      <Text
                        className={`text-sm font-bold mb-1 ${item.type === "IN" ? "text-[#2E7D32]" : "text-[#C62828]"
                          }`}
                      >
                        {formatCurrency(item.amount)}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Balance: {formatCurrency(item.runningBalance)}
                      </Text>
                      {/* 3-Dot Menu */}
                      <Popover
                        isVisible={activeMenuTransaction === item.id}
                        onRequestClose={() => setActiveMenuTransaction(null)}
                        from={(
                          <TouchableOpacity
                            onPress={() => setActiveMenuTransaction(item.id)}
                            className="p-1 items-center justify-center -mr-1"
                          >
                            <MoreHorizontal size={18} color="#9CA3AF" />
                          </TouchableOpacity>
                        )}
                        backgroundStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                        popoverStyle={{ borderRadius: 12, padding: 4, width: 160, backgroundColor: 'white' }}
                      >
                        <View>
                          <TouchableOpacity
                            className="flex-row items-center px-4 py-3 border-b border-gray-100"
                            onPress={() => handleEditTransaction(item)}
                          >
                            <Edit3 size={18} color="#374151" />
                            <Text className="text-gray-700 ml-3 font-medium">Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="flex-row items-center px-4 py-3"
                            onPress={() => handleDeleteTransaction(item.id)}
                          >
                            <Trash2 size={18} color="#EF4444" />
                            <Text className="text-red-500 ml-3 font-medium">Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </Popover>
                    </View>

                  </View>
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
          className="rounded-2xl"
          style={{
            flex: 1,
            backgroundColor: "#2E7D32",
            paddingVertical: 14,
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
          className="rounded-2xl"
          style={{
            flex: 1,
            backgroundColor: "#C62828",
            paddingVertical: 14,
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
        onClose={() => {
          setShowAddModal(false);
          setEditingTransaction(null);
        }}
        bookId={book.data.id}
        initialType={defaultType}
        editTransaction={editingTransaction}
      />
    </>
  );
}
