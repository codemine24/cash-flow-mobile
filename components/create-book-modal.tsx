import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
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

  const handleCreateBook = async () => {
    if (!bookName.trim()) {
      Alert.alert("Error", "Please enter a book name");
      return;
    }

    setIsSubmitting(true);
    try {
      await addBook(bookName.trim());
      setBookName("");
      onClose();
    } catch (error) {
      console.error("Failed to create book:", error);
      Alert.alert("Error", "Failed to create book");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-background rounded-2xl p-6 w-full max-w-xs shadow-lg">
          {/* Header */}
          <Text className="text-xl font-bold text-foreground mb-4">Create New Book</Text>

          {/* Input */}
          <TextInput
            value={bookName}
            onChangeText={setBookName}
            placeholder="e.g., January Expense"
            placeholderTextColor={colors.muted}
            className="bg-surface rounded-lg px-4 py-3 border border-border text-foreground mb-6"
            editable={!isSubmitting}
          />

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-surface rounded-lg py-3 border border-border items-center justify-center"
            >
              <Text className="text-foreground font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreateBook}
              disabled={isSubmitting}
              className={`flex-1 rounded-lg py-3 items-center justify-center ${
                isSubmitting ? "bg-primary/50" : "bg-primary"
              }`}
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
