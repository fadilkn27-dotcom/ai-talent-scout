import { motion } from "framer-motion";
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
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">EvalAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="gradient-primary border-0 text-primary-foreground shadow-glow">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(230_80%_56%_/_0.12),transparent_60%)]" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Zap className="h-3.5 w-3.5" />
              AI-Powered Recruitment Platform
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              Hire Smarter with{" "}
              <span className="text-gradient">AI Evaluation</span>
            </h1>
            <p className="mb-10 text-lg text-primary-foreground/70 sm:text-xl">
              Automate technical assessments, evaluate candidates with AI precision,
              and build world-class engineering teams — all in one platform.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/login">
                <Button size="lg" className="gradient-primary border-0 px-8 text-primary-foreground shadow-glow">
                  Start Evaluating <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-foreground">Everything You Need to Hire Better</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              A complete AI-driven recruitment pipeline — from assessment creation to final hiring decision.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-xl border bg-card p-6 shadow-card transition-all hover:shadow-elevated"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:gradient-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="border-y bg-muted/30 py-20 lg:py-28">
        <div className="container">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">Four simple steps to transform your technical hiring process.</p>
          </motion.div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-lg font-bold text-primary-foreground shadow-glow">
                  {s.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl gradient-hero p-12 text-center lg:p-20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(230_80%_56%_/_0.15),transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground lg:text-4xl">Ready to Transform Your Hiring?</h2>
              <p className="mx-auto mb-8 max-w-xl text-primary-foreground/70">
                Join forward-thinking companies using AI to find and evaluate top engineering talent.
              </p>
              <Link to="/login">
                <Button size="lg" className="gradient-primary border-0 px-10 text-primary-foreground shadow-glow">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">EvalAI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 EvalAI. AI-Based E-Evaluation & Recruitment Management System.</p>
        </div>
      </footer>
    </div>
  );
}
