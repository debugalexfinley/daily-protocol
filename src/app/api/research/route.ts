import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { supplement, activeStack, currentProtocol, customPrompt } = await req.json();

  if (!supplement) return NextResponse.json({ error: "No supplement provided" }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No Gemini API key" }, { status: 500 });

  const activeStackList = activeStack?.length
    ? activeStack.join(", ")
    : "none specified";

  const prompt = customPrompt || `You are a research assistant for a biohacker who has a deep understanding of supplements, peptides, and nootropics. 

Provide a comprehensive but concise research summary for: **${supplement}**

The user's current active protocol includes: ${activeStackList}
Current phase: ${currentProtocol || "maintenance"}

Structure your response EXACTLY as follows (use these exact headers):

## MECHANISM
2-3 sentences on how it works at a biochemical level.

## OPTIMAL DOSING
Specific dosing range, timing, form/delivery method. Include any loading protocol if relevant.

## CYCLING
Does it need cycling? If yes: recommended on/off schedule. If no: why it's safe daily.

## STACK SYNERGIES
Based on their current stack (${activeStackList}), which items work WELL together with ${supplement}? Explain why.

## INTERACTIONS & CONFLICTS  
Any items in their current stack that CONFLICT or require caution when combined with ${supplement}? Be specific.

## SOURCING
Best vendors, what to look for in quality markers, red flags, typical price range.

## KEY RESEARCH
2-3 most important studies or mechanisms to know. Include PubMed IDs if available.

## VERDICT
One paragraph honest assessment: is this worth adding to their specific stack? What's the main benefit + main risk?

Keep it evidence-based and direct. No fluff.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response generated.";
    return NextResponse.json({ result: text });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
