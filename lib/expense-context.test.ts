import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  getTodayExpenses,
  getRecentExpenses,
  getExpensesByCategory,
  getTotalByCategory,
  getMonthlyExpenses,
  getWeeklyExpenses,
  getYearlyExpenses,
} from "./expense-utils";
import { Expense } from "./expense-context";

const mockExpenses: Expense[] = [
  {
    id: "1",
    amount: 25.5,
    category: "1",
    date: new Date().toISOString().split("T")[0],
    notes: "Lunch",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    amount: 50.0,
    category: "2",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    notes: "Gas",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    amount: 15.0,
    category: "1",
    date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    notes: "Coffee",
    createdAt: new Date().toISOString(),
  },
];

describe("Expense Utils", () => {
  describe("formatCurrency", () => {
    it("should format numbers as USD currency", () => {
      expect(formatCurrency(25.5)).toBe("$25.50");
      expect(formatCurrency(1000)).toBe("$1,000.00");
      expect(formatCurrency(0)).toBe("$0.00");
    });
  });

  describe("getTodayExpenses", () => {
    it("should return only today's expenses", () => {
      const today = getTodayExpenses(mockExpenses);
      expect(today).toHaveLength(1);
      expect(today[0].id).toBe("1");
    });

    it("should return empty array if no expenses today", () => {
      const today = getTodayExpenses([]);
      expect(today).toHaveLength(0);
    });
  });

  describe("getRecentExpenses", () => {
    it("should return limited number of recent expenses", () => {
      const recent = getRecentExpenses(mockExpenses, 2);
      expect(recent).toHaveLength(2);
    });

    it("should return all expenses if limit is higher", () => {
      const recent = getRecentExpenses(mockExpenses, 10);
      expect(recent).toHaveLength(3);
    });
  });

  describe("getExpensesByCategory", () => {
    it("should group expenses by category", () => {
      const grouped = getExpensesByCategory(mockExpenses);
      expect(grouped["1"]).toHaveLength(2);
      expect(grouped["2"]).toHaveLength(1);
    });
  });

  describe("getTotalByCategory", () => {
    it("should calculate total spending by category", () => {
      const totals = getTotalByCategory(mockExpenses);
      expect(totals["1"]).toBe(40.5);
      expect(totals["2"]).toBe(50.0);
    });
  });

  describe("getMonthlyExpenses", () => {
    it("should return expenses from current month", () => {
      const monthly = getMonthlyExpenses(mockExpenses);
      expect(monthly.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getWeeklyExpenses", () => {
    it("should return expenses from last 7 days", () => {
      const weekly = getWeeklyExpenses(mockExpenses);
      expect(weekly.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getYearlyExpenses", () => {
    it("should return expenses from current year", () => {
      const yearly = getYearlyExpenses(mockExpenses);
      expect(yearly.length).toBeGreaterThanOrEqual(1);
    });
  });
});
