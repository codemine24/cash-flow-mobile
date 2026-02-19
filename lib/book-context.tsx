import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Transaction {
  id: string;
  type: "deposit" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string; // ISO date string
  createdAt: string;
}

export interface Book {
  id: string;
  name: string;
  transactions: Transaction[];
  createdAt: string;
}

interface BookState {
  books: Book[];
  isLoading: boolean;
}

type BookAction =
  | { type: "SET_BOOKS"; payload: Book[] }
  | { type: "ADD_BOOK"; payload: Book }
  | { type: "DELETE_BOOK"; payload: string }
  | { type: "ADD_TRANSACTION"; payload: { bookId: string; transaction: Transaction } }
  | { type: "DELETE_TRANSACTION"; payload: { bookId: string; transactionId: string } }
  | { type: "UPDATE_TRANSACTION"; payload: { bookId: string; transaction: Transaction } }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: BookState = {
  books: [],
  isLoading: true,
};

function bookReducer(state: BookState, action: BookAction): BookState {
  switch (action.type) {
    case "SET_BOOKS":
      return { ...state, books: action.payload, isLoading: false };
    case "ADD_BOOK":
      return { ...state, books: [action.payload, ...state.books] };
    case "DELETE_BOOK":
      return {
        ...state,
        books: state.books.filter((book) => book.id !== action.payload),
      };
    case "ADD_TRANSACTION":
      return {
        ...state,
        books: state.books.map((book) =>
          book.id === action.payload.bookId
            ? {
                ...book,
                transactions: [action.payload.transaction, ...book.transactions],
              }
            : book
        ),
      };
    case "DELETE_TRANSACTION":
      return {
        ...state,
        books: state.books.map((book) =>
          book.id === action.payload.bookId
            ? {
                ...book,
                transactions: book.transactions.filter(
                  (t) => t.id !== action.payload.transactionId
                ),
              }
            : book
        ),
      };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        books: state.books.map((book) =>
          book.id === action.payload.bookId
            ? {
                ...book,
                transactions: book.transactions.map((t) =>
                  t.id === action.payload.transaction.id ? action.payload.transaction : t
                ),
              }
            : book
        ),
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface BookContextType {
  state: BookState;
  addBook: (name: string) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  addTransaction: (
    bookId: string,
    transaction: Omit<Transaction, "id" | "createdAt">
  ) => Promise<void>;
  deleteTransaction: (bookId: string, transactionId: string) => Promise<void>;
  updateTransaction: (
    bookId: string,
    transactionId: string,
    updates: Partial<Transaction>
  ) => Promise<void>;
  loadBooks: () => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookReducer, initialState);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const stored = await AsyncStorage.getItem("books");
      if (stored) {
        dispatch({ type: "SET_BOOKS", payload: JSON.parse(stored) });
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error) {
      console.error("Failed to load books:", error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const addBook = async (name: string) => {
    try {
      const newBook: Book = {
        id: Date.now().toString(),
        name,
        transactions: [],
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_BOOK", payload: newBook });

      const updated = [newBook, ...state.books];
      await AsyncStorage.setItem("books", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to add book:", error);
    }
  };

  const deleteBook = async (bookId: string) => {
    try {
      dispatch({ type: "DELETE_BOOK", payload: bookId });

      const updated = state.books.filter((b) => b.id !== bookId);
      await AsyncStorage.setItem("books", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to delete book:", error);
    }
  };

  const addTransaction = async (
    bookId: string,
    transaction: Omit<Transaction, "id" | "createdAt">
  ) => {
    try {
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      dispatch({
        type: "ADD_TRANSACTION",
        payload: { bookId, transaction: newTransaction },
      });

      const updated = state.books.map((b) =>
        b.id === bookId
          ? { ...b, transactions: [newTransaction, ...b.transactions] }
          : b
      );
      await AsyncStorage.setItem("books", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to add transaction:", error);
    }
  };

  const deleteTransaction = async (bookId: string, transactionId: string) => {
    try {
      dispatch({
        type: "DELETE_TRANSACTION",
        payload: { bookId, transactionId },
      });

      const updated = state.books.map((b) =>
        b.id === bookId
          ? {
              ...b,
              transactions: b.transactions.filter((t) => t.id !== transactionId),
            }
          : b
      );
      await AsyncStorage.setItem("books", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const updateTransaction = async (
    bookId: string,
    transactionId: string,
    updates: Partial<Transaction>
  ) => {
    try {
      const book = state.books.find((b) => b.id === bookId);
      const transaction = book?.transactions.find((t) => t.id === transactionId);

      if (!transaction) return;

      const updated = { ...transaction, ...updates };
      dispatch({
        type: "UPDATE_TRANSACTION",
        payload: { bookId, transaction: updated },
      });

      const newBooks = state.books.map((b) =>
        b.id === bookId
          ? {
              ...b,
              transactions: b.transactions.map((t) =>
                t.id === transactionId ? updated : t
              ),
            }
          : b
      );
      await AsyncStorage.setItem("books", JSON.stringify(newBooks));
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  return (
    <BookContext.Provider
      value={{
        state,
        addBook,
        deleteBook,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        loadBooks,
      }}
    >
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBooks must be used within BookProvider");
  }
  return context;
}
