import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useBooks } from "@/lib/book-context";
import { useGoals } from "@/lib/goal-context";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import { formatCurrency as bookFormatCurrency, getCategoryIcon, getCategoryName } from "@/lib/book-utils";
import { calculateGoalProgress, calculateGoalSaved } from "@/lib/goal-utils";
import { cn } from "@/lib/utils";

type TimePeriod = "week" | "month";

// ─── Date filtering helpers ───────────────────────────────────────────────
function isWithinDays(dateStr: string, days: number): boolean {
  const date = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

// ─── Small reusable components ────────────────────────────────────────────

/** Section heading used throughout the screen */
function SectionTitle({ children }: { children: string }) {
  return <Text className="text-lg font-bold text-foreground mb-4">{children}</Text>;
}

/** A single stat card: label on top, big value below */
function StatCard({
  label,
  value,
  valueColor,
  sub,
}: {
  label: string;
  value: string;
  valueColor?: string;
  sub?: string;
}) {
  return (
    <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
      <Text className="text-xs text-muted font-medium mb-1 text-center">{label}</Text>
      <Text
        className="text-xl font-bold text-center"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </Text>
      {sub ? <Text className="text-xs text-muted mt-1 text-center">{sub}</Text> : null}
    </View>
  );
}

/** Horizontal bar row (used for category breakdown) */
function BarRow({
  label,
  icon,
  amount,
  percentage,
  barColor,
}: {
  label: string;
  icon: string;
  amount: number;
  percentage: number;
  barColor: string;
}) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center flex-1">
          <Text className="mr-2 text-base">{icon}</Text>
          <Text className="text-sm font-medium text-foreground flex-1" numberOfLines={1}>
            {label}
          </Text>
        </View>
        <Text className="text-sm font-bold text-foreground ml-2">
          {bookFormatCurrency(amount)}
        </Text>
      </View>
      <View className="h-2 bg-background rounded-full overflow-hidden border border-border">
        <View
          className="h-full rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </View>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────

export default function StatisticsScreen() {
  const colors = useColors();
  const { state: bookState } = useBooks();
  const { state: goalState } = useGoals();
  const [period, setPeriod] = useState<TimePeriod>("month");

  const days = period === "week" ? 7 : 30;

  // ── Expense calculations ───────────────────────────────────────────────

  // Flatten all transactions across all books, filtered by time period
  const allTransactions = bookState.books.flatMap((b) =>
    b.transactions.filter((t) => isWithinDays(t.createdAt, days))
  );

  const totalIncome = allTransactions
    .filter((t) => t.type === "deposit")
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Spending by category — only expense transactions
  const expenseTransactions = allTransactions.filter((t) => t.type === "expense");
  const byCategory: Record<string, number> = {};
  expenseTransactions.forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
  });
  const sortedCategories = Object.entries(byCategory).sort(([, a], [, b]) => b - a);
  const maxCategoryAmount = Math.max(...Object.values(byCategory), 1);

  // Active books (have at least 1 transaction in the period)
  const activeBooksCount = bookState.books.filter((b) =>
    b.transactions.some((t) => isWithinDays(t.createdAt, days))
  ).length;

  // Average daily spend
  const avgDaily = days > 0 ? totalExpense / days : 0;

  // ── Goal calculations ──────────────────────────────────────────────────

  // Total saved vs total target across all goals
  const totalSaved = goalState.goals.reduce((s, g) => s + calculateGoalSaved(g), 0);
  const totalTarget = goalState.goals.reduce((s, g) => s + g.target, 0);
  const overallGoalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  // Goals added funds in the current period
  const goalFundsAdded = goalState.goals.flatMap((g) =>
    g.entries.filter((e) => e.type === "add" && isWithinDays(e.createdAt, days))
  ).reduce((s, e) => s + e.amount, 0);

  const goalsCompleted = goalState.goals.filter((g) => calculateGoalProgress(g) >= 100).length;
  const goalsInProgress = goalState.goals.filter((g) => {
    const p = calculateGoalProgress(g);
    return p > 0 && p < 100;
  }).length;

  return (
    <ScreenContainer edges={["left", "right"]} className="p-4 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Header ── */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Statistics</Text>
          <Text className="text-sm text-muted mt-1">Your financial overview</Text>
        </View>

        {/* ── Period toggle ── */}
        <View className="flex-row gap-2 mb-6 bg-surface rounded-lg p-1 border border-border">
          {(["week", "month"] as const).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              className={cn(
                "flex-1 py-2 rounded-md items-center justify-center",
                period === p ? "bg-primary" : "bg-transparent"
              )}
            >
              <Text
                className={cn(
                  "text-sm font-semibold",
                  period === p ? "text-white" : "text-foreground"
                )}
              >
                {p === "week" ? "This Week" : "This Month"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ════════════════════════════════════════
            SECTION 1 — EXPENSES
        ════════════════════════════════════════ */}
        <View className="mb-2">
          <View className="flex-row items-center gap-2 mb-4">
            <Text className="text-lg font-bold text-foreground">💸 Expenses</Text>
            <View className="flex-1 h-px bg-border" />
          </View>
        </View>

        {/* Top 3 stat cards */}
        <View className="flex-row gap-3 mb-4">
          <StatCard
            label="Total Spent"
            value={bookFormatCurrency(totalExpense)}
            valueColor={colors.error}
          />
          <StatCard
            label="Income"
            value={bookFormatCurrency(totalIncome)}
            valueColor={colors.success}
          />
        </View>
        <View className="flex-row gap-3 mb-6">
          <StatCard
            label="Net Balance"
            value={bookFormatCurrency(netBalance)}
            valueColor={netBalance >= 0 ? colors.success : colors.error}
          />
          <StatCard
            label="Avg / Day"
            value={bookFormatCurrency(avgDaily)}
            sub={`over ${days} days`}
          />
        </View>

        {/* Active books row */}
        <View className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-xs text-muted font-medium">Active Books</Text>
            <Text className="text-2xl font-bold text-foreground mt-0.5">{activeBooksCount}</Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-muted font-medium">Transactions</Text>
            <Text className="text-2xl font-bold text-foreground mt-0.5">
              {allTransactions.length}
            </Text>
          </View>
        </View>

        {/* Spending by category */}
        {sortedCategories.length > 0 ? (
          <View className="bg-surface rounded-xl p-4 border border-border mb-8">
            <SectionTitle>Spending by Category</SectionTitle>
            {sortedCategories.map(([catId, amount]) => (
              <BarRow
                key={catId}
                label={getCategoryName(catId)}
                icon={getCategoryIcon(catId)}
                amount={amount}
                percentage={(amount / maxCategoryAmount) * 100}
                barColor={colors.error}
              />
            ))}
          </View>
        ) : (
          <View className="bg-surface rounded-xl p-6 border border-border items-center mb-8">
            <Text className="text-muted text-sm text-center">
              No expense transactions {period === "week" ? "this week" : "this month"}
            </Text>
          </View>
        )}

        {/* ════════════════════════════════════════
            SECTION 2 — GOALS
        ════════════════════════════════════════ */}
        <View className="mb-2">
          <View className="flex-row items-center gap-2 mb-4">
            <Text className="text-lg font-bold text-foreground">🎯 Goals</Text>
            <View className="flex-1 h-px bg-border" />
          </View>
        </View>

        {goalState.goals.length === 0 ? (
          <View className="bg-surface rounded-xl p-6 border border-border items-center mb-6">
            <Text className="text-muted text-sm text-center">
              No goals created yet
            </Text>
          </View>
        ) : (
          <>
            {/* Goal summary stat cards */}
            <View className="flex-row gap-3 mb-4">
              <StatCard
                label="Total Saved"
                value={bookFormatCurrency(totalSaved)}
                valueColor={colors.primary}
              />
              <StatCard
                label="Total Target"
                value={bookFormatCurrency(totalTarget)}
              />
            </View>
            <View className="flex-row gap-3 mb-4">
              <StatCard
                label="Added This Period"
                value={bookFormatCurrency(goalFundsAdded)}
                valueColor={colors.success}
              />
              <StatCard
                label="Completed"
                value={`${goalsCompleted} / ${goalState.goals.length}`}
                sub={`${goalsInProgress} in progress`}
              />
            </View>

            {/* Overall goal progress bar */}
            <View className="bg-surface rounded-xl p-4 border border-border mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-semibold text-foreground">Overall Progress</Text>
                <Text className="text-sm font-bold" style={{ color: colors.primary }}>
                  {overallGoalProgress.toFixed(1)}%
                </Text>
              </View>
              <View className="h-3 bg-background rounded-full overflow-hidden border border-border">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${overallGoalProgress}%`,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
              <Text className="text-xs text-muted mt-2">
                {bookFormatCurrency(totalSaved)} saved of {bookFormatCurrency(totalTarget)}
              </Text>
            </View>

            {/* Per-goal progress list */}
            <View className="bg-surface rounded-xl border border-border overflow-hidden mb-6">
              <View className="px-4 pt-4 pb-2">
                <SectionTitle>Goal Breakdown</SectionTitle>
              </View>
              {goalState.goals.map((goal, index) => {
                const saved = calculateGoalSaved(goal);
                const progress = calculateGoalProgress(goal);
                const isComplete = progress >= 100;
                return (
                  <View
                    key={goal.id}
                    className={cn(
                      "px-4 pb-4",
                      index !== goalState.goals.length - 1 && "border-b border-border mb-4"
                    )}
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm font-semibold text-foreground flex-1" numberOfLines={1}>
                        {goal.name}
                      </Text>
                      {isComplete ? (
                        <Text className="text-xs font-bold text-success ml-2">✓ Done</Text>
                      ) : (
                        <Text
                          className="text-xs font-bold ml-2"
                          style={{ color: colors.primary }}
                        >
                          {progress.toFixed(0)}%
                        </Text>
                      )}
                    </View>
                    <View className="h-2 bg-background rounded-full overflow-hidden border border-border mb-1">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: isComplete ? colors.success : colors.primary,
                        }}
                      />
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">
                        {bookFormatCurrency(saved)} saved
                      </Text>
                      <Text className="text-xs text-muted">
                        {bookFormatCurrency(goal.target)} target
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
