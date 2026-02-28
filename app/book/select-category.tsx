import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Plus, Check, X } from "lucide-react-native";
import { useGetCategories, useCreateCategory } from "@/api/category";
import Toast from "react-native-toast-message";

export default function SelectCategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookId: string;
    currentSelectedId?: string;
  }>();

  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const { data: categoriesResponse, isLoading } = useGetCategories();
  const categories = categoriesResponse?.data || [];

  const createCategoryMutation = useCreateCategory();

  const handleSelect = (categoryId: string, categoryName: string) => {
    // Navigate back to add-transaction and pass the selected category info as params
    router.navigate({
      pathname: "/book/add-transaction",
      params: {
        ...params,
        selectedCategoryId: categoryId,
        selectedCategoryName: categoryName,
      },
    });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Category name cannot be empty",
      });
      return;
    }

    try {
      const payload = {
        title: newCategoryName.trim(),
        color: "#00929A",
        icon: "",
      };

      const response = await createCategoryMutation.mutateAsync(payload);

      if (response?.data?.success || (response as any)?.success || response?.data?.id) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Category created successfully",
        });

        const createdCategory = response?.data?.data || response?.data;
        const newId = createdCategory?.id || "";
        const newName = createdCategory?.title || newCategoryName.trim();

        setModalVisible(false);
        setNewCategoryName("");

        // Immediately select the new category and go back
        if (newId) {
          handleSelect(newId.toString(), newName);
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response?.data?.message || (response as any)?.message || "Failed to create category",
        });
      }
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: e?.message || "Something went wrong",
      });
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Choose Category", headerBackTitle: "Back" }} />
      <View className="flex-1 bg-white">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#00929A" />
          </View>
        ) : categories.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              No categories
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              You don&apos;t have any expense categories yet.
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1 px-4 py-2" contentContainerStyle={{ paddingBottom: 100 }}>
            {categories.map((cat: any) => {
              const isSelected = params.currentSelectedId === cat.id?.toString();

              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => handleSelect(cat.id.toString(), cat.title)}
                  className={`flex-row items-center justify-between p-4 mb-3 border rounded-xl ${isSelected ? "border-primary bg-[#00929A]/5" : "border-gray-200 bg-white"}`}
                >
                  <View className="flex-row items-center">
                    <Text className="text-3xl mr-4">{cat.icon || "📝"}</Text>
                    <Text className={`text-base font-semibold ${isSelected ? "text-primary" : "text-gray-900"}`}>
                      {cat.title}
                    </Text>
                  </View>

                  <View
                    className={`h-6 w-6 rounded-full border-2 items-center justify-center ${isSelected ? "border-primary bg-primary" : "border-gray-300"}`}
                  >
                    {isSelected && <Check size={14} color="white" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Floating Action Button */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="absolute bottom-10 right-6 h-14 w-14 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/30"
          style={{ elevation: 5 }}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Add New Category Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-end bg-black/40">
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            />
            <View className="bg-white rounded-t-3xl pt-2 px-6 pb-10 shadow-lg">
              <View className="items-center mb-6">
                <View className="h-1.5 w-12 bg-gray-300 rounded-full" />
              </View>

              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-gray-900">
                  New Category
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="bg-gray-100 p-2 rounded-full"
                >
                  <X size={20} color="#4B5563" />
                </TouchableOpacity>
              </View>

              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Category Name
              </Text>
              <TextInput
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="e.g. Travel, Utilities, Groceries"
                placeholderTextColor="#9ca3af"
                className="w-full border border-gray-200 rounded-xl px-4 py-4 bg-gray-50 text-gray-900 text-base mb-6"
                autoFocus
              />

              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="flex-1 bg-gray-100 rounded-xl py-4 items-center justify-center"
                >
                  <Text className="text-gray-700 font-bold text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateCategory}
                  disabled={createCategoryMutation.isPending}
                  className={`flex-1 rounded-xl py-4 items-center justify-center ${createCategoryMutation.isPending ? "bg-primary/70" : "bg-primary"}`}
                >
                  {createCategoryMutation.isPending ? (
                    <ActivityIndicator color="primary" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-base tracking-wide">
                      Save
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
