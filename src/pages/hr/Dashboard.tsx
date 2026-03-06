import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, BarChart3, TrendingUp, Bell, Search, Eye, Code2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const barColors: Record<string, string> = { selected: "hsl(152, 60%, 42%)", rejected: "hsl(0, 72%, 51%)", review: "hsl(38, 92%, 50%)" };

interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  score: number;
  syntaxScore: number;
  logicScore: number;
  complexityScore: number;
  performanceScore: number;
  status: "selected" | "rejected" | "review";
  evaluatedAt: string;
  codeSubmitted: string | null;
  language: string | null;
  feedback: string[] | null;
  assessmentTitle: string;
  evaluationCriteria: string[];
}

export default function HRDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    const { data, error } = await supabase
      .from("evaluations")
      .select("*, assessment_assignments!inner(assessment_id, assessments!inner(title, role, evaluation_criteria))")
      .order("evaluated_at", { ascending: false });

    if (!error && data) {
      const workerIds = [...new Set(data.map((e: any) => e.worker_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", workerIds);

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

      setCandidates(data.map((e: any) => {
        const status = e.recommendation === "Selected" ? "selected" : e.recommendation === "Rejected" ? "rejected" : "review";
        return {
          id: e.id,
          name: profileMap.get(e.worker_id)?.full_name || "Unknown",
          email: profileMap.get(e.worker_id)?.email || "",
          role: e.assessment_assignments?.assessments?.role || "",
          score: e.overall_score,
          syntaxScore: e.syntax_score,
          logicScore: e.logic_score,
          complexityScore: e.complexity_score,
          performanceScore: e.performance_score,
          status,
          evaluatedAt: e.evaluated_at,
          codeSubmitted: e.code_submitted,
          language: e.language,
          feedback: e.feedback,
          assessmentTitle: e.assessment_assignments?.assessments?.title || "",
          evaluationCriteria: e.assessment_assignments?.assessments?.evaluation_criteria || [],
        };
      }));
    }
    setLoading(false);
  }

  const filtered = candidates
    .filter((c) => filter === "all" || c.status === filter)
    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase()));

  const chartData = candidates.map((c) => ({ name: c.name.split(" ")[0], score: c.score, status: c.status }));
  const avgScore = candidates.length ? Math.round(candidates.reduce((a, c) => a + c.score, 0) / candidates.length) : 0;
  const selectedCount = candidates.filter((c) => c.status === "selected").length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HR Evaluation Dashboard</h1>
          <p className="text-muted-foreground">Monitor AI evaluations and manage candidate hiring pipeline.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Candidates" value={candidates.length} icon={<Users className="h-5 w-5" />} delay={0} />
          <StatCard title="Selected" value={selectedCount} icon={<TrendingUp className="h-5 w-5" />} delay={0.1} />
          <StatCard title="Average Score" value={avgScore ? `${avgScore}%` : "—"} icon={<BarChart3 className="h-5 w-5" />} delay={0.2} />
          <StatCard title="Hiring Confidence" value={candidates.length ? `${Math.round((selectedCount / candidates.length) * 100)}%` : "—"} icon={<TrendingUp className="h-5 w-5" />} delay={0.3} />
        </div>

        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="candidates">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search candidates..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Filter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="selected">Selected</SelectItem>
                    <SelectItem value="review">Under Review</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : candidates.length === 0 ? (
                <div className="rounded-xl border bg-card p-8 text-center shadow-card">
                  <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-muted-foreground">No evaluations yet.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border bg-card shadow-card">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Rank</TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>AI Recommendation</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.sort((a, b) => b.score - a.score).map((c, i) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono text-sm font-bold text-muted-foreground">#{i + 1}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-card-foreground">{c.name}</p>
                              <p className="text-xs text-muted-foreground">{c.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{c.role}</TableCell>
                          <TableCell>
                            <span className={`font-mono font-bold ${c.score >= 85 ? "text-success" : c.score >= 65 ? "text-warning" : "text-destructive"}`}>{c.score}%</span>
                          </TableCell>
                          <TableCell><StatusBadge status={c.status} /></TableCell>
                          <TableCell>
                            <div className="max-w-xs space-y-1">
                              <div className="flex justify-between text-xs"><span>Technical Strength</span><span className="font-mono">{c.syntaxScore}%</span></div>
                              <div className="flex justify-between text-xs"><span>Problem Solving</span><span className="font-mono">{c.logicScore}%</span></div>
                              <div className="flex justify-between text-xs"><span>Confidence</span><span className="font-mono">{Math.round((c.syntaxScore + c.logicScore + c.performanceScore) / 3)}%</span></div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm"><Eye className="mr-1.5 h-3.5 w-3.5" />View Details</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{c.name} — {c.assessmentTitle}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-5 pt-2">
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <ScoreBar label="Syntax Analysis" score={c.syntaxScore} delay={0.1} />
                                    <ScoreBar label="Logical Analysis" score={c.logicScore} delay={0.2} />
                                    <ScoreBar label="Complexity Score" score={c.complexityScore} delay={0.3} />
                                    <ScoreBar label="Performance Score" score={c.performanceScore} delay={0.4} />
                                  </div>
                                  <div className="rounded-lg bg-muted p-4 text-center">
                                    <p className="text-2xl font-bold text-card-foreground">{c.score}%</p>
                                    <p className="text-sm text-muted-foreground">Overall Score</p>
                                  </div>
                                  {c.evaluationCriteria.length > 0 && (
                                    <div>
                                      <h4 className="mb-2 font-semibold text-card-foreground text-sm">Evaluation Criteria</h4>
                                      <ul className="space-y-1">
                                        {c.evaluationCriteria.map((cr, i) => (
                                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                            {cr}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {c.feedback && c.feedback.length > 0 && (
                                    <div>
                                      <h4 className="mb-2 font-semibold text-card-foreground text-sm">AI Feedback</h4>
                                      <div className="space-y-2">
                                        {c.feedback.map((f, i) => (
                                          <p key={i} className="rounded-lg bg-muted p-3 text-sm text-card-foreground">{f}</p>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {c.codeSubmitted && (
                                    <div>
                                      <h4 className="mb-2 font-semibold text-card-foreground text-sm flex items-center gap-1.5">
                                        <Code2 className="h-4 w-4" />
                                        Submitted Code ({c.language || "unknown"})
                                      </h4>
                                      <pre className="rounded-lg bg-muted p-4 text-sm text-card-foreground overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">{c.codeSubmitted}</pre>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            {candidates.length === 0 ? (
              <div className="rounded-xl border bg-card p-8 text-center shadow-card">
                <BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-muted-foreground">No data for analytics yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border bg-card p-6 shadow-card">
                  <h3 className="mb-4 text-lg font-semibold text-card-foreground">Score Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={barColors[entry.status] || "hsl(var(--primary))"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border bg-card p-6 shadow-card">
                    <h3 className="mb-4 text-lg font-semibold text-card-foreground">AI Recommendation Summary</h3>
                    <div className="space-y-4">
                      <ScoreBar label="Technical Strength Index" score={Math.round(candidates.reduce((a, c) => a + c.syntaxScore, 0) / candidates.length)} delay={0.1} />
                      <ScoreBar label="Problem Solving Capability" score={Math.round(candidates.reduce((a, c) => a + c.logicScore, 0) / candidates.length)} delay={0.2} />
                      <ScoreBar label="Hiring Confidence Score" score={candidates.length ? Math.round((selectedCount / candidates.length) * 100) : 0} delay={0.3} />
                    </div>
                  </div>
                  <div className="rounded-xl border bg-card p-6 shadow-card">
                    <h3 className="mb-3 text-lg font-semibold text-card-foreground">Pipeline Overview</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Selected", count: candidates.filter((c) => c.status === "selected").length, cls: "bg-success" },
                        { label: "Under Review", count: candidates.filter((c) => c.status === "review").length, cls: "bg-warning" },
                        { label: "Rejected", count: candidates.filter((c) => c.status === "rejected").length, cls: "bg-destructive" },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${s.cls}`} />
                            <span className="text-sm text-card-foreground">{s.label}</span>
                          </div>
                          <span className="font-mono text-sm font-bold text-card-foreground">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
