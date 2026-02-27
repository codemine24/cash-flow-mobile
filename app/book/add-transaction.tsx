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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useCreateTransaction, useUpdateTransaction } from "@/api/transaction";
import Toast from "react-native-toast-message";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

const EXPENSE_CATEGORIES = [
  { id: "food", name: "Food", icon: "🍔" },
  { id: "transport", name: "Transport", icon: "🚗" },
  { id: "other", name: "Other", icon: "📝" },
];

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookId: string;
    type: string;
    editId?: string;
    editAmount?: string;
    editRemark?: string;
    editType?: string;
  }>();

  const bookId = params.bookId!;
  const initialType = (params.type as "IN" | "OUT") || "OUT";
  const isEditing = !!params.editId;

  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();

  const [type, setType] = useState<"IN" | "OUT">(initialType);
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("other");
  const [remark, setRemark] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setType((params.editType as "IN" | "OUT") || initialType);
      setAmount(params.editAmount || "");
      setRemark(params.editRemark || "");
      // Note: If the API provided date/time separately in params, we would set them here.
      // For now, we'll keep the current date/time unless passed from [id].tsx
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    const payload = {
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

    let response: any;
    try {
      if (isEditing) {
        const updatePayload = {
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
        response = await updateTransactionMutation.mutateAsync({
          id: params.editId!,
          transaction: updatePayload,
        });
      } else {
        response = await createTransactionMutation.mutateAsync(payload);
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
      console.log("ZOD ERROR DATA: ", e?.response?.data);
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
              <View className="flex-row gap-3">
                {EXPENSE_CATEGORIES.map((category) => {
                  const isSelected = selectedCategory === category.id;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setSelectedCategory(category.id)}
                      className={`flex-1 items-center justify-center py-3 rounded-xl border ${isSelected ? "bg-[#E6F3FF] border-[#2563EB]" : "bg-gray-100 border-red-200"}`}
                    >
                      <Text className="text-2xl mb-1">{category.icon}</Text>
                      <Text
                        style={{ color: isSelected ? "#2563EB" : "#111827" }}
                        className="text-xs font-medium text-center"
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
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
