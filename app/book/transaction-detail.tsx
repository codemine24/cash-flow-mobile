import { useDeleteTransaction } from "@/api/transaction";
import { formatCurrency } from "@/lib/book-utils";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Copy, Edit3, Trash2 } from "lucide-react-native";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookId: string;
    transactionId: string;
    type: string;
    amount: string;
    remark: string;
    category: string;
    createdAt: string;
    runningBalance: string;
  }>();

  const deleteTransaction = useDeleteTransaction();

  const isIn = params.type === "IN";
  const accentColor = isIn ? "#2E7D32" : "#C62828";
  const typeLabelBg = isIn ? "#E8F5E9" : "#FFEBEE";
  const typeLabel = isIn ? "Cash In" : "Cash Out";

  const formattedDate = params.createdAt
    ? new Date(params.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const formattedTime = params.createdAt
    ? new Date(params.createdAt)
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
        .toLowerCase()
    : "—";

  const handleEdit = () => {
    router.push({
      pathname: "/book/add-transaction",
      params: {
        bookId: params.bookId,
        type: params.type,
        editId: params.transactionId,
        editAmount: params.amount,
        editRemark: params.remark || "",
        editType: params.type,
      },
    });
  };

  const handleDuplicate = () => {
    router.push({
      pathname: "/book/add-transaction",
      params: {
        bookId: params.bookId,
        type: params.type,
        editAmount: params.amount,
        editRemark: params.remark || "",
        editType: params.type,
      },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const res: any = await deleteTransaction.mutateAsync([
              params.transactionId,
            ]);
            if (res?.success) {
              Toast.show({
                type: "success",
                text1: "Transaction deleted successfully",
              });
              router.back();
            } else {
              Toast.show({
                type: "error",
                text1: res?.message || "Failed to delete transaction",
              });
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitle: "Back",
          title: "Transaction Detail",
          headerLeft: () => null,
          headerRight: () => (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <TouchableOpacity
                onPress={handleEdit}
                style={{ padding: 8 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Edit3 size={20} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDuplicate}
                style={{ padding: 8 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Copy size={20} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={{ padding: 8 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View className="flex-1 bg-white">
        <ScrollView
          className="flex-1 bg-white"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Amount Hero */}
          <View
            className="rounded-2xl items-center justify-center mt-5 mb-6 py-10"
            style={{ backgroundColor: accentColor + "12" }}
          >
            <View
              className="px-3 py-1 rounded-full mb-3"
              style={{ backgroundColor: typeLabelBg }}
            >
              <Text
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                {typeLabel}
              </Text>
            </View>
            <Text className="text-4xl font-bold" style={{ color: accentColor }}>
              {isIn ? "+" : "-"}
              {formatCurrency(parseFloat(params.amount || "0"))}
            </Text>
            <Text className="text-gray-500 text-sm mt-2">
              {formattedDate} · {formattedTime}
            </Text>
          </View>

          {/* Category */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Category
            </Text>
            <View className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3.5">
              <Text className="text-base text-gray-900">
                {params.category || "—"}
              </Text>
            </View>
          </View>

          {/* Remark */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Remark
            </Text>
            <View
              className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3.5"
              style={{ minHeight: 80 }}
            >
              <Text className="text-base text-gray-900">
                {params.remark || "No remark"}
              </Text>
            </View>
          </View>

          {/* Date & Time */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Date & Time
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-gray-100 rounded-xl px-4 py-3.5 border border-gray-200">
                <Text className="text-gray-900 text-base">{formattedDate}</Text>
              </View>
              <View className="flex-1 bg-gray-100 rounded-xl px-4 py-3.5 border border-gray-200">
                <Text className="text-gray-900 text-base capitalize">
                  {formattedTime}
                </Text>
              </View>
            </View>
          </View>

          {/* Balance After */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Balance After
            </Text>
            <View className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3.5">
              <Text className="text-base text-gray-900 font-semibold">
                {formatCurrency(parseFloat(params.runningBalance || "0"))}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons — sticky at bottom, same pattern as add-transaction */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 12,
            paddingBottom: 32,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#F3F4F6",
            flexDirection: "row",
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={handleEdit}
            activeOpacity={0.8}
            className="flex-1 flex-row items-center justify-center rounded-xl py-4 border border-gray-200 gap-2"
          >
            <Edit3 size={16} color="#374151" />
            <Text className="text-gray-700 font-bold text-sm tracking-wider">
              EDIT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDuplicate}
            activeOpacity={0.8}
            className="flex-1 flex-row items-center justify-center rounded-xl py-4 border border-gray-200 gap-2"
          >
            <Copy size={16} color="#374151" />
            <Text className="text-gray-700 font-bold text-sm tracking-wider">
              DUPLICATE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.8}
            className="flex-1 flex-row items-center justify-center rounded-xl py-4 bg-red-50 border border-red-100 gap-2"
          >
            <Trash2 size={16} color="#EF4444" />
            <Text className="text-red-500 font-bold text-sm tracking-wider">
              DELETE
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
