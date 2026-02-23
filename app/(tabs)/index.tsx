import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";
import { CreateBookModal } from "@/components/create-book-modal";
import { useColors } from "@/hooks/use-colors";
import { formatCurrency } from "@/lib/book-utils";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useBooks } from "@/api/books";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { data: booksData, isLoading } = useBooks();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleDeleteBook = (bookId: string, bookName: string) => {
    // Alert.alert(
    //   "Delete Book",
    //   `Are you sure you want to delete "${bookName}"? This cannot be undone.`,
    //   [
    //     { text: "Cancel", style: "cancel" },
    //     {
    //       text: "Delete",
    //       onPress: () => deleteBook(bookId),
    //       style: "destructive",
    //     },
    //   ]
    // );
  };

  return (
    <>
      <ScreenContainer className="p-4 bg-background">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground">Books</Text>
            <Text className="text-sm text-muted mt-1">Manage your expense books</Text>
          </View>

          {/* Books List */}
          {isLoading ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-muted">Loading...</Text>
            </View>
          ) : booksData?.data?.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">No books yet</Text>
              <Text className="text-sm text-muted text-center mb-4">
                Create your first book to start tracking expenses
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                className="bg-primary rounded-lg px-6 py-2"
              >
                <Text className="text-white font-semibold">Create Book</Text>
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
                    onLongPress={() => handleDeleteBook(book.id, book.name)}
                    className="bg-surface rounded-xl p-4 mb-4 border border-border active:opacity-70"
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-lg font-bold text-foreground flex-1">
                        {book.name}
                      </Text>
                      <Text className="text-sm text-muted">
                        {/* {book.transactions.length} transaction{book.transactions.length !== 1 ? "s" : ""} */}
                      </Text>
                    </View>

                    {/* Balance Summary */}
                    <View className="flex-row gap-3">
                      <View className="flex-1 bg-background rounded-lg p-3 border border-border">
                        <Text className="text-xs text-muted font-medium mb-1">In</Text>
                        <Text className="text-lg font-bold text-success">
                          {formatCurrency(book.in)}
                        </Text>
                      </View>
                      <View className="flex-1 bg-background rounded-lg p-3 border border-border">
                        <Text className="text-xs text-muted font-medium mb-1">Out</Text>
                        <Text className="text-lg font-bold text-error">
                          {formatCurrency(book.out)}
                        </Text>
                      </View>
                      <View className="flex-1 bg-background rounded-lg p-3 border border-border">
                        <Text className="text-xs text-muted font-medium mb-1">Balance</Text>
                        <Text
                          className={`text-lg font-bold ${book.balance >= 0 ? "text-success" : "text-error"
                            }`}
                        >
                          {formatCurrency(book.balance)}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-xs text-muted mt-3">
                      Long press to delete
                    </Text>
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
    </>
  );
}
