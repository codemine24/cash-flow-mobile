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
  Alert,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Plus, MoreVertical, Edit3, Trash2, X } from "lucide-react-native";
import {
  useGetCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/api/category";
import Toast from "react-native-toast-message";
import Popover from "react-native-popover-view";

export default function ManageCategoriesScreen() {
  // Modals & Forms State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState("");

  // Context Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // APIs
  const { data: categoriesResponse, isLoading } = useGetCategories();
  const categories = categoriesResponse?.data || [];
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Open the modal for Adding
  const openAddModal = () => {
    setIsEditing(false);
    setEditingCategoryId(null);
    setCategoryNameInput("");
    setModalVisible(true);
  };

  // Open the modal for Editing
  const openEditModal = (id: string, currentName: string) => {
    setActiveMenuId(null);
    setIsEditing(true);
    setEditingCategoryId(id);
    setCategoryNameInput(currentName);
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryNameInput.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Category name cannot be empty",
      });
      return;
    }

    try {
      let response;
      if (isEditing && editingCategoryId) {
        response = await updateCategoryMutation.mutateAsync({
          id: editingCategoryId,
          category: { title: categoryNameInput.trim() },
        });
      } else {
        response = await createCategoryMutation.mutateAsync({
          title: categoryNameInput.trim(),
          color: "#00929A",
          icon: "",
        });
      }

      if (
        response?.data?.success ||
        (response as any)?.success ||
        response?.data?.id ||
        (response as any)?.status === 200
      ) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: isEditing
            ? "Category renamed successfully"
            : "Category created successfully",
        });
        setModalVisible(false);
        setCategoryNameInput("");
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            response?.data?.message ||
            (response as any)?.message ||
            "Failed to save category",
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

  const handleDeleteCategory = (id: string) => {
    setActiveMenuId(null);
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await deleteCategoryMutation.mutateAsync(id);
              if (res?.data?.success || (res as any)?.success || (res as any)?.status === 200) {
                Toast.show({
                  type: "success",
                  text1: "Success",
                  text2: "Category deleted",
                });
              } else {
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "Failed to delete category",
                });
              }
            } catch (e: any) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: e?.message || "Failed to delete category",
              });
            }
          },
        },
      ]
    );
  };

  const isSaving =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <>
      <Stack.Screen
        options={{ title: "Manage Categories", headerBackTitle: "Back" }}
      />
      <View className="flex-1 bg-white">
        {/* Top Outline Add Button */}
        <View className="px-5 py-4 bg-white z-10">
          <TouchableOpacity
            onPress={openAddModal}
            className="w-full flex-row items-center justify-center py-4 rounded-xl border border-primary border-dashed bg-[#00929A]/5"
            activeOpacity={0.7}
          >
            <Plus size={20} color="#00929A" className="mr-2" />
            <Text className="text-primary font-bold text-base tracking-wide">
              Add New Category
            </Text>
          </TouchableOpacity>
        </View>

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
              You don&apos;t have any custom categories yet.
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {categories.map((cat: any) => (
              <View
                key={cat.id}
                className="flex-row items-center justify-between p-4 mb-3 border border-b border-border bg-white shadow-sm shadow-gray-100 rounded-xl"
              >
                <View className="flex-row items-center flex-1">
                  <Text className="text-3xl mr-4">{cat.icon || "📝"}</Text>
                  <Text
                    className="text-base font-semibold text-gray-900"
                    numberOfLines={1}
                  >
                    {cat.title}
                  </Text>
                </View>

                {/* Popover Menu inside Category Row */}
                <Popover
                  isVisible={activeMenuId === cat.id}
                  onRequestClose={() => setActiveMenuId(null)}
                  from={
                    <TouchableOpacity
                      onPress={() => setActiveMenuId(cat.id)}
                      className="p-2 -mr-2 items-center justify-center"
                    >
                      <MoreVertical size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  }
                  backgroundStyle={{ backgroundColor: "rgba(0,0,0,0.1)" }}
                  popoverStyle={{
                    borderRadius: 14,
                    width: 170,
                    backgroundColor: "white",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 5,
                  }}
                >
                  <View>
                    <TouchableOpacity
                      onPress={() => openEditModal(cat.id, cat.title)}
                      className="flex-row items-center px-4 py-3.5 border-b border-border"
                    >
                      <Edit3 size={18} color="#374151" />
                      <Text className="text-gray-700 font-semibold text-sm ml-2">
                        Rename
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteCategory(cat.id)}
                      className="flex-row items-center px-4 py-3.5"
                    >
                      <Trash2 size={18} color="#EF4444" />
                      <Text className="text-red-500 font-semibold text-sm ml-2">
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Popover>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Reusable Category Form Modal */}
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
                  {isEditing ? "Rename Category" : "New Category"}
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
                value={categoryNameInput}
                onChangeText={setCategoryNameInput}
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
                  onPress={handleSaveCategory}
                  disabled={isSaving}
                  className={`flex-1 rounded-xl py-4 items-center justify-center ${isSaving ? "bg-primary/70" : "bg-primary"}`}
                >
                  {isSaving ? (
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
