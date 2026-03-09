import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";



export default function Login() {
  const [selectedRole] = useState<UserRole>("worker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const { login, signup, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && user) {
      const roleRoutes: Record<UserRole, string> = {
        client: "/client",
        worker: "/worker",
        hr: "/hr",
      };
      navigate(roleRoutes[user.role] || "/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password, fullName, selectedRole);
        toast({ title: "Account created!", description: "Check your email to confirm, then sign in." });
        setIsSignup(false);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-sm">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-foreground/20">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-primary-foreground">EvalAI</span>
          </div>
          <h2 className="mb-3 text-2xl font-bold text-primary-foreground">AI-Powered Technical Recruitment</h2>
          <p className="text-sm text-primary-foreground/70 leading-relaxed">
            Evaluate candidates with precision. Our AI engine analyzes code quality, algorithmic thinking,
            and problem-solving capabilities to help you build the best team.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h1 className="mb-1 text-xl font-bold text-foreground">
              {isSignup ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignup ? "Select your role and create an account." : "Sign in to continue."}
            </p>
          </div>


          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignup && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs">Full Name</Label>
                <Input id="fullName" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (isSignup ? "Creating account…" : "Signing in…") : (isSignup ? "Create Account" : "Sign In")}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => setIsSignup(!isSignup)} className="font-medium text-primary hover:underline">
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
