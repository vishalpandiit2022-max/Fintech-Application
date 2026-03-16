import { useGetDashboard } from "@workspace/api-client-react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { format } from "date-fns";
import { 
  DollarSign, 
  CreditCard, 
  PiggyBank, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();

  if (isLoading || !dashboard) {
    return (
      <SidebarLayout>
        <div className="w-full h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-muted-foreground animate-pulse">
            <Activity className="w-10 h-10 animate-bounce" />
            <p>Compiling your financial overview...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const { salary, totalExpenses, netSavings, savingsRate, recentExpenses } = dashboard;

  const StatCard = ({ title, amount, icon: Icon, type = "neutral" }: any) => (
    <div className="bg-card p-6 rounded-3xl border border-border shadow-lg hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${
          type === "positive" ? "bg-primary/10 text-primary" : 
          type === "negative" ? "bg-destructive/10 text-destructive" : 
          "bg-blue-500/10 text-blue-500"
        }`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div>
        <h3 className="text-muted-foreground font-medium text-sm mb-1">{title}</h3>
        <p className="text-3xl font-display font-bold text-foreground tracking-tight">
          {title.includes('Rate') ? `${amount.toFixed(1)}%` : `$${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
        </p>
      </div>
    </div>
  );

  // Group expenses by category for chart
  const expensesByCategory = recentExpenses.reduce((acc: any, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});
  
  const chartData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  })).sort((a, b) => b.value - a.value);

  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#6366f1'];

  return (
    <SidebarLayout>
      <div className="space-y-8 pb-10">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground text-lg">Here's what's happening with your money this month.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard title="Monthly Salary" amount={salary} icon={DollarSign} type="neutral" />
          <StatCard title="Total Expenses" amount={totalExpenses} icon={CreditCard} type="negative" />
          <StatCard title="Net Savings" amount={netSavings} icon={PiggyBank} type="positive" />
          <StatCard title="Savings Rate" amount={savingsRate} icon={TrendingUp} type={savingsRate >= 20 ? "positive" : "negative"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Area */}
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-lg flex flex-col min-h-[400px]">
            <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Expense Distribution
            </h3>
            {chartData.length > 0 ? (
              <div className="flex-1 w-full h-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}}
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                No expense data available for charts.
              </div>
            )}
          </div>

          {/* Recent Expenses */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-lg flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display font-bold">Recent Expenses</h3>
            </div>
            
            {recentExpenses.length > 0 ? (
              <div className="space-y-4 flex-1">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm line-clamp-1">{expense.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className="bg-secondary px-2 py-0.5 rounded-md">{expense.category}</span>
                          <span>•</span>
                          <span>{format(new Date(expense.date), 'MMM dd')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">-${expense.amount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-center py-10 border-2 border-dashed border-border rounded-2xl">
                <Receipt className="w-12 h-12 mb-3 opacity-20" />
                <p>No recent expenses.</p>
                <p className="text-sm mt-1">Add some to see them here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
}
