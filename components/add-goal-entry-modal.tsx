import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useGoals } from "@/lib/goal-context";
import { useColors } from "@/hooks/use-colors";
import { PlusCircle, MinusCircle } from "lucide-react-native";
import { cn } from "@/lib/utils";

interface AddGoalEntryModalProps {
  visible: boolean;
  goalId: string;
  onClose: () => void;
}

type EntryType = "add" | "withdraw";

export function AddGoalEntryModal({ visible, goalId, onClose }: AddGoalEntryModalProps) {
  const colors = useColors();
  const { addEntry } = useGoals();
  const [entryType, setEntryType] = useState<EntryType>("add");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdd = entryType === "add";

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

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className="mt-auto bg-background rounded-t-3xl p-6"
            style={{ maxHeight: "85%" }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-foreground">Add Entry</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Text className="text-xl text-muted">✕</Text>
                </TouchableOpacity>
              </View>

              {/* Type toggle — same pill style as transaction modal */}
              <View className="flex-row gap-3 mb-6 bg-surface rounded-lg p-1 border border-border">
                <TouchableOpacity
                  onPress={() => setEntryType("add")}
                  className={cn(
                    "flex-1 flex-row items-center justify-center gap-2 py-2 rounded-md",
                    isAdd ? "bg-primary" : "bg-transparent"
                  )}
                >
                  <PlusCircle size={16} color={isAdd ? "#fff" : colors.muted} />
                  <Text className={cn("text-sm font-semibold", isAdd ? "text-white" : "text-foreground")}>
                    Add Funds
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setEntryType("withdraw")}
                  className={cn(
                    "flex-1 flex-row items-center justify-center gap-2 py-2 rounded-md",
                    !isAdd ? "bg-error" : "bg-transparent"
                  )}
                >
                  <MinusCircle size={16} color={!isAdd ? "#fff" : colors.muted} />
                  <Text className={cn("text-sm font-semibold", !isAdd ? "text-white" : "text-foreground")}>
                    Withdraw
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Amount — same large $ style as transaction modal */}
              <Text className="text-sm font-semibold text-muted mb-2">Amount</Text>
              <View className="flex-row items-center bg-surface rounded-lg px-4 py-3 border border-border mb-6">
                <Text className="text-2xl font-bold text-primary">$</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  className="flex-1 ml-2 text-2xl font-bold text-foreground"
                  autoFocus
                  editable={!isSubmitting}
                />
              </View>

              {/* Note */}
              <Text className="text-sm font-semibold text-muted mb-2">Note (optional)</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="e.g., Monthly savings deposit"
                placeholderTextColor={colors.muted}
                className="bg-surface rounded-lg px-4 py-3 border border-border text-foreground mb-8"
                editable={!isSubmitting}
              />

              {/* Action buttons */}
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
                  className={cn(
                    "flex-1 rounded-lg py-3 items-center justify-center",
                    isSubmitting
                      ? "bg-primary/50"
                      : isAdd
                        ? "bg-primary"
                        : "bg-error"
                  )}
                >
                  <Text className="text-background font-semibold">
                    {isSubmitting ? "Saving..." : isAdd ? "Add" : "Withdraw"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
