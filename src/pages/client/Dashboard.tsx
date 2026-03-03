import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Users, CheckCircle, BarChart3, Brain, Plus, Trash2, Edit, Eye } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assessments, candidates, generateAIQuestions } from "@/lib/mock-data";

export default function ClientDashboard() {
  const [genRole, setGenRole] = useState("");
  const [genSkills, setGenSkills] = useState("");
  const [genDifficulty, setGenDifficulty] = useState("Medium");
  const [generated, setGenerated] = useState<ReturnType<typeof generateAIQuestions> | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setGenerated(generateAIQuestions(genRole, genSkills.split(",").map((s) => s.trim()), genDifficulty));
    setGenerating(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Creator Dashboard</h1>
          <p className="text-muted-foreground">Manage assessments and review AI evaluations.</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Assessments" value={assessments.length} icon={<FileText className="h-5 w-5" />} trend={{ value: 12, positive: true }} delay={0} />
          <StatCard title="Active Candidates" value={candidates.length} icon={<Users className="h-5 w-5" />} trend={{ value: 8, positive: true }} delay={0.1} />
          <StatCard title="Completed Evaluations" value={candidates.filter((c) => c.status === "selected" || c.status === "rejected").length} icon={<CheckCircle className="h-5 w-5" />} delay={0.2} />
          <StatCard title="Avg. Score" value={`${Math.round(candidates.reduce((a, c) => a + c.score, 0) / candidates.length)}%`} icon={<BarChart3 className="h-5 w-5" />} delay={0.3} />
        </div>

        <Tabs defaultValue="assessments" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="generator">AI Task Generator</TabsTrigger>
            <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          </TabsList>

          {/* Assessments tab */}
          <TabsContent value="assessments">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Assessments</h2>
                <Button size="sm" className="gradient-primary border-0 text-primary-foreground"><Plus className="mr-1.5 h-4 w-4" />Create New</Button>
              </div>
              <div className="grid gap-4">
                {assessments.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-card">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-card-foreground">{a.title}</h3>
                      <p className="text-sm text-muted-foreground">{a.role} • {a.difficulty} • {a.questions} questions</p>
                      <div className="flex gap-1.5">
                        {a.skills.map((s) => (
                          <span key={s} className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{a.completed}/{a.assigned} completed</span>
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* AI Generator tab */}
          <TabsContent value="generator">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-card-foreground">AI Task Generator</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Job Role</Label>
                    <Input placeholder="e.g. Full Stack Developer" value={genRole} onChange={(e) => setGenRole(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Required Skills (comma-separated)</Label>
                    <Input placeholder="React, Node.js, PostgreSQL" value={genSkills} onChange={(e) => setGenSkills(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty Level</Label>
                    <Select value={genDifficulty} onValueChange={setGenDifficulty}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleGenerate} disabled={generating || !genRole} className="w-full gradient-primary border-0 text-primary-foreground">
                    {generating ? "Generating with AI…" : "Generate Questions"}
                  </Button>
                </div>
              </div>

              {generated && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="rounded-xl border bg-card p-5 shadow-card">
                    <h3 className="mb-3 font-semibold text-card-foreground">Coding Questions</h3>
                    {generated.codingQuestions.map((q, i) => (
                      <p key={i} className="mb-2 rounded-lg bg-muted p-3 text-sm text-card-foreground">{q}</p>
                    ))}
                  </div>
                  <div className="rounded-xl border bg-card p-5 shadow-card">
                    <h3 className="mb-3 font-semibold text-card-foreground">Algorithm Problems</h3>
                    {generated.algorithmProblems.map((q, i) => (
                      <p key={i} className="mb-2 rounded-lg bg-muted p-3 text-sm text-card-foreground">{q}</p>
                    ))}
                  </div>
                  <div className="rounded-xl border bg-card p-5 shadow-card">
                    <h3 className="mb-3 font-semibold text-card-foreground">MCQs</h3>
                    {generated.mcqs.map((q, i) => (
                      <p key={i} className="mb-2 rounded-lg bg-muted p-3 text-sm text-card-foreground">{q}</p>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </TabsContent>

          {/* Evaluations tab */}
          <TabsContent value="evaluations">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">AI Evaluation Reports</h2>
              {candidates.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border bg-card p-5 shadow-card">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-card-foreground">{c.name}</h3>
                      <p className="text-sm text-muted-foreground">{c.role} • Submitted {c.submittedAt}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={c.status} />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm"><Eye className="mr-1.5 h-3.5 w-3.5" />Details</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>{c.name} — Evaluation Report</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-2">
                            <ScoreBar label="Syntax Analysis" score={c.syntaxScore} delay={0.1} />
                            <ScoreBar label="Logical Analysis" score={c.logicScore} delay={0.2} />
                            <ScoreBar label="Complexity Score" score={c.complexityScore} delay={0.3} />
                            <ScoreBar label="Performance Score" score={c.performanceScore} delay={0.4} />
                            <div className="rounded-lg bg-muted p-4">
                              <p className="text-sm font-semibold text-card-foreground">Overall: {c.score}%</p>
                              <p className="text-sm text-muted-foreground">
                                Recommendation: <span className={c.status === "selected" ? "text-success font-semibold" : c.status === "rejected" ? "text-destructive font-semibold" : "text-warning font-semibold"}>{c.status === "selected" ? "Selected" : c.status === "rejected" ? "Rejected" : "Hold"}</span>
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <ScoreBar label="Syntax" score={c.syntaxScore} />
                    <ScoreBar label="Logic" score={c.logicScore} />
                    <ScoreBar label="Complexity" score={c.complexityScore} />
                    <ScoreBar label="Performance" score={c.performanceScore} />
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
