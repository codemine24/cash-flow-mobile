import { ScrollView, Text, View, TouchableOpacity, FlatList, Modal, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";
import { CreateBookModal } from "@/components/create-book-modal";
import { useColors } from "@/hooks/use-colors";
import { formatCurrency } from "@/lib/book-utils";
import { useRouter } from "expo-router";
import { Book, Edit3, MoreVertical, Plus, Trash2, UserPlus } from "lucide-react-native";
import { useBooks } from "@/api/books";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { data: booksData, isLoading } = useBooks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMenuBook, setActiveMenuBook] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteBook = (bookId: string, bookName: string) => {
    // Add real delete logic here later
    setActiveMenuBook(null);
  };

  const handleRename = () => {
    setActiveMenuBook(null);
  };

  const handleAddMember = () => {
    setActiveMenuBook(null);
  };

  return (
    <>
      <ScreenContainer className="p-4 bg-background">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
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
                        <Text className="text-[13px] text-muted">
                          Updated 3 hours ago
                        </Text>
                      </View>
                    </View>

                    {/* Right: Amount and Options Menu */}
                    <View className="flex-row items-center">
                      <Text className="text-[17px] font-bold text-[#00929A] mr-3">
                        {formatCurrency(book.balance)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setActiveMenuBook({ id: book.id, name: book.name })}
                        className="py-2 pl-2 rounded-full"
                      >
                        <MoreVertical size={20} color="#6b7280" />
                      </TouchableOpacity>
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

      {/* Create Book Modal */}
      <CreateBookModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} />

      {/* Options Menu Modal */}
      {activeMenuBook && (
        <Modal
          visible={!!activeMenuBook}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setActiveMenuBook(null)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => setActiveMenuBook(null)}
          >
            <Pressable
              className="bg-surface w-[80%] rounded-2xl overflow-hidden shadow-lg border border-border"
              onPress={(e) => e.stopPropagation()}
            >
              <View className="px-5 py-4 border-b border-border/50">
                <Text className="text-lg font-bold text-foreground text-center" numberOfLines={1}>
                  {activeMenuBook.name}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleRename}
                className="flex-row items-center px-6 py-4 border-b border-border/50"
              >
                <Edit3 size={20} color={colors.text} />
                <Text className="ml-4 text-[16px] font-medium text-foreground">Rename</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddMember}
                className="flex-row items-center px-6 py-4 border-b border-border/50"
              >
                <UserPlus size={20} color={colors.text} />
                <Text className="ml-4 text-[16px] font-medium text-foreground">Add member</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteBook(activeMenuBook.id, activeMenuBook.name)}
                className="flex-row items-center px-6 py-4 bg-red-50/30"
              >
                <Trash2 size={20} color="#ef4444" />
                <Text className="ml-4 text-[16px] font-medium text-error flex-1">Delete</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}
