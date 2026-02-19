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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
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
