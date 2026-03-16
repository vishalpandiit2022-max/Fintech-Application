import { useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { 
  useGetSavingsGoals, 
  useCreateSavingsGoal, 
  useDeleteSavingsGoal,
  getGetSavingsGoalsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Target, CalendarDays, DollarSign, Trash2, X, TrendingUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Savings() {
  const queryClient = useQueryClient();
  const { data: goals = [], isLoading } = useGetSavingsGoals();
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    goalName: "",
    targetAmount: "",
    months: ""
  });

  const createMutation = useCreateSavingsGoal({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSavingsGoalsQueryKey() });
        setShowForm(false);
        setFormData({ goalName: "", targetAmount: "", months: "" });
      }
    }
  });

  const deleteMutation = useDeleteSavingsGoal({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSavingsGoalsQueryKey() });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.goalName || !formData.targetAmount || !formData.months) return;
    
    createMutation.mutate({
      data: {
        goalName: formData.goalName,
        targetAmount: Number(formData.targetAmount),
        months: Number(formData.months)
      }
    });
  };

  return (
    <SidebarLayout>
      <div className="space-y-8 pb-10">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
              Savings Goals
              <Sparkles className="w-6 h-6 text-primary" />
            </h1>
            <p className="text-muted-foreground mt-1">Plan for your future with structured targets.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? "Cancel" : "New Goal"}
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
              <div className="bg-card border border-primary/30 shadow-xl shadow-primary/5 rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 relative z-10">
                  <Target className="w-5 h-5 text-primary" />
                  Define Your Target
                </h3>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Goal Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Target className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.goalName}
                        onChange={(e) => setFormData({...formData, goalName: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="e.g., Vacation Fund"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Target Amount</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="1"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="5000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Timeline (Months)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <CalendarDays className="w-5 h-5" />
                      </div>
                      <input
                        type="number"
                        required
                        min="1"
                        step="1"
                        value={formData.months}
                        onChange={(e) => setFormData({...formData, months: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="12"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-3 flex justify-end mt-2 border-t border-border pt-6">
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {createMutation.isPending ? "Creating..." : "Create Goal"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 bg-card border border-border rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
              <Target className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2">No active goals</h3>
            <p className="text-muted-foreground max-w-md">Setting financial goals is the first step to achieving them. Create your first target to start tracking.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {goals.map((goal, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={goal.id} 
                className="bg-card border border-border hover:border-primary/30 rounded-3xl p-6 shadow-lg relative overflow-hidden group transition-all duration-300"
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-8 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="p-3 bg-secondary rounded-2xl">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <button 
                    onClick={() => {
                      if(confirm("Delete this goal?")) deleteMutation.mutate({ id: goal.id });
                    }}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-foreground mb-1 truncate" title={goal.goalName}>
                    {goal.goalName}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-display font-bold">${goal.targetAmount.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm font-medium">target</span>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4" /> Timeline
                      </span>
                      <span className="font-semibold text-foreground">{goal.months} months</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-primary/10 border border-primary/20 rounded-xl">
                      <span className="text-primary font-medium flex items-center gap-1.5 text-sm">
                        <TrendingUp className="w-4 h-4" /> Monthly requirement
                      </span>
                      <span className="font-bold text-primary">${goal.monthlySaving.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
