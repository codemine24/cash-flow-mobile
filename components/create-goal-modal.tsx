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
} from "react-native";
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
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-foreground">New Goal</Text>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 items-center justify-center"
              >
                <Text className="text-xl text-muted">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Goal name */}
            <Text className="text-sm font-semibold text-muted mb-2">Goal name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Emergency Fund"
              placeholderTextColor={colors.muted}
              className="bg-surface rounded-lg px-4 py-3 border border-border text-foreground mb-4"
              autoFocus
              editable={!isSubmitting}
            />

            {/* Target amount */}
            <Text className="text-sm font-semibold text-muted mb-2">Target amount</Text>
            <View className="flex-row items-center bg-surface rounded-lg px-4 py-3 border border-border mb-8">
              <Text className="text-2xl font-bold text-primary">$</Text>
              <TextInput
                value={target}
                onChangeText={setTarget}
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                className="flex-1 ml-2 text-2xl font-bold text-foreground"
                editable={!isSubmitting}
                onSubmitEditing={handleCreate}
              />
            </View>

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
                onPress={handleCreate}
                disabled={isSubmitting}
                className={`flex-1 rounded-lg py-3 items-center justify-center ${isSubmitting ? "bg-primary/50" : "bg-primary"}`}
              >
                <Text className="text-background font-semibold">
                  {isSubmitting ? "Creating..." : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
