import { useState, useEffect } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useGetMe, useUpdateSalary, getGetMeQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { UserCircle, Mail, DollarSign, Save, ShieldCheck } from "lucide-react";

export default function Profile() {
  const { data: user } = useGetMe();
  const queryClient = useQueryClient();
  
  const [salaryInput, setSalaryInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setSalaryInput(user.salary.toString());
    }
  }, [user]);

  const updateMutation = useUpdateSalary({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        setIsEditing(false);
      }
    }
  });

  const handleSave = () => {
    const num = Number(salaryInput);
    if (!isNaN(num) && num > 0) {
      updateMutation.mutate({ data: { salary: num } });
    }
  };

  if (!user) return <SidebarLayout><div/></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-10">
        <header>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your personal information and financial baselines.</p>
        </header>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-6 mb-10 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 text-4xl font-bold text-white uppercase border-4 border-background">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground mt-1 bg-secondary w-max px-3 py-1 rounded-full text-sm">
                <ShieldCheck className="w-4 h-4 text-primary" /> Verified Account
              </div>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name (Readonly) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                    <UserCircle className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={user.name}
                    className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-border rounded-xl text-foreground opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    readOnly
                    value={user.email}
                    className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-border rounded-xl text-foreground opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border/50 pt-8 mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Financial Baseline</h3>
                  <p className="text-sm text-muted-foreground">Your monthly income is used to calculate savings rates and AI advice.</p>
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
                  >
                    Edit Salary
                  </button>
                )}
              </div>

              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Monthly Salary ($)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <input
                      type="number"
                      disabled={!isEditing}
                      value={salaryInput}
                      onChange={(e) => setSalaryInput(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl transition-all font-mono text-lg font-bold
                        ${isEditing 
                          ? "bg-background border border-primary ring-2 ring-primary/20 text-foreground" 
                          : "bg-secondary/50 border border-border text-foreground opacity-90 cursor-not-allowed"
                        }`}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setSalaryInput(user.salary.toString());
                      }}
                      className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
