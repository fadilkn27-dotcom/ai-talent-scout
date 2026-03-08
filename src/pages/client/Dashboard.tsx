import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Users, CheckCircle, BarChart3, Brain, Plus, Trash2, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface GeneratedQuestions {
  codingQuestions: string[];
  algorithmProblems: string[];
  mcqs: string[];
  evaluationCriteria: string[];
}

interface Assessment {
  id: string;
  title: string;
  role: string;
  skills: string[];
  difficulty: string;
  questions_count: number;
  coding_questions: string[] | null;
  algorithm_problems: string[] | null;
  mcqs: string[] | null;
  evaluation_criteria: string[];
  created_at: string;
}

interface EvalCandidate {
  id: string;
  worker_id: string;
  overall_score: number;
  syntax_score: number;
  logic_score: number;
  complexity_score: number;
  performance_score: number;
  recommendation: string;
  status: string;
  evaluated_at: string;
  feedback: string[] | null;
  worker_name?: string;
  worker_email?: string;
  assessment_title?: string;
}

export default function ClientDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tabFromPath = location.pathname.split("/")[2] || "assessments";
  const activeTab = ["assessments", "generator", "evaluations"].includes(tabFromPath) ? tabFromPath : "assessments";
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [evaluations, setEvaluations] = useState<EvalCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  // AI generator state
  const [genRole, setGenRole] = useState("");
  const [genSkills, setGenSkills] = useState("");
  const [genDifficulty, setGenDifficulty] = useState("Medium");
  const [genTitle, setGenTitle] = useState("");
  const [generated, setGenerated] = useState<GeneratedQuestions | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create assessment dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("Medium");
  const [newCriteria, setNewCriteria] = useState("");


  useEffect(() => {
    fetchAssessments();
    fetchEvaluations();
  }, []);

  async function fetchAssessments() {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setAssessments(data);
    setLoading(false);
  }

  async function fetchEvaluations() {
    const { data, error } = await supabase
      .from("evaluations")
      .select("*, assessment_assignments!inner(assessment_id, assessments!inner(title, created_by))")
      .order("evaluated_at", { ascending: false });

    if (!error && data) {
      // Fetch worker profiles
      const workerIds = [...new Set(data.map((e: any) => e.worker_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", workerIds);

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

      setEvaluations(
        data.map((e: any) => ({
          id: e.id,
          worker_id: e.worker_id,
          overall_score: e.overall_score,
          syntax_score: e.syntax_score,
          logic_score: e.logic_score,
          complexity_score: e.complexity_score,
          performance_score: e.performance_score,
          recommendation: e.recommendation,
          status: e.status,
          evaluated_at: e.evaluated_at,
          feedback: e.feedback,
          worker_name: profileMap.get(e.worker_id)?.full_name || "Unknown",
          worker_email: profileMap.get(e.worker_id)?.email || "",
          assessment_title: e.assessment_assignments?.assessments?.title || "",
        }))
      );
    }
  }

  async function handleCreateAssessment() {
    if (!newTitle || !user) return;
    const skills = newSkills.split(",").map((s) => s.trim()).filter(Boolean);
    const criteria = newCriteria.split("\n").map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase.from("assessments").insert({
      title: newTitle,
      role: newRole,
      skills,
      difficulty: newDifficulty,
      created_by: user.id,
      questions_count: 0,
      evaluation_criteria: criteria,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Assessment created" });
      setCreateOpen(false);
      setNewTitle(""); setNewRole(""); setNewSkills(""); setNewDifficulty("Medium"); setNewCriteria("");
      fetchAssessments();
    }
  }

  async function handleDeleteAssessment(id: string) {
    const { error } = await supabase.from("assessments").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAssessments((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Assessment deleted" });
    }
  }

  async function handleUpdateEvalStatus(evalId: string, newStatus: "selected" | "rejected") {
    const { error } = await supabase.from("evaluations").update({ status: newStatus }).eq("id", evalId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setEvaluations((prev) => prev.map((e) => e.id === evalId ? { ...e, status: newStatus } : e));
      toast({ title: newStatus === "selected" ? "Candidate accepted!" : "Candidate rejected" });
    }
  }


  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-questions", {
        body: {
          role: genRole,
          skills: genSkills.split(",").map((s) => s.trim()).filter(Boolean),
          difficulty: genDifficulty,
        },
      });
      if (error) throw new Error(error.message || "Generation failed");
      if (data?.error) throw new Error(data.error);
      setGenerated(data as GeneratedQuestions);
    } catch (err: any) {
      toast({ title: "AI Generation Error", description: err.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  async function handleSaveGenerated() {
    if (!generated || !user || !genTitle) return;
    setSaving(true);
    const skills = genSkills.split(",").map((s) => s.trim()).filter(Boolean);
    const totalQuestions = generated.codingQuestions.length + generated.algorithmProblems.length + generated.mcqs.length;
    const { error } = await supabase.from("assessments").insert({
      title: genTitle,
      role: genRole,
      skills,
      difficulty: genDifficulty,
      created_by: user.id,
      questions_count: totalQuestions,
      coding_questions: generated.codingQuestions,
      algorithm_problems: generated.algorithmProblems,
      mcqs: generated.mcqs,
      evaluation_criteria: generated.evaluationCriteria || [],
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Assessment saved with AI questions!" });
      setGenerated(null);
      setGenTitle(""); setGenRole(""); setGenSkills("");
      fetchAssessments();
    }
  }

  const completedEvals = evaluations.filter((e) => e.status === "selected" || e.status === "rejected").length;
  const avgScore = evaluations.length ? Math.round(evaluations.reduce((a, e) => a + e.overall_score, 0) / evaluations.length) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Creator Dashboard</h1>
          <p className="text-muted-foreground">Manage assessments and review AI evaluations.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Assessments" value={assessments.length} icon={<FileText className="h-5 w-5" />} delay={0} />
          <StatCard title="Active Candidates" value={evaluations.length} icon={<Users className="h-5 w-5" />} delay={0.1} />
          <StatCard title="Completed Evaluations" value={completedEvals} icon={<CheckCircle className="h-5 w-5" />} delay={0.2} />
          <StatCard title="Avg. Score" value={avgScore ? `${avgScore}%` : "—"} icon={<BarChart3 className="h-5 w-5" />} delay={0.3} />
        </div>

        <Tabs value={activeTab} onValueChange={(v) => navigate(v === "assessments" ? "/client" : `/client/${v}`)} className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="generator">AI Task Generator</TabsTrigger>
            <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          </TabsList>

          <TabsContent value="assessments">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Assessments</h2>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gradient-primary border-0 text-primary-foreground"><Plus className="mr-1.5 h-4 w-4" />Create New</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Create Assessment</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2"><Label>Title</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Assessment title" /></div>
                      <div className="space-y-2"><Label>Job Role</Label><Input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="e.g. Full Stack Developer" /></div>
                      <div className="space-y-2"><Label>Skills (comma-separated)</Label><Input value={newSkills} onChange={(e) => setNewSkills(e.target.value)} placeholder="React, Node.js" /></div>
                      <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select value={newDifficulty} onValueChange={setNewDifficulty}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Evaluation Criteria (one per line)</Label>
                        <textarea
                          value={newCriteria}
                          onChange={(e) => setNewCriteria(e.target.value)}
                          placeholder={"Code readability and naming conventions\nAlgorithmic efficiency (time & space)\nError handling and edge cases\nCode modularity and reusability"}
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          rows={4}
                        />
                      </div>
                      <Button onClick={handleCreateAssessment} disabled={!newTitle} className="w-full gradient-primary border-0 text-primary-foreground">Create</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : assessments.length === 0 ? (
                <div className="rounded-xl border bg-card p-8 text-center shadow-card">
                  <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-muted-foreground">No assessments yet. Create one to get started.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {assessments.map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-card">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-card-foreground">{a.title}</h3>
                        <p className="text-sm text-muted-foreground">{a.role} • {a.difficulty} • {a.questions_count} questions</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {a.skills.map((s) => (
                            <span key={s} className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{s}</span>
                          ))}
                        </div>
                        {a.evaluation_criteria.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap mt-1">
                            {a.evaluation_criteria.map((c, ci) => (
                              <span key={ci} className="rounded bg-accent px-2 py-0.5 text-xs text-accent-foreground">{c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteAssessment(a.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="generator">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-card-foreground">AI Task Generator</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Assessment Title</Label>
                    <Input placeholder="e.g. Full Stack Challenge" value={genTitle} onChange={(e) => setGenTitle(e.target.value)} />
                  </div>
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
                  {generated.evaluationCriteria && generated.evaluationCriteria.length > 0 && (
                    <div className="rounded-xl border bg-card p-5 shadow-card">
                      <h3 className="mb-3 font-semibold text-card-foreground">Evaluation Criteria</h3>
                      {generated.evaluationCriteria.map((c, i) => (
                        <p key={i} className="mb-2 rounded-lg bg-muted p-3 text-sm text-card-foreground flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{c}
                        </p>
                      ))}
                    </div>
                  )}
                  <Button onClick={handleSaveGenerated} disabled={saving || !genTitle} className="w-full gradient-primary border-0 text-primary-foreground">
                    {saving ? "Saving…" : "Save as Assessment"}
                  </Button>
                </motion.div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="evaluations">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">AI Evaluation Reports</h2>
              {evaluations.length === 0 ? (
                <div className="rounded-xl border bg-card p-8 text-center shadow-card">
                  <CheckCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-muted-foreground">No evaluations yet. Candidates who attempt your assessments will appear here.</p>
                </div>
              ) : evaluations.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border bg-card p-5 shadow-card">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-card-foreground">{c.worker_name}</h3>
                      <p className="text-sm text-muted-foreground">{c.assessment_title} • {new Date(c.evaluated_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={c.recommendation === "Selected" ? "selected" : c.recommendation === "Rejected" ? "rejected" : "review"} />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm"><Eye className="mr-1.5 h-3.5 w-3.5" />Details</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>{c.worker_name} — Evaluation Report</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-2">
                            <ScoreBar label="Syntax Analysis" score={c.syntax_score} delay={0.1} />
                            <ScoreBar label="Logical Analysis" score={c.logic_score} delay={0.2} />
                            <ScoreBar label="Complexity Score" score={c.complexity_score} delay={0.3} />
                            <ScoreBar label="Performance Score" score={c.performance_score} delay={0.4} />
                            <div className="rounded-lg bg-muted p-4">
                              <p className="text-sm font-semibold text-card-foreground">Overall: {c.overall_score}%</p>
                              <p className="text-sm text-muted-foreground">
                                Recommendation: <span className={c.recommendation === "Selected" ? "text-success font-semibold" : c.recommendation === "Rejected" ? "text-destructive font-semibold" : "text-warning font-semibold"}>{c.recommendation}</span>
                              </p>
                            </div>
                            {c.feedback && c.feedback.length > 0 && (
                              <div>
                                <h4 className="mb-2 font-semibold text-card-foreground">AI Feedback</h4>
                                {c.feedback.map((f, fi) => (
                                  <p key={fi} className="mb-2 rounded-lg bg-muted p-3 text-sm text-card-foreground">{f}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <ScoreBar label="Syntax" score={c.syntax_score} />
                    <ScoreBar label="Logic" score={c.logic_score} />
                    <ScoreBar label="Complexity" score={c.complexity_score} />
                    <ScoreBar label="Performance" score={c.performance_score} />
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
