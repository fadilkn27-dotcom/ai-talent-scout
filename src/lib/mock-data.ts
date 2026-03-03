export const candidates = [
  { id: "w1", name: "Alex Rivera", email: "alex@dev.com", role: "Full Stack Developer", status: "selected" as const, score: 92, syntaxScore: 95, logicScore: 89, complexityScore: 88, performanceScore: 96, submittedAt: "2024-03-15" },
  { id: "w2", name: "Priya Sharma", email: "priya@dev.com", role: "Backend Engineer", status: "selected" as const, score: 88, syntaxScore: 90, logicScore: 85, complexityScore: 87, performanceScore: 90, submittedAt: "2024-03-14" },
  { id: "w3", name: "James Wilson", email: "james@dev.com", role: "Frontend Developer", status: "review" as const, score: 75, syntaxScore: 80, logicScore: 70, complexityScore: 72, performanceScore: 78, submittedAt: "2024-03-14" },
  { id: "w4", name: "Mei Lin", email: "mei@dev.com", role: "Data Engineer", status: "rejected" as const, score: 52, syntaxScore: 60, logicScore: 45, complexityScore: 48, performanceScore: 55, submittedAt: "2024-03-13" },
  { id: "w5", name: "Carlos Mendez", email: "carlos@dev.com", role: "DevOps Engineer", status: "review" as const, score: 81, syntaxScore: 85, logicScore: 78, complexityScore: 80, performanceScore: 81, submittedAt: "2024-03-13" },
  { id: "w6", name: "Emily Foster", email: "emily@dev.com", role: "ML Engineer", status: "selected" as const, score: 95, syntaxScore: 97, logicScore: 93, complexityScore: 94, performanceScore: 96, submittedAt: "2024-03-12" },
];

export const assessments = [
  { id: "a1", title: "Full Stack Challenge", role: "Full Stack Developer", skills: ["React", "Node.js", "PostgreSQL"], difficulty: "Hard", questions: 5, assigned: 3, completed: 2, createdAt: "2024-03-10" },
  { id: "a2", title: "Algorithm Mastery", role: "Backend Engineer", skills: ["Python", "Algorithms", "Data Structures"], difficulty: "Expert", questions: 8, assigned: 4, completed: 3, createdAt: "2024-03-08" },
  { id: "a3", title: "Frontend Proficiency", role: "Frontend Developer", skills: ["React", "TypeScript", "CSS"], difficulty: "Medium", questions: 6, assigned: 2, completed: 1, createdAt: "2024-03-05" },
  { id: "a4", title: "System Design", role: "DevOps Engineer", skills: ["AWS", "Docker", "Kubernetes"], difficulty: "Hard", questions: 4, assigned: 3, completed: 0, createdAt: "2024-03-03" },
];

export const workerTasks = [
  { id: "t1", title: "Implement Binary Search Tree", assessment: "Algorithm Mastery", language: "Python", timeLimit: 45, status: "pending" as const, description: "Implement a BST with insert, delete, and search operations. Include in-order traversal." },
  { id: "t2", title: "REST API with Authentication", assessment: "Full Stack Challenge", language: "JavaScript", timeLimit: 60, status: "completed" as const, description: "Build a REST API with JWT authentication, CRUD operations, and input validation." },
  { id: "t3", title: "React Dashboard Component", assessment: "Frontend Proficiency", language: "TypeScript", timeLimit: 30, status: "pending" as const, description: "Create a responsive dashboard component with charts, cards, and data filtering." },
];

export const aiEvaluationMessages = [
  "Analyzing code structure and syntax patterns...",
  "Evaluating algorithmic complexity and efficiency...",
  "Checking edge-case handling and error boundaries...",
  "Assessing code modularity and design patterns...",
  "Computing performance benchmarks...",
  "Generating comprehensive evaluation report...",
];

export const aiFeedbackMessages = [
  "Algorithm efficiency below expected O(n log n) threshold.",
  "Logical branching errors detected in edge-case handling.",
  "Code structure requires modular optimization.",
  "Strong use of design patterns detected — Factory and Observer patterns implemented correctly.",
  "Memory management within acceptable parameters for production use.",
  "Exception handling covers 92% of potential failure points.",
  "Variable naming conventions follow industry best practices.",
  "Recursive implementation could benefit from memoization.",
  "API response handling demonstrates robust error recovery.",
  "Test coverage analysis suggests additional unit tests for boundary conditions.",
];

export function generateAIScore() {
  const syntax = Math.floor(Math.random() * 30) + 70;
  const logic = Math.floor(Math.random() * 35) + 60;
  const complexity = Math.floor(Math.random() * 30) + 65;
  const performance = Math.floor(Math.random() * 25) + 70;
  const overall = Math.round((syntax + logic + complexity + performance) / 4);
  const recommendation = overall >= 85 ? "Selected" : overall >= 65 ? "Hold" : "Rejected";
  const feedback = aiFeedbackMessages.sort(() => Math.random() - 0.5).slice(0, 4);
  return { syntax, logic, complexity, performance, overall, recommendation, feedback };
}

export function generateAIQuestions(role: string, skills: string[], difficulty: string) {
  const codingQuestions = [
    `Implement a ${difficulty.toLowerCase()}-level ${skills[0] || "coding"} challenge for ${role} position.`,
    `Design a scalable solution using ${skills.slice(0, 2).join(" and ")} with emphasis on performance.`,
    `Debug and optimize a provided ${skills[0] || "code"} snippet with multiple intentional errors.`,
  ];
  const algorithmProblems = [
    `Solve the dynamic programming variant of the knapsack problem optimized for ${role} workflows.`,
    `Implement a graph traversal algorithm suitable for ${skills[0] || "data processing"} scenarios.`,
  ];
  const mcqs = [
    `Which design pattern is most appropriate for ${skills[0] || "software"} architecture in ${difficulty.toLowerCase()}-scale systems?`,
    `What is the time complexity of the optimal solution for merging ${skills.length} sorted data streams?`,
    `In ${skills[0] || "modern"} development, which approach best handles concurrent state management?`,
  ];
  return { codingQuestions, algorithmProblems, mcqs };
}
