import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, User, Code2, Shield } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const roles: { value: UserRole; label: string; description: string; icon: React.ElementType }[] = [
  { value: "client", label: "Task Creator", description: "Create & manage assessments", icon: User },
  { value: "worker", label: "Candidate", description: "Take coding challenges", icon: Code2 },
  { value: "hr", label: "HR Admin", description: "Review & hire talent", icon: Shield },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password, selectedRole);
    setLoading(false);
    navigate(selectedRole === "client" ? "/client" : selectedRole === "worker" ? "/worker" : "/hr");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 gradient-hero lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground">EvalAI</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground">AI-Powered Technical Recruitment</h2>
          <p className="text-primary-foreground/60">
            Evaluate candidates with precision. Our AI engine analyzes code quality, algorithmic thinking,
            and problem-solving capabilities to help you build the best team.
          </p>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="mb-2 text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">Select your role and sign in to continue.</p>
          </div>

          {/* Role selector */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => setSelectedRole(r.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
                  selectedRole === r.value
                    ? "border-primary bg-primary/5 shadow-glow"
                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                )}
              >
                <r.icon className={cn("h-5 w-5", selectedRole === r.value ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-xs font-semibold", selectedRole === r.value ? "text-primary" : "text-foreground")}>{r.label}</span>
                <span className="text-[10px] leading-tight text-muted-foreground">{r.description}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-primary border-0 text-primary-foreground shadow-glow">
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo mode — enter any credentials to sign in with the selected role.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
