import { describe, it, expect } from "vitest";
import {
  calculateBookBalance,
  formatCurrency,
  getTransactionsByDate,
  getCategoryIcon,
  getCategoryName,
} from "./book-utils";
import { Book, Transaction } from "./book-context";

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "deposit",
    amount: 1000,
    category: "salary",
    description: "Monthly salary",
    date: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    type: "expense",
    amount: 50,
    category: "food",
    description: "Lunch",
    date: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    type: "expense",
    amount: 30,
    category: "transport",
    description: "Gas",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
  },
];

const mockBook: Book = {
  id: "1",
  name: "January Expense",
  transactions: mockTransactions,
  createdAt: new Date().toISOString(),
};

describe("Book Utils", () => {
  describe("calculateBookBalance", () => {
    it("should calculate total in, total out, and balance", () => {
      const { totalIn, totalOut, balance } = calculateBookBalance(mockBook);
      expect(totalIn).toBe(1000);
      expect(totalOut).toBe(80);
      expect(balance).toBe(920);
    });

    it("should handle empty transactions", () => {
      const emptyBook: Book = {
        ...mockBook,
        transactions: [],
      };
      const { totalIn, totalOut, balance } = calculateBookBalance(emptyBook);
      expect(totalIn).toBe(0);
      expect(totalOut).toBe(0);
      expect(balance).toBe(0);
    });
  });

  describe("formatCurrency", () => {
    it("should format numbers as USD currency", () => {
      expect(formatCurrency(1000)).toBe("$1,000.00");
      expect(formatCurrency(50)).toBe("$50.00");
      expect(formatCurrency(0)).toBe("$0.00");
    });
  });

  describe("getTransactionsByDate", () => {
    it("should group transactions by date", () => {
      const grouped = getTransactionsByDate(mockTransactions);
      expect(Object.keys(grouped).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getCategoryIcon", () => {
    it("should return correct icons for categories", () => {
      expect(getCategoryIcon("salary")).toBe("💰");
      expect(getCategoryIcon("food")).toBe("🍔");
      expect(getCategoryIcon("transport")).toBe("🚗");
      expect(getCategoryIcon("unknown")).toBe("📝");
    });
  });

  describe("getCategoryName", () => {
    it("should return correct names for categories", () => {
      expect(getCategoryName("salary")).toBe("Salary");
      expect(getCategoryName("food")).toBe("Food");
      expect(getCategoryName("transport")).toBe("Transport");
      expect(getCategoryName("unknown")).toBe("Other");
    });
  });
});
