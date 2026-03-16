import { useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { 
  useGetExpenses, 
  useCreateExpense, 
  useDeleteExpense,
  getGetExpensesQueryKey,
  getGetDashboardQueryKey,
  type CreateExpenseRequestCategory
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Trash2, Receipt, Calendar, Tag, DollarSign, AlignLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES: CreateExpenseRequestCategory[] = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"];

export default function Expenses() {
  const queryClient = useQueryClient();
  const { data: expenses = [], isLoading } = useGetExpenses();
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    category: "Food" as CreateExpenseRequestCategory,
    amount: "",
    date: new Date().toISOString().split('T')[0]
  });

  const createMutation = useCreateExpense({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetExpensesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        setShowForm(false);
        setFormData({ ...formData, description: "", amount: "" });
      }
    }
  });

  const deleteMutation = useDeleteExpense({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetExpensesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.date) return;
    
    createMutation.mutate({
      data: {
        description: formData.description,
        category: formData.category,
        amount: Number(formData.amount),
        date: new Date(formData.date).toISOString()
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 pb-10">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Expenses</h1>
            <p className="text-muted-foreground mt-1">Track and manage your spending.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? "Cancel" : "Add Expense"}
          </button>
        </header>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-primary/30 shadow-xl shadow-primary/5 rounded-3xl p-6 mb-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  New Expense Record
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Description</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <AlignLeft className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="e.g., Grocery shopping"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Amount</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Category</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Tag className="w-5 h-5" />
                      </div>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as CreateExpenseRequestCategory})}
                        className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {createMutation.isPending ? "Saving..." : "Save Expense"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-muted-foreground">
              <Receipt className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-xl font-medium text-foreground mb-2">No expenses yet</h3>
              <p>Click the "Add Expense" button to start tracking.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/50 text-muted-foreground text-sm font-medium uppercase tracking-wider">
                    <th className="p-4 pl-6 border-b border-border">Date</th>
                    <th className="p-4 border-b border-border">Description</th>
                    <th className="p-4 border-b border-border">Category</th>
                    <th className="p-4 border-b border-border text-right">Amount</th>
                    <th className="p-4 pr-6 border-b border-border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-secondary/30 transition-colors group">
                      <td className="p-4 pl-6 text-muted-foreground whitespace-nowrap">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="p-4 font-medium text-foreground">{expense.description}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border/50">
                          {expense.category}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold font-mono">
                        ${expense.amount.toFixed(2)}
                      </td>
                      <td className="p-4 pr-6 text-center">
                        <button
                          onClick={() => handleDelete(expense.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors inline-flex disabled:opacity-50"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
