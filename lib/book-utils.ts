import { Book, Transaction } from "./book-context";

export function calculateBookBalance(book: Book): {
  totalIn: number;
  totalOut: number;
  balance: number;
} {
  let totalIn = 0;
  let totalOut = 0;

  book.transactions.forEach((transaction) => {
    if (transaction.type === "deposit") {
      totalIn += transaction.amount;
    } else {
      totalOut += transaction.amount;
    }
  });

  return {
    totalIn,
    totalOut,
    balance: totalIn - totalOut,
  };
}

export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numericAmount || 0);
}

export function getTransactionsByDate(transactions: Transaction[]): Record<string, Transaction[]> {
  return transactions.reduce(
    (acc, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    },
    {} as Record<string, Transaction[]>
  );
}

export function getCategoryIcon(categoryId: string): string {
  const icons: Record<string, string> = {
    food: "🍔",
    transport: "🚗",
    entertainment: "🎬",
    shopping: "🛍️",
    utilities: "💡",
    health: "🏥",
    salary: "💰",
    other: "📝",
  };
  return icons[categoryId] || "📝";
}

export function getCategoryName(categoryId: string): string {
  const names: Record<string, string> = {
    food: "Food",
    transport: "Transport",
    entertainment: "Entertainment",
    shopping: "Shopping",
    utilities: "Utilities",
    health: "Health",
    salary: "Salary",
    other: "Other",
  };
  return names[categoryId] || "Other";
}

export function formatUpdateDate(dateString: string | undefined): string {
  if (!dateString) return "Updated just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `Updated ${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    }
    const hours = Math.floor(diffHours);
    return `Updated ${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  const formattedDate = date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    .replace(",", "");

  return `Updated on ${formattedDate}`;
}
