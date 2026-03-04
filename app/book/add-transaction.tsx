import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  Keyboard,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCreateTransaction, useUpdateTransaction } from "@/api/transaction";
import Toast from "react-native-toast-message";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Paperclip, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

// ─── Types ───────────────────────────────────────────────────────────────────
interface PickedFile {
  uri: string;
  name: string;
  type: string;
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookId: string;
    type: string;
    editId?: string;
    editAmount?: string;
    editRemark?: string;
    editType?: string;
    selectedCategoryId?: string;
    selectedCategoryName?: string;
  }>();

  const bookId = params.bookId!;
  const initialType = (params.type as "IN" | "OUT") || "OUT";
  const isEditing = !!params.editId;

  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();

  const [type, setType] = useState<"IN" | "OUT">(initialType);
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [remark, setRemark] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [attachments, setAttachments] = useState<PickedFile[]>([]);

  useEffect(() => {
    if (isEditing) {
      setType((params.editType as "IN" | "OUT") || initialType);
      setAmount(params.editAmount || "");
      setRemark(params.editRemark || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (params.selectedCategoryId) {
      setSelectedCategory(params.selectedCategoryId);
      setSelectedCategoryName(
        params.selectedCategoryName || "Unknown Category",
      );
    }
  }, [params.selectedCategoryId, params.selectedCategoryName]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ── Attachment picker ──────────────────────────────────────────────────────
  const pickAttachments = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library to add attachments.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const picked: PickedFile[] = result.assets.map((asset) => {
        const ext = asset.uri.split(".").pop() ?? "jpg";
        const name = asset.fileName ?? `attachment_${Date.now()}.${ext}`;
        const type = asset.mimeType ?? `image/${ext}`;
        return { uri: asset.uri, name, type };
      });
      setAttachments((prev) => [...prev, ...picked]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Build FormData ─────────────────────────────────────────────────────────
  const buildFormData = (isUpdate = false) => {
    const dataPayload = isUpdate
      ? {
          amount: parseFloat(amount),
          category_id: !isDeposit
            ? selectedCategory === "other"
              ? undefined
              : selectedCategory
            : undefined,
          remark,
          date: formatDate(date),
          time: formatTime(date),
        }
      : {
          book_id: bookId,
          type,
          amount: parseFloat(amount),
          category_id: !isDeposit
            ? selectedCategory === "other"
              ? undefined
              : selectedCategory
            : undefined,
          remark,
          date: formatDate(date),
          time: formatTime(date),
        };

    const formData = new FormData();
    formData.append("data", JSON.stringify(dataPayload));

    attachments.forEach((file) => {
      formData.append("attachments", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    });

    return formData;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const isDeposit = type === "IN";
  const accentColor = isDeposit ? "#2E7D32" : "#C62828";
  const screenTitle = isEditing
    ? "Edit Transaction"
    : isDeposit
      ? "Cash In"
      : "Cash Out";

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!isDeposit && !selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    try {
      let response: any;

      if (isEditing) {
        response = await updateTransactionMutation.mutateAsync({
          id: params.editId!,
          formData: buildFormData(true),
        });
      } else {
        response = await createTransactionMutation.mutateAsync(buildFormData());
      }

      if (response?.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response?.message,
        });
        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response?.message || "Something went wrong",
        });
      }
    } catch (e: any) {
      console.log("ERROR DATA: ", e?.response?.data);
      const errorMessage =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to save transaction";
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: errorMessage,
      });
    }
  };

  const isPending =
    createTransactionMutation.isPending || updateTransactionMutation.isPending;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: screenTitle,
          headerBackTitle: "Back",
        }}
      />
      <View className="flex-1 bg-white">
        <ScrollView
          className="flex-1 bg-white"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Amount Input */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Amount
            </Text>
            <View
              className="flex-row items-center rounded-xl px-4 py-3.5 border-2"
              style={{
                borderColor: accentColor + "30",
                backgroundColor: accentColor + "08",
              }}
            >
              <Text
                className="text-2xl font-bold"
                style={{ color: accentColor }}
              >
                $
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#A1A1AA"
                keyboardType="decimal-pad"
                className="flex-1 ml-2 text-2xl font-bold text-gray-900"
                autoFocus={true}
              />
            </View>
          </View>

          {/* Category (only for Cash Out) */}
          {!isDeposit && (
            <View className="mb-5">
              <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                Category
              </Text>
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: "/book/select-category",
                    params: {
                      bookId: bookId,
                      currentSelectedId: selectedCategory,
                    },
                  });
                }}
                className="flex-row items-center bg-gray-100 border border-gray-200 rounded-xl px-4 py-3.5"
              >
                <Text
                  className={`flex-1 text-base ${selectedCategoryName ? "text-gray-900" : "text-gray-400"}`}
                >
                  {selectedCategoryName || "Select a category"}
                </Text>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Remark */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Remark
            </Text>
            <TextInput
              value={remark}
              onChangeText={setRemark}
              placeholder={
                isDeposit
                  ? "e.g., Salary, Business income..."
                  : "e.g., Lunch, Uber ride..."
              }
              placeholderTextColor="#A1A1AA"
              className="bg-gray-100 rounded-xl px-4 py-3.5 border border-gray-200 text-gray-900 text-base"
              style={{ textAlignVertical: "top", minHeight: 80 }}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Date & Time */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Date & Time
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="flex-1 bg-gray-100 rounded-xl px-4 py-3.5 border border-gray-200 flex-row items-center justify-between"
              >
                <Text className="text-gray-900 text-base">
                  {date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="flex-1 bg-gray-100 rounded-xl px-4 py-3.5 border border-gray-200 flex-row items-center justify-between"
              >
                <Text className="text-gray-900 text-base">
                  {date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(Platform.OS === "ios");
                  if (selectedTime) {
                    setDate(selectedTime);
                  }
                }}
              />
            )}
          </View>

          {/* ── Attachments ── */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Attachments
            </Text>

            {/* Thumbnail strip */}
            {attachments.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 10 }}
              >
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {attachments.map((file, index) => (
                    <View
                      key={index}
                      style={{ position: "relative", marginRight: 4 }}
                    >
                      <Image
                        source={{ uri: file.uri }}
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: 10,
                          backgroundColor: "#f3f4f6",
                        }}
                      />
                      {/* Remove button */}
                      <TouchableOpacity
                        onPress={() => removeAttachment(index)}
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          backgroundColor: "#fff",
                          borderRadius: 10,
                          padding: 2,
                          shadowColor: "#000",
                          shadowOpacity: 0.15,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <X size={13} color="#374151" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            {/* Pick button */}
            <TouchableOpacity
              onPress={pickAttachments}
              className="flex-row items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-4 py-3.5"
            >
              <Paperclip size={18} color="#6b7280" />
              <Text className="text-gray-500 text-base">
                {attachments.length > 0
                  ? `${attachments.length} file${attachments.length > 1 ? "s" : ""} selected — tap to add more`
                  : "Tap to add attachments"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Submit Button - Sticks above keyboard */}
        <View
          style={{
            position: "absolute",
            bottom: keyboardHeight,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#F3F4F6",
          }}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            className="rounded-xl py-4 items-center justify-center"
            style={{
              backgroundColor: isPending ? accentColor + "80" : accentColor,
            }}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base tracking-wider">
              {isPending
                ? "SAVING..."
                : isEditing
                  ? "SAVE CHANGES"
                  : isDeposit
                    ? "ADD CASH IN"
                    : "ADD CASH OUT"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
