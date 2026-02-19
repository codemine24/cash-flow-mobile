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
import { useBooks } from "@/lib/book-context";
import { useColors } from "@/hooks/use-colors";

interface CreateBookModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateBookModal({ visible, onClose }: CreateBookModalProps) {
  const colors = useColors();
  const { addBook } = useBooks();
  const [bookName, setBookName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!bookName.trim()) {
      Alert.alert("Error", "Please enter a book name");
      return;
    }
    setIsSubmitting(true);
    try {
      await addBook(bookName.trim());
      setBookName("");
      onClose();
    } catch {
      Alert.alert("Error", "Failed to create book");
    } finally {
      setIsSubmitting(false);
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
              <Text className="text-2xl font-bold text-foreground">New Book</Text>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 items-center justify-center"
              >
                <Text className="text-xl text-muted">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Book name input */}
            <Text className="text-sm font-semibold text-muted mb-2">Book name</Text>
            <TextInput
              value={bookName}
              onChangeText={setBookName}
              placeholder="e.g., January Expenses"
              placeholderTextColor={colors.muted}
              className="bg-surface rounded-lg px-4 py-3 border border-border text-foreground mb-8"
              autoFocus
              editable={!isSubmitting}
              onSubmitEditing={handleCreate}
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
