import { useDeleteTransaction, useTransaction } from "@/api/transaction";
import { formatCurrency } from "@/lib/book-utils";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Copy, Edit3, Trash2 } from "lucide-react-native";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookId: string;
    transactionId: string;
  }>();

  const { data: txData, isLoading } = useTransaction(params.transactionId!);
  const deleteTransaction = useDeleteTransaction();

  const transaction = txData?.data;
  const isIn = transaction?.type === "IN";
  const accentColor = isIn ? "#2E7D32" : "#C62828";
  const typeLabelBg = isIn ? "#E8F5E9" : "#FFEBEE";
  const typeLabel = isIn ? "Cash In" : "Cash Out";

  const formattedDate = transaction?.created_at
    ? new Date(transaction.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const formattedTime = transaction?.created_at
    ? new Date(transaction.created_at)
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
        .toLowerCase()
    : "—";

  const updatedDate = transaction?.updated_at
    ? new Date(transaction.updated_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const updatedTime = transaction?.updated_at
    ? new Date(transaction.updated_at)
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
        type: transaction?.type,
        editId: params.transactionId,
        editAmount: transaction?.amount?.toString(),
        editRemark: transaction?.remark || "",
        editType: transaction?.type,
      },
    });
  };

  const handleDuplicate = () => {
    router.push({
      pathname: "/book/add-transaction",
      params: {
        bookId: params.bookId,
        type: transaction?.type,
        editAmount: transaction?.amount?.toString(),
        editRemark: transaction?.remark || "",
        editType: transaction?.type,
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
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6B7280" />
            <Text className="text-gray-500 mt-3 text-sm">Loading...</Text>
          </View>
        ) : (
          <>
            <ScrollView
              className="flex-1 bg-white"
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 40,
              }}
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
                <Text
                  className="text-4xl font-bold"
                  style={{ color: accentColor }}
                >
                  {isIn ? "+" : "-"}
                  {formatCurrency(parseFloat(transaction?.amount || "0"))}
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
                    {transaction?.category?.title || "Uncategorized"}
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
                    {transaction?.remark || "No remark"}
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
                    <Text className="text-gray-900 text-base">
                      {formattedDate}
                    </Text>
                  </View>
                  <View className="flex-1 bg-gray-100 rounded-xl px-4 py-3.5 border border-gray-200">
                    <Text className="text-gray-900 text-base capitalize">
                      {formattedTime}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Book */}
              <View className="mb-5">
                <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                  Book
                </Text>
                <View className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3.5">
                  <Text className="text-base text-gray-900">
                    {transaction?.book?.name || "—"}
                  </Text>
                </View>
              </View>

              {/* Entry By / Updated By */}
              <View className="mb-5">
                <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                  Activity
                </Text>
                <View className="bg-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                  {/* Entry By */}
                  <View
                    className={`px-4 py-4 ${transaction?.updated_by ? "border-b border-gray-200" : ""}`}
                  >
                    <Text className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Added by
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {transaction?.entry_by?.name || "—"}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      {transaction?.entry_by?.email || ""}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-1">
                      {formattedDate} · {formattedTime}
                    </Text>
                  </View>

                  {/* Updated By */}
                  {transaction?.updated_by && (
                    <View className="px-4 py-4">
                      <Text className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Last updated by
                      </Text>
                      {transaction?.updated_by?.name && (
                        <Text className="text-sm font-semibold text-gray-900">
                          {transaction.updated_by.name}
                        </Text>
                      )}
                      <Text className="text-xs text-gray-500 mt-0.5">
                        {transaction.updated_by.email}
                      </Text>
                      <Text className="text-xs text-gray-400 mt-1">
                        {updatedDate} · {updatedTime}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </>
        )}
      </View>
    </>
  );
}
