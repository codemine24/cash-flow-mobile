import { ScreenContainer } from "@/components/screen-container";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  User as UserIcon,
  MoreVertical,
  Edit3,
  Trash2,
  X,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Popover from "react-native-popover-view";
import { useBook, useShareBook } from "@/api/books";
import { useGetAllUsers } from "@/api/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface MemberData {
  id: string;
  role: "EDITOR" | "VIEWER";
  name?: string;
  email?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

const MemberCard = ({
  member,
  onEdit,
  onRemove,
}: {
  member: MemberData;
  onEdit: (member: MemberData) => void;
  onRemove: (member: MemberData) => void;
}) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Extract display values depending on structure
  const name = member.name || member.user?.name || "Unknown User";
  const email = member.email || member.user?.email || "";
  const role = member.role;

  const handleAction = (action: (member: MemberData) => void) => {
    setIsMenuVisible(false);
    setTimeout(() => {
      action(member);
    }, 100);
  };

  return (
    <View className="bg-surface rounded-2xl p-3 mt-3 border border-border flex-row items-center justify-between">
      {/* Left */}
      <View className="flex-row items-center flex-1">
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: "rgba(0, 146, 154, 0.1)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 16,
          }}
        >
          <UserIcon size={26} color="#00929A" />
        </View>
        <View className="flex-1 mr-4">
          <Text
            className="text-gray-900 font-bold text-[15px]"
            numberOfLines={1}
          >
            {name}
          </Text>
          {!!email && (
            <Text className="text-sm text-muted mt-0.5" numberOfLines={1}>
              {email}
            </Text>
          )}
        </View>
      </View>

      {/* Right */}
      <View className="flex-row items-center">
        <Text
          className={`text-[12px] font-semibold mr-2 px-2 py-1 rounded-md ${role === "EDITOR"
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-100 text-gray-700"
            }`}
        >
          {role}
        </Text>

        <Popover
          isVisible={isMenuVisible}
          onRequestClose={() => setIsMenuVisible(false)}
          from={
            <TouchableOpacity
              onPress={() => setIsMenuVisible(true)}
              className="py-2 pl-2 rounded-full"
            >
              <MoreVertical size={20} color="#6b7280" />
            </TouchableOpacity>
          }
          popoverStyle={{
            borderRadius: 8,
            backgroundColor: "#ffffff",
            paddingVertical: 12,
            paddingHorizontal: 16,
            width: 180,
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            borderColor: "#e5e7eb",
            borderWidth: StyleSheet.hairlineWidth,
          }}
        >
          <View className="bg-white flex flex-col gap-4">
            <TouchableOpacity
              onPress={() => handleAction(onEdit)}
              className="flex-row items-center"
            >
              <Edit3 size={20} color="#6b7280" />
              <Text className="ml-4 text-[16px] text-[#111827]">Edit Role</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAction(onRemove)}
              className="flex-row items-center mt-1"
            >
              <Trash2 size={20} color="#ef4444" />
              <Text className="ml-4 text-[16px] text-red-500">Remove</Text>
            </TouchableOpacity>
          </View>
        </Popover>
      </View>
    </View>
  );
};

export default function MembersScreen() {
  const params = useLocalSearchParams<{ bookId: string; bookName?: string }>();
  const bookId = params.bookId;

  const { data: bookData, isLoading: bookLoading } = useBook(bookId);
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberData | null>(null);

  // Form states
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("VIEWER");

  // Mock API Mutations (replace with real if defined)
  const addMemberMutation = useShareBook();

  const updateRoleMutation = useMutation({
    mutationFn: async (data: { member_id: string; role: string }) => {
      // return apiClient.patch(`/book/${bookId}/member/${data.member_id}`, { role: data.role });
      console.log("Updating member role:", data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["books"] }),
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (member_id: string) => {
      // return apiClient.delete(`/book/${bookId}/member/${member_id}`);
      console.log("Removing member:", member_id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["books"] }),
  });

  // Debouncing logic for the search API
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchValue]);

  // Search results
  const { data: usersResponse, isFetching: searchingUsers } = useGetAllUsers({
    search: debouncedSearch,
    limit: 3,
  });
  const usersList = usersResponse?.data?.data || [];

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setSearchValue("");
    setSelectedUser(null);
    setRole("VIEWER");
    setModalVisible(true);
  };

  const handleEditMember = (member: MemberData) => {
    setEditingMember(member);
    setSearchValue(member.email || member.user?.email || member.name || "");
    setSelectedUser(member.user || null);
    setRole(member.role);
    setModalVisible(true);
  };

  const handleRemoveMember = (member: MemberData) => {
    const email = member.email || member.user?.email || "this member";
    Alert.alert("Remove Member", `Are you sure you want to remove ${email}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          removeMemberMutation.mutate(member.id);
        },
      },
    ]);
  };

  const handleSubmitModal = () => {
    if (editingMember) {
      updateRoleMutation.mutate(
        { member_id: editingMember.id, role },
        {
          onSuccess: () => setModalVisible(false),
        }
      );
    } else {
      if (!selectedUser) {
        Alert.alert("Error", "Please select a user to add.");
        return;
      }
      addMemberMutation.mutate(
        { book_id: bookId, user_id: selectedUser.id, role },
        {
          onSuccess: () => setModalVisible(false),
        }
      );
    }
  };

  const members = (bookData?.data?.others_member || []) as MemberData[];

  return (
    <>
      <Stack.Screen options={{ title: "Members", headerBackTitle: "Back" }} />
      <ScreenContainer edges={["left", "right"]} className="bg-background">
        {bookLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#00929A" />
          </View>
        ) : (
          <FlatList
            contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 100 }}
            data={members}
            keyExtractor={(item, index) => item?.id?.toString() || `${index}`}
            renderItem={({ item }) => (
              <MemberCard
                member={item}
                onEdit={handleEditMember}
                onRemove={handleRemoveMember}
              />
            )}
            ListEmptyComponent={
              <View className="items-center justify-center p-8 mt-10">
                <Text className="text-gray-500 text-center">
                  No members added yet.
                </Text>
              </View>
            }
          />
        )}
      </ScreenContainer>

      {/* Floating Action Button */}
      <View
        style={{
          position: "absolute",
          bottom: 32,
          right: 16,
        }}
      >
        <TouchableOpacity
          onPress={handleOpenAddModal}
          className="bg-primary px-6 py-[14px] rounded-2xl items-center justify-center flex-row shadow-sm"
        >
          <Text className="text-white font-bold text-sm tracking-widest text-center">
            + Add Member
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add / Edit Member Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            className="flex-1 bg-black/50"
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              className="mt-auto bg-white rounded-t-3xl p-6 shadow-xl"
            >
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-2xl font-bold text-gray-900">
                  {editingMember ? "Edit Member Role" : "Add Member"}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="w-8 h-8 items-center justify-center bg-gray-100 rounded-full"
                >
                  <X color="#6b7280" size={20} />
                </TouchableOpacity>
              </View>

              {/* Email Field */}
              <View className="mb-6 relative" style={{ zIndex: 100 }}>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Email / User
                </Text>
                <View className="relative flex-row items-center">
                  <TextInput
                    value={searchValue}
                    onChangeText={(text) => {
                      setSearchValue(text);
                      setSelectedUser(null);
                    }}
                    placeholder="Search user by email or name..."
                    placeholderTextColor="#9ca3af"
                    editable={!editingMember}
                    className={`flex-1 border border-border rounded-xl px-4 py-3.5 bg-surface text-foreground ${editingMember ? "bg-gray-100 text-gray-500" : ""}`}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                  />
                  {!editingMember && searchingUsers && searchValue.length > 0 && (
                    <View
                      className="absolute w-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-4 items-center"
                      style={{ top: 50, zIndex: 100 }}
                    >
                      <View className="w-full flex items-center justify-center">
                        <ActivityIndicator size="small" color="#00929A" />
                      </View>
                    </View>
                  )}
                </View>

                {/* Search Results Dropdown */}
                {!editingMember &&
                  searchValue.length > 0 &&
                  !selectedUser &&
                  !searchingUsers &&
                  (usersList.length > 0 ? (
                    <View
                      className="absolute left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg w-full max-h-[180px] overflow-hidden"
                      style={{
                        top: 70,
                        zIndex: 100
                      }}
                    >
                      <ScrollView keyboardShouldPersistTaps="handled">
                        {usersList.map((usr: any) => (
                          <TouchableOpacity
                            key={usr.id}
                            onPress={() => {
                              setSelectedUser(usr);
                              setSearchValue(usr.email || usr.name || "");
                            }}
                            className="px-4 py-3 border-b border border-border last:border-b-0 flex-row items-center"
                          >
                            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                              <Text className="text-primary font-bold text-sm">
                                {(usr.name || usr.email || "U").charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <View>
                              <Text className="font-semibold text-gray-900">
                                {usr.name || "Unknown User"}
                              </Text>
                              <Text className="text-sm text-gray-500">
                                {usr.email}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  ) : (
                    debouncedSearch === searchValue && searchValue.length > 1 && (
                      <View
                        className="absolute w-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-4 items-center"
                        style={{ top: 70, zIndex: 100 }}
                      >
                        <Text className="text-sm text-gray-500">
                          No users found matching &quot;{searchValue}&quot;
                        </Text>
                      </View>
                    )
                  ))}
              </View>

              {/* Role Extractor */}
              <View className="mb-8" style={{ zIndex: 1 }}>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Role
                </Text>
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    onPress={() => setRole("VIEWER")}
                    className={`flex-1 py-3.5 items-center rounded-xl border ${role === "VIEWER"
                      ? "bg-primary/10 border-primary"
                      : "bg-surface border-border"
                      }`}
                  >
                    <Text
                      className={`font-semibold text-base ${role === "VIEWER" ? "text-primary" : "text-gray-600"
                        }`}
                    >
                      Viewer
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setRole("EDITOR")}
                    className={`flex-1 py-3.5 items-center rounded-xl border ${role === "EDITOR"
                      ? "bg-primary/10 border-primary"
                      : "bg-surface border-border"
                      }`}
                  >
                    <Text
                      className={`font-semibold text-base ${role === "EDITOR" ? "text-primary" : "text-gray-600"
                        }`}
                    >
                      Editor
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="w-24 bg-surface rounded-xl py-4 border border-border items-center justify-center"
                >
                  <Text className="text-foreground font-semibold text-base">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmitModal}
                  disabled={addMemberMutation.isPending || updateRoleMutation.isPending}
                  className={`flex-1 rounded-xl py-4 items-center justify-center flex-row ${addMemberMutation.isPending || updateRoleMutation.isPending
                    ? "bg-primary/50"
                    : "bg-primary"
                    }`}
                >
                  {(addMemberMutation.isPending || updateRoleMutation.isPending) && (
                    <ActivityIndicator color="white" className="mr-2" size="small" />
                  )}
                  <Text className="text-white font-bold text-base">
                    {editingMember ? "Save" : "Add"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
