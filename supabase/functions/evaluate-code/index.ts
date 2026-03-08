import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code, language, evaluationCriteria, assessmentTitle, difficulty, timeTakenMinutes, allocatedMinutes } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const criteriaText = evaluationCriteria?.length
      ? evaluationCriteria.map((c: string, i: number) => `${i + 1}. ${c}`).join("\n")
      : "1. Code correctness\n2. Code readability\n3. Algorithmic efficiency\n4. Error handling";

    const systemPrompt = `You are an expert code evaluator for technical hiring assessments. You evaluate submitted code solutions with precision and fairness.

You MUST respond by calling the "evaluate_code" function with your evaluation results. Do not respond with plain text.`;

    const timeContext = timeTakenMinutes != null && allocatedMinutes
      ? `\n**Time Performance:** Candidate took ${timeTakenMinutes} minutes out of ${allocatedMinutes} allocated minutes (${Math.round((timeTakenMinutes / allocatedMinutes) * 100)}% of time used).\n`
      : "";

    const userPrompt = `Evaluate the following code submission for the assessment "${assessmentTitle}" (Difficulty: ${difficulty}).

**Language:** ${language}
${timeContext}
**Evaluation Criteria (score each carefully):**
${criteriaText}

**Submitted Code:**
\`\`\`${language}
${code}
\`\`\`

Evaluate the code and provide:
- syntax_score (0-100): Code syntax quality, formatting, naming conventions
- logic_score (0-100): Correctness of logic, algorithm implementation
- complexity_score (0-100): Code complexity management, design patterns, modularity
- performance_score (0-100): Efficiency, time/space complexity optimization
- overall_score (0-100): Weighted average considering the evaluation criteria AND time performance. If the candidate finished quickly with good code, boost the score. If they used most/all of the time or ran out, factor that negatively proportional to code quality.
- recommendation: "Selected" if overall >= 85, "Hold" if overall >= 65, "Rejected" if below 65
- feedback: Array of 3-5 specific, actionable feedback strings. Include one item about their time management/speed.

Be strict but fair. If the code is a placeholder or incomplete, scores should reflect that.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "evaluate_code",
              description: "Return structured code evaluation scores and feedback.",
              parameters: {
                type: "object",
                properties: {
                  syntax_score: { type: "number", description: "Syntax quality score 0-100" },
                  logic_score: { type: "number", description: "Logic correctness score 0-100" },
                  complexity_score: { type: "number", description: "Complexity management score 0-100" },
                  performance_score: { type: "number", description: "Performance/efficiency score 0-100" },
                  overall_score: { type: "number", description: "Overall weighted score 0-100" },
                  recommendation: { type: "string", enum: ["Selected", "Hold", "Rejected"] },
                  feedback: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 specific feedback items",
                  },
                },
                required: ["syntax_score", "logic_score", "complexity_score", "performance_score", "overall_score", "recommendation", "feedback"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "evaluate_code" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const evaluation = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate-code error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
