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
import { useCreateGoalTransaction } from "@/api/goal-transaction";
import Toast from "react-native-toast-message";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function AddGoalEntryScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams<{
    goalId: string;
    type: string;
  }>();

  const goalId = params.goalId!;
  const entryType = (params.type as "IN" | "OUT") || "IN";

  const createGoalTransactionMutation = useCreateGoalTransaction();

  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

  const isAdd = entryType === "IN";
  const accentColor = isAdd ? colors.primary : colors.error;
  const screenTitle = isAdd ? "Add Funds" : "Withdraw Funds";

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const payload = {
      goal_id: goalId,
      type: entryType,
      amount: parsed,
      remark: remark || undefined,
    };

    try {
      const response: any =
        await createGoalTransactionMutation.mutateAsync(payload);

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
      const errorMessage = e?.message || "Failed to save entry";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    }
  };

  const isPending = createGoalTransactionMutation.isPending;

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
          {/* Type Toggle */}
          {/* <View className="flex-row gap-3 my-6 bg-gray-100 rounded-2xl p-1.5">
            <TouchableOpacity
              onPress={() => setEntryType("IN")}
              className={cn(
                "flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl",
                isAdd ? "bg-white shadow-sm" : "bg-transparent",
              )}
            >
              <PlusCircle
                size={20}
                color={isAdd ? colors.primary : colors.muted}
              />
              <Text
                className={cn(
                  "text-sm font-bold",
                  isAdd ? "text-gray-900" : "text-gray-500",
                )}
              >
                Add
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setEntryType("OUT")}
              className={cn(
                "flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl",
                !isAdd ? "bg-white shadow-sm" : "bg-transparent",
              )}
            >
              <MinusCircle
                size={20}
                color={!isAdd ? colors.error : colors.muted}
              />
              <Text
                className={cn(
                  "text-sm font-bold",
                  !isAdd ? "text-gray-900" : "text-gray-500",
                )}
              >
                Withdraw
              </Text>
            </TouchableOpacity>
          </View> */}

          {/* Amount Input */}
          <View className="mb-6">
            <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Amount
            </Text>
            <View
              className="flex-row items-center rounded-2xl px-5 py-4 border-2"
              style={{
                borderColor: accentColor + "20",
                backgroundColor: accentColor + "05",
              }}
            >
              <Text
                className="text-3xl font-bold"
                style={{ color: accentColor }}
              >
                $
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                className="flex-1 ml-3 text-3xl font-bold text-gray-900"
                autoFocus={true}
              />
            </View>
          </View>

          {/* Remark */}
          <View className="mb-6">
            <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Note (optional)
            </Text>
            <TextInput
              value={remark}
              onChangeText={setRemark}
              placeholder={
                isAdd
                  ? "e.g., Monthly savings, Bonus..."
                  : "e.g., Emergency withdrawal..."
              }
              placeholderTextColor={colors.muted}
              className="bg-gray-100 rounded-2xl px-5 py-4 text-gray-900 text-lg"
              style={{ textAlignVertical: "top", minHeight: 120 }}
              multiline
              numberOfLines={4}
            />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View
          style={{
            position: "absolute",
            bottom: keyboardHeight,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#F3F4F6",
          }}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            className="rounded-2xl py-4.5 items-center justify-center shadow-md active:opacity-90"
            style={{
              backgroundColor: isPending ? accentColor + "80" : accentColor,
            }}
          >
            <Text className="text-white font-extrabold text-base tracking-widest uppercase">
              {isPending
                ? "Saving..."
                : isAdd
                  ? "Save Addition"
                  : "Save Withdrawal"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
