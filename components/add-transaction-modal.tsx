import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useBooks } from "@/lib/book-context";
import { Calendar, X } from "lucide-react-native";
import { useCreateTransaction } from "@/api/transaction";
import Toast from "react-native-toast-message";

interface AddTransactionModalProps {
  visible: boolean;
  bookId: string;
  onClose: () => void;
  initialType?: "IN" | "OUT";
}

const EXPENSE_CATEGORIES = [
  { id: "food", name: "Food", icon: "🍔" },
  { id: "transport", name: "Transport", icon: "🚗" },
  { id: "other", name: "Other", icon: "📝" },
];

export function AddTransactionModal({
  visible,
  bookId,
  onClose,
  initialType = "OUT",
}: AddTransactionModalProps) {
  const createTransactionMutation = useCreateTransaction();

  const [type, setType] = useState<"IN" | "OUT">(initialType);
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("other");
  const [remark, setRemark] = useState("");
  // const [date, setDate] = useState(new Date());
  // const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setType(initialType);
      setAmount("");
      setSelectedCategory("other");
      setRemark("");
      // setDate(new Date());  
    }
  }, [visible, initialType]);

  const isDeposit = type === "IN";
  const accentColor = isDeposit ? "#2E7D32" : "#C62828";

  // const handleDateChange = (event: any, selectedDate?: Date) => {
  //   if (Platform.OS === "android") {
  //     setShowDatePicker(false);
  //   }
  //   if (event.type === "set" && selectedDate) {
  //     setDate(selectedDate);
  //   }
  // };

  const handleAddTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!isDeposit && !selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    const response: any = await createTransactionMutation.mutateAsync({
      book_id: bookId,
      type,
      amount: parseFloat(amount),
      category_id: !isDeposit ? selectedCategory : undefined,
      remark,
      // date: date.toISOString().split("T")[0],
    });

    if (response.success) {
      setAmount("");
      setSelectedCategory("other");
      setRemark("");
      // setDate(new Date());
      onClose();
      Toast.show({
        type: "success",
        text1: "Success",
        text2: response.message,
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: response.message,
      });
    }
  };

  const formatDisplayDate = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.flex1} activeOpacity={1} onPress={onClose} />
        <View style={styles.container}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.title}>{isDeposit ? "Cash In" : "Cash Out"}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={20} color="#71717A" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount</Text>
              <View style={[styles.amountInputContainer, { borderColor: accentColor + "30", backgroundColor: accentColor + "08" }]}>
                <Text style={[styles.currencySymbol, { color: accentColor }]}>$</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#A1A1AA"
                  keyboardType="decimal-pad"
                  style={styles.amountInput}
                  autoFocus={true}
                />
              </View>
            </View>

            {!isDeposit && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryContainer}>
                  {EXPENSE_CATEGORIES.map((category) => {
                    const isSelected = selectedCategory === category.id;
                    return (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => setSelectedCategory(category.id)}
                        style={[
                          styles.categoryButton,
                          isSelected ? styles.categoryButtonSelected : styles.categoryButtonUnselected,
                        ]}
                      >
                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                        <Text style={[styles.categoryText, isSelected ? styles.categoryTextSelected : styles.categoryTextUnselected]}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton} activeOpacity={0.7}>
                <Calendar size={20} color="#71717A" />
                <Text style={styles.dateText}>{formatDisplayDate(date)}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    themeVariant="light"
                  />
                  {Platform.OS === "ios" && (
                    <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.doneButton}>
                      <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View> */}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Remark</Text>
              <TextInput
                value={remark}
                onChangeText={setRemark}
                placeholder={isDeposit ? "e.g., Salary, Business income..." : "e.g., Lunch, Uber ride..."}
                placeholderTextColor="#A1A1AA"
                style={styles.remarkInput}
                multiline
                numberOfLines={2}
              />
            </View>

            <TouchableOpacity
              onPress={handleAddTransaction}
              disabled={createTransactionMutation.isPending}
              style={[styles.submitButton, { backgroundColor: createTransactionMutation.isPending ? accentColor + "80" : accentColor }]}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>
                {createTransactionMutation.isPending ? "SAVING..." : isDeposit ? "ADD CASH IN" : "ADD CASH OUT"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E4E4E7",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#09090B",
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#F4F4F5",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#71717A",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "bold",
  },
  amountInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 24,
    fontWeight: "bold",
    color: "#09090B",
  },
  categoryContainer: {
    flexDirection: "row",
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  categoryButtonSelected: {
    borderColor: "#2563EB",
    backgroundColor: "rgba(37, 99, 235, 0.1)",
  },
  categoryButtonUnselected: {
    borderColor: "#E4E4E7",
    backgroundColor: "#F4F4F5",
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  categoryTextSelected: {
    color: "#2563EB",
  },
  categoryTextUnselected: {
    color: "#09090B",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  dateText: {
    color: "#09090B",
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
  },
  datePickerContainer: {
    marginTop: 8,
    backgroundColor: "#F4F4F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    overflow: "hidden",
  },
  doneButton: {
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#E4E4E7",
  },
  doneButtonText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 16,
  },
  remarkInput: {
    backgroundColor: "#F4F4F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    color: "#09090B",
    fontSize: 16,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});
