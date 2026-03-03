import { useState } from "react";
import { motion } from "framer-motion";
import { Users, BarChart3, TrendingUp, Bell, Search, ChevronDown } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { candidates } from "@/lib/mock-data";

const notifications = [
  { id: 1, message: "Emily Foster scored 95% — recommended for selection.", time: "2 min ago", type: "success" as const },
  { id: 2, message: "James Wilson's evaluation is under review.", time: "15 min ago", type: "warning" as const },
  { id: 3, message: "Mei Lin scored below threshold — flagged for rejection.", time: "1 hour ago", type: "error" as const },
  { id: 4, message: "New assessment 'System Design' has been created.", time: "3 hours ago", type: "info" as const },
];

const barColors: Record<string, string> = { selected: "hsl(152, 60%, 42%)", rejected: "hsl(0, 72%, 51%)", review: "hsl(38, 92%, 50%)" };

export default function HRDashboard() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = candidates
    .filter((c) => filter === "all" || c.status === filter)
    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase()));

  const chartData = candidates.map((c) => ({ name: c.name.split(" ")[0], score: c.score, status: c.status }));

  const avgScore = Math.round(candidates.reduce((a, c) => a + c.score, 0) / candidates.length);
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
          <StatCard title="Selected" value={selectedCount} icon={<TrendingUp className="h-5 w-5" />} trend={{ value: 15, positive: true }} delay={0.1} />
          <StatCard title="Average Score" value={`${avgScore}%`} icon={<BarChart3 className="h-5 w-5" />} delay={0.2} />
          <StatCard title="Hiring Confidence" value={`${Math.round((selectedCount / candidates.length) * 100)}%`} icon={<TrendingUp className="h-5 w-5" />} delay={0.3} />
        </div>

        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
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
                    <ScoreBar label="Hiring Confidence Score" score={Math.round((selectedCount / candidates.length) * 100)} delay={0.3} />
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
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-card"
                >
                  <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.type === "success" ? "bg-success" : n.type === "error" ? "bg-destructive" : n.type === "warning" ? "bg-warning" : "bg-info"}`} />
                  <div className="flex-1">
                    <p className="text-sm text-card-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground">{n.time}</p>
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
