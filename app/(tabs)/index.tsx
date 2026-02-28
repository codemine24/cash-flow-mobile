import { useBooks, BookData } from "@/api/books";
import { CreateWalletModal } from "@/components/create-wallet-modal";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import {
  ArrowUpDown,
  Search,
} from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WalletCard } from "@/components/wallet-card";
import { useGetAllUsers } from "@/api/user";

type SortOption = "name" | "created_at" | "updated_at";

const SORT_OPTIONS: { key: SortOption; label: string; order: "asc" | "desc" }[] = [
  { key: "name", label: "Name (A-Z)", order: "asc" },
  { key: "created_at", label: "Last Created", order: "desc" },
  { key: "updated_at", label: "Last Updated", order: "desc" },
];

export default function HomeScreen() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBook, setEditingBook] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [tempSortBy, setTempSortBy] = useState<SortOption>("updated_at");
  const [tempSortOrder, setTempSortOrder] = useState<"asc" | "desc">("desc");

  const { data: usersData, isLoading: usersLoading } = useGetAllUsers();

  console.log("usersData", usersData?.data.data);

  const openSortModal = () => {
    setTempSortBy(sortBy);
    setTempSortOrder(sortOrder);
    setShowSortModal(true);
  };

  const { data: booksData, isLoading } = useBooks({ search: "", sort: sortBy, sort_order: sortOrder });

  const handleDeleteBook = (book: BookData) => {
    // Add real delete logic here later
  };

  const handleRename = (book: BookData) => {
    setEditingBook({ id: book.id, name: book.name });
    setShowCreateModal(true);
  };

  const handleAddMember = (book: BookData) => {
    router.push({
      pathname: "/book/members",
      params: { bookId: book.id, bookName: book.name },
    } as any);
  };

  return (
    <>
      <ScreenContainer edges={["left", "right"]} className="p-4 bg-background">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground">
                Wallets
              </Text>
              <Text className="text-sm text-muted mt-1">
                Create separate wallets to organize your expenses
              </Text>
            </View>

            {/* Sort & Search Buttons */}
            <View className="flex-row items-center gap-1">
              <TouchableOpacity
                onPress={openSortModal}
                className="p-2.5 rounded-xl bg-gray-100"
              >
                <ArrowUpDown size={20} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/search-wallet" as any)}
                className="p-2.5 rounded-xl bg-gray-100"
              >
                <Search size={20} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Books List */}
          {isLoading ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-muted">Loading...</Text>
            </View>
          ) : booksData?.data?.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 items-center justify-center border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">
                No wallets yet
              </Text>
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
        </ScrollView>
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
          onPress={() => setShowCreateModal(true)}
          className="bg-primary px-6 py-[14px] rounded-2xl items-center justify-center flex-row shadow-sm"
        >
          <Text className="text-white font-bold text-sm tracking-widest text-center">
            + Add New Wallet
          </Text>
        </TouchableOpacity>
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

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSortModal(false)}
      >
        <View className="flex-1" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowSortModal(false)}
          />
          <View className="bg-white rounded-t-3xl px-6 pt-3" style={{ paddingBottom: 30 }}>
            {/* Handle */}
            <View className="items-center mb-5">
              <View className="w-10 h-1 rounded-full bg-gray-300" />
            </View>

            {/* Title */}
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-gray-900">Sort By</Text>
              <TouchableOpacity
                onPress={() => setShowSortModal(false)}
                className="p-1"
              >
                <Text className="text-sm text-gray-500">Close</Text>
              </TouchableOpacity>
            </View>

            {/* Options */}
            <View className="mb-5">
              {SORT_OPTIONS.map((option, index) => {
                const isActive = tempSortBy === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => {
                      setTempSortBy(option.key);
                      setTempSortOrder(option.order);
                    }}
                    className={`flex-row items-center py-3`}
                  >
                    {/* Radio Circle */}
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                        borderWidth: 1,
                        borderColor: isActive ? "#00929A" : "#D1D5DB",
                        borderRadius: 9999,
                      }}
                    >
                      {isActive && (
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: "#00929A",
                          }}
                        />
                      )}
                    </View>
                    <Text
                      className={`text-xl ${isActive
                        ? "font-semibold text-gray-900"
                        : "font-normal text-gray-600"
                        }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => {
                setSortBy(tempSortBy);
                setSortOrder(tempSortOrder);
                setShowSortModal(false);
              }}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-white text-base font-bold tracking-wider">
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
