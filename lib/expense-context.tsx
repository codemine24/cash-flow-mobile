import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string; // ISO date string
  notes: string;
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface ExpenseState {
  expenses: Expense[];
  categories: ExpenseCategory[];
  isLoading: boolean;
}

type ExpenseAction =
  | { type: "SET_EXPENSES"; payload: Expense[] }
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "UPDATE_EXPENSE"; payload: Expense }
  | { type: "DELETE_EXPENSE"; payload: string }
  | { type: "SET_CATEGORIES"; payload: ExpenseCategory[] }
  | { type: "ADD_CATEGORY"; payload: ExpenseCategory }
  | { type: "SET_LOADING"; payload: boolean };

const defaultCategories: ExpenseCategory[] = [
  { id: "1", name: "Food", color: "#FF6B6B", icon: "restaurant" },
  { id: "2", name: "Transport", color: "#4ECDC4", icon: "directions-car" },
  { id: "3", name: "Entertainment", color: "#FFE66D", icon: "movie" },
  { id: "4", name: "Shopping", color: "#FF69B4", icon: "shopping-bag" },
  { id: "5", name: "Utilities", color: "#95E1D3", icon: "lightbulb" },
  { id: "6", name: "Health", color: "#C7CEEA", icon: "local-hospital" },
  { id: "7", name: "Other", color: "#B0B0B0", icon: "category" },
];

const initialState: ExpenseState = {
  expenses: [],
  categories: defaultCategories,
  isLoading: true,
};

function expenseReducer(state: ExpenseState, action: ExpenseAction): ExpenseState {
  switch (action.type) {
    case "SET_EXPENSES":
      return { ...state, expenses: action.payload, isLoading: false };
    case "ADD_EXPENSE":
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case "UPDATE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.map((exp) =>
          exp.id === action.payload.id ? action.payload : exp
        ),
      };
    case "DELETE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.filter((exp) => exp.id !== action.payload),
      };
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface ExpenseContextType {
  state: ExpenseState;
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (category: Omit<ExpenseCategory, "id">) => Promise<void>;
  loadExpenses: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // Load expenses from AsyncStorage on mount
  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, []);

  const loadExpenses = async () => {
    try {
      const stored = await AsyncStorage.getItem("expenses");
      if (stored) {
        dispatch({ type: "SET_EXPENSES", payload: JSON.parse(stored) });
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error) {
      console.error("Failed to load expenses:", error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const loadCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem("categories");
      if (stored) {
        dispatch({ type: "SET_CATEGORIES", payload: JSON.parse(stored) });
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const addExpense = async (expense: Omit<Expense, "id" | "createdAt">) => {
    try {
      const newExpense: Expense = {
        ...expense,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_EXPENSE", payload: newExpense });

      const updated = [newExpense, ...state.expenses];
      await AsyncStorage.setItem("expenses", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to add expense:", error);
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const expense = state.expenses.find((e) => e.id === id);
      if (!expense) return;

      const updated = { ...expense, ...updates };
      dispatch({ type: "UPDATE_EXPENSE", payload: updated });

      const newList = state.expenses.map((e) => (e.id === id ? updated : e));
      await AsyncStorage.setItem("expenses", JSON.stringify(newList));
    } catch (error) {
      console.error("Failed to update expense:", error);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      dispatch({ type: "DELETE_EXPENSE", payload: id });

      const newList = state.expenses.filter((e) => e.id !== id);
      await AsyncStorage.setItem("expenses", JSON.stringify(newList));
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  const addCategory = async (category: Omit<ExpenseCategory, "id">) => {
    try {
      const newCategory: ExpenseCategory = {
        ...category,
        id: Date.now().toString(),
      };
      dispatch({ type: "ADD_CATEGORY", payload: newCategory });

      const updated = [...state.categories, newCategory];
      await AsyncStorage.setItem("categories", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        state,
        addExpense,
        updateExpense,
        deleteExpense,
        addCategory,
        loadExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within ExpenseProvider");
  }
  return context;
}
