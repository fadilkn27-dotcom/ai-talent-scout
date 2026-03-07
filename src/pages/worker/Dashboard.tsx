import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Clock, Play, Send, CheckCircle, FileText, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase as supabaseClient } from "@/integrations/supabase/client";

const aiEvaluationMessages = [
  "Sending code to AI for analysis...",
  "Evaluating syntax and code structure...",
  "Analyzing logic and algorithm correctness...",
  "Assessing complexity and design patterns...",
  "Computing performance benchmarks...",
  "Generating evaluation report...",
];

const defaultCode = `# Write your solution here
def solution(arr):
    """
    Implement the required algorithm.
    """
    # Your code here
    pass

# Test
print(solution([3, 1, 4, 1, 5, 9]))`;

interface AssessmentTask {
  id: string; // assessment id
  assignment_id: string | null; // assignment id if exists
  status: string;
  title: string;
  role: string;
  difficulty: string;
  skills: string[];
  coding_questions: string[] | null;
  evaluation_criteria: string[];
}

interface PastEvaluation {
  id: string;
  overall_score: number;
  syntax_score: number;
  logic_score: number;
  complexity_score: number;
  performance_score: number;
  recommendation: string;
  feedback: string[] | null;
  evaluated_at: string;
  assessment_title: string;
}

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<AssessmentTask[]>([]);
  const [pastEvals, setPastEvals] = useState<PastEvaluation[]>([]);
  const [selectedTask, setSelectedTask] = useState<AssessmentTask | null>(null);
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState("python");
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(-1);
  const [result, setResult] = useState<{
    syntax: number; logic: number; complexity: number; performance: number;
    overall: number; recommendation: string; feedback: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchPastEvaluations();
    }
  }, [user]);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timerActive, timeLeft]);

  async function fetchTasks() {
    // Fetch all assessments and the worker's existing assignments in parallel
    const [assessmentsRes, assignmentsRes] = await Promise.all([
      supabase.from("assessments").select("id, title, role, difficulty, skills, coding_questions, evaluation_criteria"),
      supabase.from("assessment_assignments").select("id, assessment_id, status").eq("worker_id", user!.id),
    ]);

    const assessments = assessmentsRes.data || [];
    const assignments = assignmentsRes.data || [];
    const assignmentMap = new Map(assignments.map((a) => [a.assessment_id, a]));

    setTasks(assessments.map((a: any) => {
      const assignment = assignmentMap.get(a.id);
      return {
        id: a.id,
        assignment_id: assignment?.id || null,
        status: assignment?.status || "pending",
        title: a.title,
        role: a.role,
        difficulty: a.difficulty,
        skills: a.skills,
        coding_questions: a.coding_questions,
        evaluation_criteria: a.evaluation_criteria || [],
      };
    }));
    setLoading(false);
  }

  async function fetchPastEvaluations() {
    const { data, error } = await supabase
      .from("evaluations")
      .select("*, assessment_assignments!inner(assessment_id, assessments!inner(title))")
      .eq("worker_id", user!.id)
      .order("evaluated_at", { ascending: false });

    if (!error && data) {
      setPastEvals(data.map((e: any) => ({
        id: e.id,
        overall_score: e.overall_score,
        syntax_score: e.syntax_score,
        logic_score: e.logic_score,
        complexity_score: e.complexity_score,
        performance_score: e.performance_score,
        recommendation: e.recommendation,
        feedback: e.feedback,
        evaluated_at: e.evaluated_at,
        assessment_title: e.assessment_assignments?.assessments?.title || "",
      })));
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleSubmit = useCallback(async () => {
    if (!selectedTask || !user) return;
    setSubmitting(true);
    setTimerActive(false);

    // Show progress steps while AI processes
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => Math.min(prev + 1, aiEvaluationMessages.length - 1));
    }, 1500);

    let aiResult: any;
    try {
      const { data, error } = await supabaseClient.functions.invoke("evaluate-code", {
        body: {
          code,
          language,
          evaluationCriteria: selectedTask.evaluation_criteria,
          assessmentTitle: selectedTask.title,
          difficulty: selectedTask.difficulty,
        },
      });
      clearInterval(stepInterval);
      setAnalysisStep(aiEvaluationMessages.length - 1);

      if (error) throw new Error(error.message || "AI evaluation failed");
      if (data?.error) throw new Error(data.error);

      aiResult = {
        syntax: data.syntax_score,
        logic: data.logic_score,
        complexity: data.complexity_score,
        performance: data.performance_score,
        overall: data.overall_score,
        recommendation: data.recommendation,
        feedback: data.feedback,
      };
    } catch (err: any) {
      clearInterval(stepInterval);
      toast({ title: "AI Evaluation Error", description: err.message, variant: "destructive" });
      setSubmitting(false);
      setAnalysisStep(-1);
      return;
    }

    setResult(aiResult);
    const scores = aiResult;

    // Auto-create assignment if not exists
    let assignmentId = selectedTask.assignment_id;
    if (!assignmentId) {
      const { data: newAssignment, error: assignErr } = await supabase
        .from("assessment_assignments")
        .insert({
          assessment_id: selectedTask.id,
          worker_id: user.id,
          assigned_by: user.id,
        })
        .select("id")
        .single();

      if (assignErr || !newAssignment) {
        toast({ title: "Error creating assignment", description: assignErr?.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }
      assignmentId = newAssignment.id;
    }

    // Save evaluation
    const { error } = await supabase.from("evaluations").insert({
      assignment_id: assignmentId,
      worker_id: user.id,
      syntax_score: scores.syntax,
      logic_score: scores.logic,
      complexity_score: scores.complexity,
      performance_score: scores.performance,
      overall_score: scores.overall,
      recommendation: scores.recommendation,
      feedback: scores.feedback,
      code_submitted: code,
      language,
      status: scores.recommendation === "Selected" ? "selected" : scores.recommendation === "Rejected" ? "rejected" : "review",
    });

    if (error) {
      toast({ title: "Error saving evaluation", description: error.message, variant: "destructive" });
    } else {
      await supabase.from("assessment_assignments").update({ status: "completed" }).eq("id", assignmentId);
      toast({ title: "Solution submitted and evaluated!" });
      fetchTasks();
      fetchPastEvaluations();
    }

    setSubmitting(false);
  }, [selectedTask, user, code, language]);

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Candidate Dashboard</h1>
          <p className="text-muted-foreground">Complete assigned tasks and view your evaluations.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Assigned Tasks" value={tasks.length} icon={<FileText className="h-5 w-5" />} delay={0} />
          <StatCard title="Completed" value={completedTasks.length} icon={<CheckCircle className="h-5 w-5" />} delay={0.1} />
          <StatCard title="Pending" value={pendingTasks.length} icon={<Clock className="h-5 w-5" />} delay={0.2} />
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="editor">Code Editor</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <div className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : tasks.length === 0 ? (
                <div className="rounded-xl border bg-card p-8 text-center shadow-card">
                  <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-muted-foreground">No tasks assigned yet. Check back later.</p>
                </div>
              ) : tasks.map((task, i) => (
                <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
                  onClick={() => { setSelectedTask(task); setTimeLeft(45 * 60); setResult(null); setAnalysisStep(-1); setCode(defaultCode); }}
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-card-foreground">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">{task.role} • {task.difficulty} • {task.skills.join(", ")}</p>
                    {task.evaluation_criteria.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">Criteria: {task.evaluation_criteria.join(", ")}</p>
                    )}
                  </div>
                  <StatusBadge status={task.status === "completed" ? "completed" : "pending"} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="editor">
            {!selectedTask ? (
              <div className="rounded-xl border bg-card p-8 text-center shadow-card">
                <Code2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-muted-foreground">Select a task from "My Tasks" to start coding.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-foreground">{selectedTask.title}</h2>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-sm ${timeLeft < 300 ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-border bg-muted text-card-foreground"}`}>
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(timeLeft)}
                    </div>
                    {!timerActive && !submitting && (
                      <Button size="sm" variant="outline" onClick={() => setTimerActive(true)}>
                        <Play className="mr-1.5 h-3.5 w-3.5" />Start Timer
                      </Button>
                    )}
                  </div>
                </div>

                {selectedTask.evaluation_criteria.length > 0 && (
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <h4 className="text-sm font-semibold text-card-foreground mb-2">Evaluation Criteria</h4>
                    <ul className="space-y-1">
                      {selectedTask.evaluation_criteria.map((c, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-xl border bg-card shadow-card overflow-hidden">
                  <div className="border-b bg-muted/50 px-4 py-2 text-xs text-muted-foreground font-mono flex items-center gap-2">
                    <Code2 className="h-3.5 w-3.5" />
                    {language === "python" ? "solution.py" : language === "java" ? "Solution.java" : language === "cpp" ? "solution.cpp" : "solution.js"}
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full min-h-[400px] bg-card p-4 font-mono text-sm text-card-foreground resize-none focus:outline-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSubmit} disabled={submitting || selectedTask.status === "completed"} className="gradient-primary border-0 text-primary-foreground shadow-glow">
                    <Send className="mr-1.5 h-4 w-4" />
                    {submitting ? "Submitting…" : selectedTask.status === "completed" ? "Already Submitted" : "Submit Solution"}
                  </Button>
                </div>

                <AnimatePresence>
                  {(submitting || result) && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-6 shadow-card">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-card-foreground">
                        {submitting && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                        {result && <CheckCircle className="h-4 w-4 text-success" />}
                        AI Evaluation {submitting ? "in Progress…" : "Complete"}
                      </h3>

                      {submitting && (
                        <div className="space-y-2">
                          {aiEvaluationMessages.map((msg, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: i <= analysisStep ? 1 : 0.3, x: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-2 text-sm">
                              {i <= analysisStep ? <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" /> : <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />}
                              <span className={i <= analysisStep ? "text-card-foreground" : "text-muted-foreground"}>{msg}</span>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {result && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <ScoreBar label="Syntax Analysis" score={result.syntax} delay={0.1} />
                            <ScoreBar label="Logical Analysis" score={result.logic} delay={0.2} />
                            <ScoreBar label="Complexity Score" score={result.complexity} delay={0.3} />
                            <ScoreBar label="Performance Score" score={result.performance} delay={0.4} />
                          </div>
                          <div className="rounded-lg bg-muted p-4 text-center">
                            <p className="text-3xl font-bold text-card-foreground">{result.overall}%</p>
                            <p className="text-sm text-muted-foreground">Overall Rating</p>
                            <p className={`mt-1 text-sm font-semibold ${result.recommendation === "Selected" ? "text-success" : result.recommendation === "Rejected" ? "text-destructive" : "text-warning"}`}>
                              {result.recommendation}
                            </p>
                          </div>
                          <div>
                            <h4 className="mb-2 font-semibold text-card-foreground flex items-center gap-1.5">
                              <AlertTriangle className="h-4 w-4 text-warning" />
                              AI Technical Feedback
                            </h4>
                            <div className="space-y-2">
                              {result.feedback.map((f, i) => (
                                <p key={i} className="rounded-lg bg-muted p-3 text-sm text-card-foreground">{f}</p>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="results">
            {pastEvals.length === 0 ? (
              <div className="rounded-xl border bg-card p-6 shadow-card text-center">
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">Complete a task to see your results here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastEvals.map((ev, i) => (
                  <motion.div key={ev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border bg-card p-5 shadow-card">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-card-foreground">{ev.assessment_title}</h3>
                        <p className="text-sm text-muted-foreground">{new Date(ev.evaluated_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-card-foreground">{ev.overall_score}%</p>
                        <p className={`text-sm font-semibold ${ev.recommendation === "Selected" ? "text-success" : ev.recommendation === "Rejected" ? "text-destructive" : "text-warning"}`}>{ev.recommendation}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <ScoreBar label="Syntax" score={ev.syntax_score} />
                      <ScoreBar label="Logic" score={ev.logic_score} />
                      <ScoreBar label="Complexity" score={ev.complexity_score} />
                      <ScoreBar label="Performance" score={ev.performance_score} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
