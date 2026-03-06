import { Link } from "react-router-dom";
import { Brain, Zap, Shield, BarChart3, ArrowRight, Code2, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Brain, title: "AI-Powered Evaluation", description: "Advanced algorithms analyze code quality, logic, and performance in real-time." },
  { icon: Code2, title: "Integrated Code Editor", description: "Built-in coding environment with syntax highlighting and multi-language support." },
  { icon: BarChart3, title: "Smart Analytics", description: "Comprehensive scoring with visual breakdowns and actionable insights." },
  { icon: Shield, title: "Bias-Free Hiring", description: "Objective AI assessment eliminates unconscious bias in technical evaluation." },
  { icon: Users, title: "Team Collaboration", description: "HR teams can review, rank, and manage candidates from a single dashboard." },
  { icon: Zap, title: "Instant Results", description: "Get detailed evaluation reports seconds after candidate submission." },
];

const steps = [
  { num: "01", title: "Create Assessment", description: "Define role requirements and let AI generate tailored coding challenges." },
  { num: "02", title: "Candidates Code", description: "Candidates complete challenges in our integrated, timed coding environment." },
  { num: "03", title: "AI Evaluates", description: "Our engine analyzes syntax, logic, complexity, and performance metrics." },
  { num: "04", title: "Hire the Best", description: "Review ranked candidates with AI recommendations and make confident decisions." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">EvalAI</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b bg-primary py-20 lg:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-sm font-medium text-primary-foreground/70 uppercase tracking-wider">
              AI-Powered Recruitment Platform
            </p>
            <h1 className="mb-5 text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
              Hire Smarter with AI Evaluation
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/70">
              Automate technical assessments, evaluate candidates with AI precision,
              and build world-class engineering teams.
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="px-8">
                Start Evaluating <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-2xl font-bold text-foreground">Everything You Need</h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              A complete AI-driven recruitment pipeline from assessment creation to final hiring.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border bg-card p-5 transition-shadow hover:shadow-elevated"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <f.icon className="h-4 w-4" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-card-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="border-y bg-secondary py-16 lg:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-2xl font-bold text-foreground">How It Works</h2>
            <p className="mx-auto max-w-lg text-muted-foreground">Four simple steps to transform your technical hiring.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {s.num}
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="rounded-lg bg-primary p-10 text-center lg:p-16">
            <h2 className="mb-3 text-2xl font-bold text-primary-foreground lg:text-3xl">Ready to Transform Your Hiring?</h2>
            <p className="mx-auto mb-6 max-w-md text-primary-foreground/70">
              Join companies using AI to find and evaluate top engineering talent.
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="px-8">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">EvalAI</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2024 EvalAI. AI-Based E-Evaluation & Recruitment Management System.</p>
        </div>
      </footer>
    </div>
  );
}
