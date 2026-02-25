import { useBooks } from "@/api/books";
import { CreateWalletModal } from "@/components/create-wallet-modal";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { formatCurrency, formatUpdateDate } from "@/lib/book-utils";
import { useRouter } from "expo-router";
import { Book, CornerDownRight, Edit3, MoreVertical, Plus, Trash2, UserPlus } from "lucide-react-native";
import { useState } from "react";
import { FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Popover from 'react-native-popover-view';
// import { ScreenContainer } from "react-native-screens";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { data: booksData, isLoading } = useBooks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMenuBook, setActiveMenuBook] = useState<{ id: string; name: string } | null>(null);
  const [editingBook, setEditingBook] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteBook = (bookId: string, bookName: string) => {
    // Add real delete logic here later
    setActiveMenuBook(null);
  };

  const handleRename = () => {
    if (activeMenuBook) {
      setEditingBook(activeMenuBook);
      setShowCreateModal(true);
    }
    setActiveMenuBook(null);
  };

  const handleAddMember = () => {
    setActiveMenuBook(null);
  };

  return (
    <>
      <ScreenContainer className="p-4 bg-background">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground">Wallets</Text>
            <Text className="text-sm text-muted mt-1">Create separate wallets to organize your expenses</Text>
          </View>

          {/* Books List */}
          {isLoading ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-muted">Loading...</Text>
            </View>
          ) : booksData?.data?.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">No wallets yet</Text>
              <Text className="text-sm text-muted text-center mb-4">
                Create your first wallet to start tracking expenses
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                className="bg-primary rounded-lg px-6 py-2"
              >
                <Text className="text-white font-semibold">Create Wallet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={booksData?.data}
              keyExtractor={(item) => item.id}
              renderItem={({ item: book }) => {
                return (
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: "/book/[id]", params: { id: book.id } } as any)}
                    className="bg-surface rounded-xl p-4 mb-4 border border-border active:opacity-70 flex-row items-center justify-between"
                  >
                    {/* Left: Icon and Name/Date */}
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
                        <Book size={26} color="#00929A" />
                      </View>
                      <View className="flex-1 mr-4">
                        <Text className="text-[17px] font-bold text-foreground mb-[2px]" numberOfLines={1}>
                          {book.name}
                        </Text>
                        <Text className="text-sm text-muted mt-0.5">
                          {formatUpdateDate(book.updated_at)}
                        </Text>
                      </View>
                    </View>

                    {/* Right: Amount and Options Menu */}
                    <View className="flex-row items-center">
                      <Text className="text-sm font-semibold text-primary mr-1">
                        {formatCurrency(book.balance)}
                      </Text>

                      <Popover
                        isVisible={activeMenuBook?.id === book.id}
                        onRequestClose={() => setActiveMenuBook(null)}
                        from={(
                          <TouchableOpacity
                            onPress={() => setActiveMenuBook({ id: book.id, name: book.name })}
                            className="py-2 pl-2 rounded-full"
                          >
                            <MoreVertical size={20} color="#6b7280" />
                          </TouchableOpacity>
                        )}
                        popoverStyle={{
                          borderRadius: 8,
                          backgroundColor: '#ffffff',
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          width: 220,
                          elevation: 0,
                          shadowOpacity: 0,
                          shadowRadius: 0,
                          borderColor: '#e5e7eb',
                          // borderWidth: 1,
                        }}
                        backgroundStyle={{ backgroundColor: 'transparent' }}
                      >
                        <View className="bg-white flex flex-col gap-4">
                          <TouchableOpacity
                            onPress={handleRename}
                            className="flex-row items-center"
                          >
                            <Edit3 size={20} color="#6b7280" />
                            <Text className="ml-4 text-[16px] text-[#111827]">Rename</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={handleAddMember}
                            className="flex-row items-center"
                          >
                            <UserPlus size={20} color="#6b7280" />
                            <Text className="ml-4 text-[16px] text-[#111827]">Add Members</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => { }}
                            className="flex-row items-center"
                          >
                            <CornerDownRight size={20} color="#ef4444" />
                            <Text className="ml-4 text-[16px] text-red-500">Move book</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleDeleteBook(book.id, book.name)}
                            className="flex-row items-center mt-1"
                          >
                            <Trash2 size={20} color="#ef4444" />
                            <Text className="ml-4 text-[16px] text-red-500">Delete Book</Text>
                          </TouchableOpacity>
                        </View>
                      </Popover>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </ScrollView>
      </ScreenContainer>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setShowCreateModal(true)}
        className="absolute bottom-10 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>

      {/* Create / Edit Book Modal */}
      <CreateWalletModal
        visible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingBook(null);
        }}
        editBook={editingBook}
      />
    </>
  );
}
