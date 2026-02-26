import { useBooks, BookData } from "@/api/books";
import { useDebounce } from "@/hooks/use-debounce";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, X, Search } from "lucide-react-native";
import { WalletCard } from "@/components/wallet-card";
import { CreateWalletModal } from "@/components/create-wallet-modal";
import { useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SearchWalletScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBook, setEditingBook] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteBook = (book: BookData) => {
    // Add real delete logic here later
  };

  const handleRename = (book: BookData) => {
    setEditingBook({ id: book.id, name: book.name });
    setShowCreateModal(true);
  };

  const handleAddMember = (book: BookData) => {
    // Add member logic
  };

  // API-based search using the debounced query
  const { data: booksData, isLoading } = useBooks({
    search: debouncedQuery.trim() || undefined,
    sort: "updated_at",
    sort_order: "desc",
  });

  const books = booksData?.data ?? [];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackVisible: false,
          headerTitle: () => (
            <View className="flex-row items-center flex-1 mr-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="mr-3 p-1"
              >
                <ArrowLeft size={22} color="#111827" />
              </TouchableOpacity>
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-1.5">
                <Search size={18} color="#9CA3AF" />
                <TextInput
                  ref={inputRef}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search wallets..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-base text-gray-900"
                  autoFocus={true}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    className="ml-2 p-1"
                  >
                    <X size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ),
          headerTitleAlign: "left",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerShadowVisible: false,
        }}
      />
      <View className="flex-1 bg-white px-4">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#00929A" />
          </View>
        ) : books.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Search size={48} color="#D1D5DB" />
            <Text className="text-gray-400 text-base mt-4">
              {debouncedQuery.trim()
                ? `No wallets found for "${debouncedQuery}"`
                : "Search your wallets"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={books}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item: book }) => (
              <WalletCard
                book={book}
                onRename={handleRename}
                onAddMember={handleAddMember}
                onDelete={handleDeleteBook}
              />
            )}
          />
        )}
      </View>

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
