import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useExpenses } from "@/lib/expense-context";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddExpenseModal({ visible, onClose }: AddExpenseModalProps) {
  const colors = useColors();
  const { state, addExpense } = useExpenses();

  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(state.categories[0]?.id || "");
  const [notes, setNotes] = useState("");
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

  const handleAddExpense = async () => {
    if (!amount || !selectedCategory) {
      alert("Please enter amount and select a category");
      return;
    }

    setIsSubmitting(true);
    try {
      await addExpense({
        amount: parseFloat(amount),
        category: selectedCategory,
        date: date.toISOString().split("T")[0],
        notes,
      });

      // Reset form
      setAmount("");
      setSelectedCategory(state.categories[0]?.id || "");
      setNotes("");
      setDate(new Date());
      onClose();
    } catch (error) {
      console.error("Failed to add expense:", error);
      alert("Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = state.categories.find((c) => c.id === selectedCategory);

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
              <Text className="text-2xl font-bold text-foreground">Add Expense</Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 items-center justify-center"
              >
                <Text className="text-xl text-muted">✕</Text>
              </TouchableOpacity>
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                {state.categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    className={cn(
                      "items-center justify-center mr-4 p-3 rounded-lg border-2",
                      selectedCategory === category.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-surface"
                    )}
                    style={{ minWidth: 70 }}
                  >
                    <View
                      className="w-8 h-8 rounded-full mb-2"
                      style={{ backgroundColor: category.color }}
                    />
                    <Text className="text-xs text-foreground text-center">{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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

            {/* Notes */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-muted mb-2">Notes (Optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add a note..."
                placeholderTextColor={colors.muted}
                className="bg-surface rounded-lg px-4 py-3 border border-border text-foreground"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-8">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-surface rounded-lg py-3 border border-border items-center justify-center"
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddExpense}
                disabled={isSubmitting}
                className={cn(
                  "flex-1 rounded-lg py-3 items-center justify-center",
                  isSubmitting ? "bg-primary/50" : "bg-primary"
                )}
              >
                <Text className="text-background font-semibold">
                  {isSubmitting ? "Adding..." : "Add Expense"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
