import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { useGoals } from "@/lib/goal-context";
import { useColors } from "@/hooks/use-colors";
import { PlusCircle, MinusCircle } from "lucide-react-native";

interface AddGoalEntryModalProps {
  visible: boolean;
  goalId: string;
  onClose: () => void;
}

// The entry type toggles between "add" (saving) and "withdraw" (spending)
type EntryType = "add" | "withdraw";

export function AddGoalEntryModal({ visible, goalId, onClose }: AddGoalEntryModalProps) {
  const colors = useColors();
  const { addEntry } = useGoals();
  const [entryType, setEntryType] = useState<EntryType>("add");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await addEntry(goalId, {
        type: entryType,
        amount: parsed,
        note: note.trim(),
        date: new Date().toISOString(),
      });
      setAmount("");
      setNote("");
      setEntryType("add");
      onClose();
    } catch {
      Alert.alert("Error", "Failed to save entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setNote("");
    setEntryType("add");
    onClose();
  };

  const isAdd = entryType === "add";

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-background rounded-2xl p-6 w-full max-w-xs shadow-lg">
          <Text className="text-xl font-bold text-foreground mb-4">Add Entry</Text>

          {/* Toggle: Add / Withdraw */}
          <View className="flex-row gap-2 mb-5 bg-surface rounded-xl p-1 border border-border">
            <TouchableOpacity
              onPress={() => setEntryType("add")}
              className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-lg ${isAdd ? "bg-primary" : "bg-transparent"}`}
            >
              <PlusCircle size={16} color={isAdd ? "#fff" : colors.muted} />
              <Text className={`text-sm font-semibold ${isAdd ? "text-white" : "text-muted"}`}>
                Add
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setEntryType("withdraw")}
              className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-lg ${!isAdd ? "bg-error" : "bg-transparent"}`}
            >
              <MinusCircle size={16} color={!isAdd ? "#fff" : colors.muted} />
              <Text className={`text-sm font-semibold ${!isAdd ? "text-white" : "text-muted"}`}>
                Withdraw
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <Text className="text-sm font-medium text-foreground mb-1">Amount ($)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            className="bg-surface rounded-lg px-4 py-3 border border-border text-foreground mb-4"
            editable={!isSubmitting}
          />

          {/* Note (optional) */}
          <Text className="text-sm font-medium text-foreground mb-1">Note (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="e.g., Monthly savings"
            placeholderTextColor={colors.muted}
            className="bg-surface rounded-lg px-4 py-3 border border-border text-foreground mb-6"
            editable={!isSubmitting}
          />

          {/* Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleClose}
              disabled={isSubmitting}
              className="flex-1 bg-surface rounded-lg py-3 border border-border items-center justify-center"
            >
              <Text className="text-foreground font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 rounded-lg py-3 items-center justify-center ${isSubmitting
                  ? "bg-primary/50"
                  : isAdd
                    ? "bg-primary"
                    : "bg-error"
                }`}
            >
              <Text className="text-background font-semibold">
                {isSubmitting ? "Saving..." : isAdd ? "Add" : "Withdraw"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
