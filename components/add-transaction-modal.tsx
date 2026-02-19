import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useBooks } from "@/lib/book-context";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface AddTransactionModalProps {
  visible: boolean;
  bookId: string;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "food", name: "Food", icon: "🍔" },
  { id: "transport", name: "Transport", icon: "🚗" },
  { id: "entertainment", name: "Entertainment", icon: "🎬" },
  { id: "shopping", name: "Shopping", icon: "🛍️" },
  { id: "utilities", name: "Utilities", icon: "💡" },
  { id: "health", name: "Health", icon: "🏥" },
  { id: "salary", name: "Salary", icon: "💰" },
  { id: "other", name: "Other", icon: "📝" },
];

export function AddTransactionModal({
  visible,
  bookId,
  onClose,
}: AddTransactionModalProps) {
  const colors = useColors();
  const { addTransaction } = useBooks();

  const [type, setType] = useState<"deposit" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("other");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleAddTransaction = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert("Error", "Please enter amount and select a category");
      return;
    }

    setIsSubmitting(true);
    try {
      await addTransaction(bookId, {
        type,
        amount: parseFloat(amount),
        category: selectedCategory,
        description,
        date: date.toISOString().split("T")[0],
      });

      // Reset form
      setAmount("");
      setSelectedCategory("other");
      setDescription("");
      setDate(new Date());
      setType("expense");
      onClose();
    } catch (error) {
      console.error("Failed to add transaction:", error);
      Alert.alert("Error", "Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50">
        <View
          className="mt-auto bg-background rounded-t-3xl p-6"
          style={{ maxHeight: "90%" }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-foreground">Add Transaction</Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 items-center justify-center"
              >
                <Text className="text-xl text-muted">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Type Toggle */}
            <View className="flex-row gap-3 mb-6 bg-surface rounded-lg p-1 border border-border">
              {(["deposit", "expense"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  className={cn(
                    "flex-1 py-2 rounded-md items-center justify-center",
                    type === t ? "bg-primary" : "bg-transparent"
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-semibold capitalize",
                      type === t ? "text-white" : "text-foreground"
                    )}
                  >
                    {t === "deposit" ? "💰 Deposit" : "💸 Expense"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-muted mb-2">Amount</Text>
              <View className="flex-row items-center bg-surface rounded-lg px-4 py-3 border border-border">
                <Text className="text-2xl font-bold text-primary">$</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  className="flex-1 ml-2 text-2xl font-bold text-foreground"
                />
              </View>
            </View>

            {/* Category Selection */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-muted mb-3">Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    className={cn(
                      "items-center justify-center p-3 rounded-lg border-2",
                      selectedCategory === category.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-surface"
                    )}
                    style={{ width: "30%" }}
                  >
                    <Text className="text-2xl mb-1">{category.icon}</Text>
                    <Text className="text-xs text-foreground text-center">
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Picker */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-muted mb-2">Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-surface rounded-lg px-4 py-3 border border-border"
              >
                <Text className="text-foreground">
                  {date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-muted mb-2">Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add a note..."
                placeholderTextColor={colors.muted}
                className="bg-surface rounded-lg px-4 py-3 border border-border text-foreground"
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-8">
              <TouchableOpacity
                onPress={onClose}
                disabled={isSubmitting}
                className="flex-1 bg-surface rounded-lg py-3 border border-border items-center justify-center"
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddTransaction}
                disabled={isSubmitting}
                className={cn(
                  "flex-1 rounded-lg py-3 items-center justify-center",
                  isSubmitting ? "bg-primary/50" : "bg-primary"
                )}
              >
                <Text className="text-background font-semibold">
                  {isSubmitting ? "Adding..." : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
