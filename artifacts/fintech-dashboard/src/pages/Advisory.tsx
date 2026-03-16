import { useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useGetDashboard } from "@workspace/api-client-react";
import {
  BrainCircuit,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Utensils,
  PartyPopper,
  ChevronDown,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type RiskLevel = "Low" | "Medium" | "High";
type Horizon = "" | "Less than 1 year" | "1–3 years" | "3–5 years" | "5–10 years" | "10+ years";

interface PlanTip {
  id: string;
  type: "success" | "warning" | "critical" | "info";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  message: string;
}

export default function Advisory() {
  const { data: dashboard, isLoading } = useGetDashboard();

  const [totalSavings, setTotalSavings] = useState("");
  const [financialGoals, setFinancialGoals] = useState("");
  const [risk, setRisk] = useState<RiskLevel>("Medium");
  const [horizon, setHorizon] = useState<Horizon>("");
  const [plan, setPlan] = useState<PlanTip[] | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    setTimeout(() => {
      const tips: PlanTip[] = [];
      const salary = dashboard?.salary ?? 0;
      const savingsRate = dashboard?.savingsRate ?? 0;
      const recentExpenses = dashboard?.recentExpenses ?? [];

      const categoryTotals: Record<string, number> = {};
      recentExpenses.forEach((exp) => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      });

      const savings = parseFloat(totalSavings) || 0;

      // Risk-based tip
      if (risk === "Low") {
        tips.push({
          id: "risk-low",
          type: "info",
          icon: ShieldCheck,
          title: "Conservative Strategy Recommended",
          message:
            "Given your low risk tolerance, focus on high-yield savings accounts, government bonds, and fixed deposits. Prioritize capital preservation over growth.",
        });
      } else if (risk === "Medium") {
        tips.push({
          id: "risk-medium",
          type: "info",
          icon: TrendingUp,
          title: "Balanced Portfolio Approach",
          message:
            "A balanced mix of index funds (60%), bonds (30%), and cash equivalents (10%) suits your medium risk profile. Review quarterly and rebalance annually.",
        });
      } else {
        tips.push({
          id: "risk-high",
          type: "info",
          icon: Sparkles,
          title: "Growth-Oriented Strategy",
          message:
            "With high risk tolerance, consider equity-heavy portfolios (80%+ stocks), growth ETFs, and sector funds. Diversify across geographies to manage concentration risk.",
        });
      }

      // Horizon-based tip
      if (horizon === "Less than 1 year") {
        tips.push({
          id: "horizon-short",
          type: "warning",
          icon: AlertTriangle,
          title: "Short Horizon Alert",
          message:
            "With less than 1 year, avoid volatile assets. Stick to money-market funds and short-term bonds to protect your capital.",
        });
      } else if (horizon === "10+ years") {
        tips.push({
          id: "horizon-long",
          type: "success",
          icon: CheckCircle2,
          title: "Long Horizon Advantage",
          message:
            "A 10+ year horizon gives you the power of compounding. Maximize contributions to tax-advantaged accounts and stay invested through market cycles.",
        });
      }

      // Savings rate tip
      if (savingsRate < 20) {
        tips.push({
          id: "low-savings",
          type: "critical",
          icon: AlertTriangle,
          title: "Critical: Low Savings Rate",
          message: `Your savings rate is ${savingsRate.toFixed(1)}%. Before investing, aim to save at least 20% of your income. Build an emergency fund covering 3–6 months of expenses first.`,
        });
      } else {
        tips.push({
          id: "good-savings",
          type: "success",
          icon: CheckCircle2,
          title: "Strong Savings Foundation",
          message: `Excellent! You're saving ${savingsRate.toFixed(1)}% of your income. You have a solid base to begin or grow your investment portfolio.`,
        });
      }

      // Food spending
      const foodTotal = categoryTotals["Food"] || 0;
      const foodPercent = salary > 0 ? (foodTotal / salary) * 100 : 0;
      if (foodPercent > 30) {
        tips.push({
          id: "high-food",
          type: "warning",
          icon: Utensils,
          title: "High Food Spending Detected",
          message: `Food costs are ${foodPercent.toFixed(1)}% of your salary. Reducing this to under 20% would free up more capital for your investment goals.`,
        });
      }

      // Entertainment
      const entTotal = categoryTotals["Entertainment"] || 0;
      const entPercent = salary > 0 ? (entTotal / salary) * 100 : 0;
      if (entPercent > 20) {
        tips.push({
          id: "high-ent",
          type: "warning",
          icon: PartyPopper,
          title: "Entertainment Budget Alert",
          message: `Entertainment is ${entPercent.toFixed(1)}% of your budget. Consider a monthly cap to redirect funds toward your stated goals.`,
        });
      }

      // Savings amount tip
      if (savings > 0 && savings < salary * 3) {
        tips.push({
          id: "emergency-fund",
          type: "info",
          icon: TrendingDown,
          title: "Build Your Emergency Fund First",
          message: `Your current savings of $${savings.toLocaleString()} may be below 3 months of expenses. Prioritize an emergency fund before aggressive investing.`,
        });
      }

      setPlan(tips);
      setGenerating(false);
    }, 1200);
  };

  const riskOptions: RiskLevel[] = ["Low", "Medium", "High"];
  const horizonOptions: Horizon[] = [
    "Less than 1 year",
    "1–3 years",
    "3–5 years",
    "5–10 years",
    "10+ years",
  ];

  const tipStyles: Record<string, { border: string; iconBg: string; iconColor: string; bg: string }> = {
    warning: { border: "border-orange-500/30", iconBg: "bg-orange-500/10", iconColor: "text-orange-400", bg: "bg-card" },
    critical: { border: "border-destructive/40", iconBg: "bg-destructive/10", iconColor: "text-destructive", bg: "bg-destructive/5" },
    success: { border: "border-emerald-500/30", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400", bg: "bg-card" },
    info: { border: "border-primary/30", iconBg: "bg-primary/10", iconColor: "text-primary", bg: "bg-card" },
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="w-full h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
            <BrainCircuit className="w-10 h-10 text-primary" />
            <p>Loading your financial data...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 pb-10">
        <header>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
            Investment Advisory
            <BrainCircuit className="w-7 h-7 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Fill in your profile to receive a personalised investment plan.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left — Financial Profile Form */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-lg">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Your Financial Profile
            </h2>

            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Total Savings */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Total Savings ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalSavings}
                  onChange={(e) => setTotalSavings(e.target.value)}
                  placeholder="e.g. 12000"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Financial Goals */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Financial Goals</label>
                <textarea
                  value={financialGoals}
                  onChange={(e) => setFinancialGoals(e.target.value)}
                  placeholder="e.g. Buy a house in 5 years, retire at 55, fund children's education..."
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/50 resize-none"
                />
              </div>

              {/* Risk Tolerance */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">Risk Tolerance</label>
                <div className="flex gap-3">
                  {riskOptions.map((level) => {
                    const colors: Record<RiskLevel, string> = {
                      Low: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
                      Medium: "border-primary/50 bg-primary/10 text-primary",
                      High: "border-orange-500/50 bg-orange-500/10 text-orange-400",
                    };
                    const isSelected = risk === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setRisk(level)}
                        className={`flex-1 py-2.5 rounded-xl border font-semibold text-sm transition-all ${
                          isSelected
                            ? colors[level]
                            : "border-border text-muted-foreground hover:border-border/80 hover:bg-secondary/50"
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Investment Time Horizon */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Investment Time Horizon</label>
                <div className="relative">
                  <select
                    value={horizon}
                    onChange={(e) => setHorizon(e.target.value as Horizon)}
                    className="w-full appearance-none px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground pr-10 cursor-pointer"
                  >
                    <option value="" disabled>Select a time horizon...</option>
                    {horizonOptions.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get My Investment Plan
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right — Personalized Plan */}
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-lg min-h-[420px] flex flex-col">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Your Personalized Plan
            </h2>

            <AnimatePresence mode="wait">
              {!plan ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-10"
                >
                  <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <BrainCircuit className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground max-w-xs leading-relaxed">
                    Your plan will appear here once you fill out your profile and click{" "}
                    <span className="text-foreground font-medium">Get My Investment Plan</span>.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="plan"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 flex-1 overflow-y-auto"
                >
                  {plan.map((tip, index) => {
                    const style = tipStyles[tip.type];
                    const Icon = tip.icon;
                    return (
                      <motion.div
                        key={tip.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex gap-4 p-4 rounded-2xl border ${style.bg} ${style.border}`}
                      >
                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${style.iconBg}`}>
                          <Icon className={`w-5 h-5 ${style.iconColor}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold mb-1 ${style.iconColor}`}>{tip.title}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{tip.message}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
