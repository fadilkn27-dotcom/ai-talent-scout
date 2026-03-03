import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Clock, Play, Send, CheckCircle, FileText, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { workerTasks, aiEvaluationMessages, generateAIScore } from "@/lib/mock-data";

const defaultCode = `# Write your solution here
def solution(arr):
    """
    Implement the required algorithm.
    """
    # Your code here
    pass

# Test
print(solution([3, 1, 4, 1, 5, 9]))`;

export default function WorkerDashboard() {
  const [selectedTask, setSelectedTask] = useState(workerTasks[0]);
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState("python");
  const [timeLeft, setTimeLeft] = useState(selectedTask.timeLimit * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(-1);
  const [result, setResult] = useState<ReturnType<typeof generateAIScore> | null>(null);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timerActive, timeLeft]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setTimerActive(false);
    for (let i = 0; i < aiEvaluationMessages.length; i++) {
      setAnalysisStep(i);
      await new Promise((r) => setTimeout(r, 800));
    }
    setResult(generateAIScore());
    setSubmitting(false);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Candidate Dashboard</h1>
          <p className="text-muted-foreground">Complete assigned tasks and view your evaluations.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Assigned Tasks" value={workerTasks.length} icon={<FileText className="h-5 w-5" />} delay={0} />
          <StatCard title="Completed" value={workerTasks.filter((t) => t.status === "completed").length} icon={<CheckCircle className="h-5 w-5" />} delay={0.1} />
          <StatCard title="Pending" value={workerTasks.filter((t) => t.status === "pending").length} icon={<Clock className="h-5 w-5" />} delay={0.2} />
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="editor">Code Editor</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <div className="space-y-4">
              {workerTasks.map((task, i) => (
                <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-card cursor-pointer hover:shadow-elevated transition-shadow"
                  onClick={() => { setSelectedTask(task); setTimeLeft(task.timeLimit * 60); setResult(null); setAnalysisStep(-1); }}
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-card-foreground">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">{task.assessment} • {task.language} • {task.timeLimit} min</p>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="editor">
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
                <Button onClick={handleSubmit} disabled={submitting} className="gradient-primary border-0 text-primary-foreground shadow-glow">
                  <Send className="mr-1.5 h-4 w-4" />
                  {submitting ? "Submitting…" : "Submit Solution"}
                </Button>
              </div>

              {/* AI Analysis */}
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
          </TabsContent>

          <TabsContent value="results">
            <div className="rounded-xl border bg-card p-6 shadow-card text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">Complete a task in the Code Editor to see your results here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
