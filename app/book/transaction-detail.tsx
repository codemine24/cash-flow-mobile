import { useDeleteTransaction, useTransaction } from "@/api/transaction";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatCurrency } from "@/lib/book-utils";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  BookOpen,
  Calendar,
  Clock,
  Copy,
  Edit3,
  MessageSquare,
  Tag,
  Trash2,
} from "lucide-react-native";

import { useAuth } from "@/context/auth-context";
import Toast from "react-native-toast-message";

// ── helper: avatar (real image or initials fallback) ─────────────────────────
const SUPABASE_AVATAR_BASE =
  "https://uxrythodzgdirjlbmkxx.supabase.co/storage/v1/object/public/user/";

function Avatar({
  name,
  avatarFile,
  size = 36,
}: {
  name?: string;
  avatarFile?: string;
  size?: number;
}) {
  const uri = avatarFile ? `${SUPABASE_AVATAR_BASE}${avatarFile}` : undefined;
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#e5e7eb",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} />
      ) : (
        <Text
          style={{ fontSize: size * 0.36, fontWeight: "700", color: "#6b7280" }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}

// ── helpers: divider + info row ──────────────────────────────────────────────
function Divider() {
  return (
    <View
      style={{ height: 1, backgroundColor: "#f3f4f6", marginHorizontal: 20 }}
    />
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
        gap: 14,
      }}
    >
      <View style={{ width: 20, alignItems: "center" }}>{icon}</View>
      <Text style={{ flex: 1, fontSize: 14, color: "#6b7280" }}>{label}</Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#111827",
          maxWidth: "55%",
          textAlign: "right",
        }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

// ── main screen ──────────────────────────────────────────────────────────────
export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookId: string;
    transactionId: string;
  }>();

  const { authState } = useAuth();
  const { data: txData, isLoading } = useTransaction(params.transactionId!);
  const deleteTransaction = useDeleteTransaction();

  const transaction = txData?.data;
  const canDelete =
    !!authState.user?.id && authState.user.id === transaction?.entry_by_id;
  const isIn = transaction?.type === "IN";
  const accentColor = isIn ? "#16a34a" : "#dc2626";
  const headerBg = isIn ? "#16a34a" : "#dc2626";
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
        .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
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
        .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
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
            const res: any = await deleteTransaction.mutateAsync(
              params.transactionId,
            );

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
          headerStyle: { backgroundColor: headerBg },
          headerTintColor: "#fff",
          headerTitleStyle: { color: "#fff", fontWeight: "700" },
          headerRight: () => (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <TouchableOpacity
                onPress={handleEdit}
                style={{ padding: 8 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Edit3 size={20} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDuplicate}
                style={{ padding: 8 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Copy size={20} color="#ffffff" />
              </TouchableOpacity>
              {canDelete && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={{ padding: 8 }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={20} color="#fca5a5" />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />

      <View style={{ flex: 1, backgroundColor: headerBg }}>
        {isLoading ? (
          <View
            style={{
              flex: 1,
              backgroundColor: "#f9fafb",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="large" color="#6B7280" />
            <Text style={{ color: "#6B7280", marginTop: 12, fontSize: 14 }}>
              Loading...
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Colored Header: Amount ── */}
            <View
              style={{
                alignItems: "center",
                paddingTop: 28,
                paddingBottom: 36,
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 12,
                  fontWeight: "600",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {typeLabel}
              </Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 44,
                  fontWeight: "800",
                  letterSpacing: -1,
                }}
              >
                {isIn ? "+" : "-"}
                {formatCurrency(parseFloat(transaction?.amount || "0"))}
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 13,
                  marginTop: 8,
                }}
              >
                {formattedDate} · {formattedTime}
              </Text>
            </View>

            {/* ── Receipt Sheet ── */}
            <View
              style={{
                flex: 1,
                backgroundColor: "#fff",
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingTop: 8,
                paddingBottom: 40,
              }}
            >
              {/* Drag handle decoration */}
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#e5e7eb",
                  alignSelf: "center",
                  marginBottom: 20,
                }}
              />

              {/* Section: Details */}
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#9ca3af",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  paddingHorizontal: 20,
                  marginBottom: 4,
                }}
              >
                Details
              </Text>

              <InfoRow
                icon={<Tag size={16} color="#9ca3af" />}
                label="Category"
                value={transaction?.category?.title || "Uncategorized"}
              />
              <Divider />
              <InfoRow
                icon={<MessageSquare size={16} color="#9ca3af" />}
                label="Remark"
                value={transaction?.remark || "No remark"}
              />
              <Divider />
              <InfoRow
                icon={<Calendar size={16} color="#9ca3af" />}
                label="Date"
                value={formattedDate}
              />
              <Divider />
              <InfoRow
                icon={<Clock size={16} color="#9ca3af" />}
                label="Time"
                value={formattedTime}
              />
              <Divider />
              <InfoRow
                icon={<BookOpen size={16} color="#9ca3af" />}
                label="Book"
                value={transaction?.book?.name || "—"}
              />

              {/* Section: Activity */}
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#9ca3af",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  paddingHorizontal: 20,
                  marginTop: 28,
                  marginBottom: 4,
                }}
              >
                Activity
              </Text>

              {/* Added by */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  gap: 14,
                }}
              >
                <Avatar
                  name={transaction?.entry_by?.name}
                  avatarFile={transaction?.entry_by?.avatar}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {transaction?.entry_by?.name || "—"}
                  </Text>
                  {transaction?.entry_by?.email ? (
                    <Text
                      style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}
                    >
                      {transaction.entry_by.email}
                    </Text>
                  ) : null}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: accentColor,
                      marginBottom: 2,
                    }}
                  >
                    Added
                  </Text>
                  <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                    {formattedDate}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                    {formattedTime}
                  </Text>
                </View>
              </View>

              {transaction?.updated_by && (
                <>
                  <Divider />
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      gap: 14,
                    }}
                  >
                    <Avatar
                      name={transaction.updated_by.name}
                      avatarFile={transaction.updated_by.avatar}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {transaction.updated_by.name || "—"}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}
                      >
                        {transaction.updated_by.email}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: "#f59e0b",
                          marginBottom: 2,
                        }}
                      >
                        Updated
                      </Text>
                      <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                        {updatedDate}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                        {updatedTime}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}
