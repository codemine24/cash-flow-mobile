import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// A single money movement inside a goal (adding or withdrawing)
export interface GoalEntry {
  id: string;
  type: "add" | "withdraw";  // add = saving money, withdraw = spending from it
  amount: number;
  note: string;
  date: string;
  createdAt: string;
}

// A goal book — has a name, a target amount, and a list of entries
export interface Goal {
  id: string;
  name: string;
  target: number;           // the amount the user wants to reach
  entries: GoalEntry[];
  createdAt: string;
}

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
}

// All possible state changes (actions)
type GoalAction =
  | { type: "SET_GOALS"; payload: Goal[] }
  | { type: "ADD_GOAL"; payload: Goal }
  | { type: "DELETE_GOAL"; payload: string }
  | { type: "ADD_ENTRY"; payload: { goalId: string; entry: GoalEntry } }
  | { type: "DELETE_ENTRY"; payload: { goalId: string; entryId: string } }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: GoalState = {
  goals: [],
  isLoading: true,
};

// Reducer: a pure function that takes old state + action and returns new state
// Think of it as: "given the current data, what should the data look like after this action?"
function goalReducer(state: GoalState, action: GoalAction): GoalState {
  switch (action.type) {
    case "SET_GOALS":
      return { ...state, goals: action.payload, isLoading: false };

    case "ADD_GOAL":
      return { ...state, goals: [action.payload, ...state.goals] };

    case "DELETE_GOAL":
      return { ...state, goals: state.goals.filter((g) => g.id !== action.payload) };

    case "ADD_ENTRY":
      return {
        ...state,
        goals: state.goals.map((goal) =>
          goal.id === action.payload.goalId
            ? { ...goal, entries: [action.payload.entry, ...goal.entries] }
            : goal
        ),
      };

    case "DELETE_ENTRY":
      return {
        ...state,
        goals: state.goals.map((goal) =>
          goal.id === action.payload.goalId
            ? {
              ...goal,
              entries: goal.entries.filter((e) => e.id !== action.payload.entryId),
            }
            : goal
        ),
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

interface GoalContextType {
  state: GoalState;
  addGoal: (name: string, target: number) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  addEntry: (goalId: string, entry: Omit<GoalEntry, "id" | "createdAt">) => Promise<void>;
  deleteEntry: (goalId: string, entryId: string) => Promise<void>;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export function GoalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(goalReducer, initialState);

  // Load saved goals from device storage when the app starts
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const stored = await AsyncStorage.getItem("goals");
      if (stored) {
        dispatch({ type: "SET_GOALS", payload: JSON.parse(stored) });
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error) {
      console.error("Failed to load goals:", error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Save helper — writes the latest goals array to AsyncStorage
  const persist = async (goals: Goal[]) => {
    await AsyncStorage.setItem("goals", JSON.stringify(goals));
  };

  const addGoal = async (name: string, target: number) => {
    try {
      const newGoal: Goal = {
        id: Date.now().toString(),
        name,
        target,
        entries: [],
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_GOAL", payload: newGoal });
      await persist([newGoal, ...state.goals]);
    } catch (error) {
      console.error("Failed to add goal:", error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      dispatch({ type: "DELETE_GOAL", payload: goalId });
      await persist(state.goals.filter((g) => g.id !== goalId));
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const addEntry = async (goalId: string, entry: Omit<GoalEntry, "id" | "createdAt">) => {
    try {
      const newEntry: GoalEntry = {
        ...entry,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_ENTRY", payload: { goalId, entry: newEntry } });
      const updated = state.goals.map((g) =>
        g.id === goalId ? { ...g, entries: [newEntry, ...g.entries] } : g
      );
      await persist(updated);
    } catch (error) {
      console.error("Failed to add entry:", error);
    }
  };

  const deleteEntry = async (goalId: string, entryId: string) => {
    try {
      dispatch({ type: "DELETE_ENTRY", payload: { goalId, entryId } });
      const updated = state.goals.map((g) =>
        g.id === goalId
          ? { ...g, entries: g.entries.filter((e) => e.id !== entryId) }
          : g
      );
      await persist(updated);
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  return (
    <GoalContext.Provider value={{ state, addGoal, deleteGoal, addEntry, deleteEntry }}>
      {children}
    </GoalContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalContext);
  if (!context) throw new Error("useGoals must be used within GoalProvider");
  return context;
}
