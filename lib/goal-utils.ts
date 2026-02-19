import { Goal } from "./goal-context";

/**
 * Calculate how much has been saved so far in a goal.
 * "add" entries increase the saved amount, "withdraw" decreases it.
 */
export function calculateGoalSaved(goal: Goal): number {
  return goal.entries.reduce((total, entry) => {
    return entry.type === "add" ? total + entry.amount : total - entry.amount;
  }, 0);
}

/**
 * Calculate progress as a percentage (0–100), capped at 100.
 * Example: saved=$500, target=$1000 → 50%
 */
export function calculateGoalProgress(goal: Goal): number {
  if (goal.target <= 0) return 0;
  const saved = calculateGoalSaved(goal);
  return Math.min(Math.max((saved / goal.target) * 100, 0), 100);
}

/**
 * Format a number as USD currency string.
 * Reused from book-utils pattern — keeps it consistent.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
