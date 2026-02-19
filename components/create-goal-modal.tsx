import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { useGoals } from "@/lib/goal-context";
import { useColors } from "@/hooks/use-colors";

interface CreateGoalModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateGoalModal({ visible, onClose }: CreateGoalModalProps) {
  const colors = useColors();
  const { addGoal } = useGoals();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a goal name");
      return;
    }
    const targetAmount = parseFloat(target);
    if (!target || isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert("Error", "Please enter a valid target amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await addGoal(name.trim(), targetAmount);
      setName("");
      setTarget("");
      onClose();
    } catch {
      Alert.alert("Error", "Failed to create goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setTarget("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-background rounded-2xl p-6 w-full max-w-xs shadow-lg">
          <Text className="text-xl font-bold text-foreground mb-4">Create New Goal</Text>

          {/* Goal name input */}
          <Text className="text-sm font-medium text-foreground mb-1">Goal name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g., Emergency Fund"
            placeholderTextColor={colors.muted}
            className="bg-surface rounded-lg px-4 py-3 border border-border text-foreground mb-4"
            editable={!isSubmitting}
          />

          {/* Target amount input */}
          <Text className="text-sm font-medium text-foreground mb-1">Target amount ($)</Text>
          <TextInput
            value={target}
            onChangeText={setTarget}
            placeholder="e.g., 5000"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
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
              onPress={handleCreate}
              disabled={isSubmitting}
              className={`flex-1 rounded-lg py-3 items-center justify-center ${isSubmitting ? "bg-primary/50" : "bg-primary"}`}
            >
              <Text className="text-background font-semibold">
                {isSubmitting ? "Creating..." : "Create"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
