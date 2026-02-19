import { Expense } from "./expense-context";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getTodayExpenses(expenses: Expense[]): Expense[] {
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  return expenses.filter((exp) => exp.date === todayString);
}

export function getRecentExpenses(expenses: Expense[], limit: number = 10): Expense[] {
  return expenses.slice(0, limit);
}

export function getExpensesByCategory(expenses: Expense[]): Record<string, Expense[]> {
  return expenses.reduce(
    (acc, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = [];
      }
      acc[exp.category].push(exp);
      return acc;
    },
    {} as Record<string, Expense[]>
  );
}

export function getTotalByCategory(expenses: Expense[]): Record<string, number> {
  return expenses.reduce(
    (acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    },
    {} as Record<string, number>
  );
}

export function getMonthlyExpenses(expenses: Expense[], date: Date = new Date()): Expense[] {
  return expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return (
      expDate.getMonth() === date.getMonth() &&
      expDate.getFullYear() === date.getFullYear()
    );
  });
}

export function getWeeklyExpenses(expenses: Expense[], date: Date = new Date()): Expense[] {
  const weekAgo = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
  return expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate >= weekAgo && expDate <= date;
  });
}

export function getYearlyExpenses(expenses: Expense[], year: number = new Date().getFullYear()): Expense[] {
  return expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate.getFullYear() === year;
  });
}
