import { formatCurrency, formatUpdateDate } from "@/lib/book-utils";
import { Book as BookIcon, Edit3, MoreVertical, Trash2, UserPlus } from "lucide-react-native";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import Popover from "react-native-popover-view";
import { useRouter } from "expo-router";
import { useState } from "react";
import type { BookData } from "@/api/books";

interface WalletCardProps {
  book: BookData;
  onRename?: (book: BookData) => void;
  onAddMember?: (book: BookData) => void;
  onDelete?: (book: BookData) => void;
}

export const WalletCard = ({
  book,
  onRename,
  onAddMember,
  onDelete,
}: WalletCardProps) => {
  const router = useRouter();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleAction = (action?: (book: BookData) => void) => {
    setIsMenuVisible(false);
    if (action) {
      // Small timeout to allow popover to close before opening other modals
      setTimeout(() => {
        action(book);
      }, 100);
    }
  };

  // If no action props are passed, hide the 3-dot menu entirely (e.g., in Search screen)
  const showMenu = !!(onRename || onAddMember || onDelete);

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/book/[id]",
          params: { id: book.id },
        } as any)
      }
      className="bg-surface rounded-2xl p-3 mt-3 border border-border active:opacity-70 flex-row items-center justify-between"
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
          <BookIcon size={26} color="#00929A" />
        </View>
        <View className="flex-1 mr-4">
          <Text
            className="text-gray-900 font-bold text-[15px]"
            numberOfLines={1}
          >
            {book.name}
          </Text>
          <Text className="text-sm text-muted mt-0.5">
            {formatUpdateDate(book.updated_at)}
          </Text>
        </View>
      </View>

      {/* Right: Amount and Options Menu */}
      <View className="flex-row items-center">
        <Text
          className={`text-sm font-semibold mr-1 ${book.balance > 0 ? "text-[#2E7D32]" : "text-[#C62828]"
            }`}
        >
          {formatCurrency(book.balance)}
        </Text>

        {showMenu && (
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
              width: 220,
              elevation: 4,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 8,
              borderColor: "#e5e7eb",
              borderWidth: StyleSheet.hairlineWidth,
            }}
            backgroundStyle={{
              backgroundColor: "transparent",
            }}
          >
            <View className="bg-white flex flex-col gap-4">
              {onRename && (
                <TouchableOpacity
                  onPress={() => handleAction(onRename)}
                  className="flex-row items-center"
                >
                  <Edit3 size={20} color="#6b7280" />
                  <Text className="ml-4 text-[16px] text-[#111827]">
                    Rename
                  </Text>
                </TouchableOpacity>
              )}

              {onAddMember && (
                <TouchableOpacity
                  onPress={() => handleAction(onAddMember)}
                  className="flex-row items-center"
                >
                  <UserPlus size={20} color="#6b7280" />
                  <Text className="ml-4 text-[16px] text-[#111827]">
                    Add Members
                  </Text>
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity
                  onPress={() => handleAction(onDelete)}
                  className="flex-row items-center mt-1"
                >
                  <Trash2 size={20} color="#ef4444" />
                  <Text className="ml-4 text-[16px] text-red-500">
                    Delete Wallet
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Popover>
        )}
      </View>
    </TouchableOpacity>
  );
};