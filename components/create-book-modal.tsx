import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useCreateBook } from "@/api/books";
import Toast from "react-native-toast-message";

interface CreateBookModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateBookModal({ visible, onClose }: CreateBookModalProps) {
  const colors = useColors();
  const [bookName, setBookName] = useState("");
  const createBookMutation = useCreateBook();

  const handleCreate = async () => {
    if (!bookName.trim()) {
      Toast.show({
        type: "error",
        text1: "Please enter a book name",
      });
      return;
    }
    try {
      await createBookMutation.mutateAsync(bookName.trim());
      setBookName("");
      onClose();
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed to create book",
      });
    }
  };

  const handleClose = () => {
    setBookName("");
    onClose();
  };

  return (
    // animationType="slide" makes it slide up from the bottom
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Dimmed overlay — tapping it closes the modal */}
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={handleClose}
        >
          {/* The sheet itself — mt-auto pushes it to the bottom */}
          {/* We stop event propagation so tapping inside doesn't close it */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className="mt-auto bg-background rounded-t-3xl p-6"
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-foreground">
                New Book
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 items-center justify-center"
              >
                <Text className="text-xl text-muted">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Book name input */}
            <Text className="text-sm font-semibold text-muted mb-2">
              Book name
            </Text>
            <TextInput
              value={bookName}
              onChangeText={setBookName}
              placeholder="e.g., January Expenses"
              placeholderTextColor={colors.muted}
              className="bg-surface rounded-lg px-4 py-3 border border-border text-foreground mb-8"
              autoFocus
              editable={!createBookMutation.isPending}
              onSubmitEditing={handleCreate}
            />

            {/* Action buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleClose}
                disabled={createBookMutation.isPending}
                className="flex-1 bg-surface rounded-lg py-3 border border-border items-center justify-center"
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                disabled={createBookMutation.isPending}
                className={`flex-1 rounded-lg py-3 items-center justify-center ${createBookMutation.isPending ? "bg-primary/50" : "bg-primary"}`}
              >
                <Text className="text-background font-semibold">
                  {createBookMutation.isPending ? "Creating..." : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
