import { mutation, query, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const USER = "nathan";

// ═══════════════════════════════════════════
// SCHEDULE TEMPLATES
// ═══════════════════════════════════════════

export const getTemplates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("scheduleTemplates").withIndex("by_user", q => q.eq("userId", USER)).collect();
  },
});

export const upsertTemplate = mutation({
  args: {
    templateId: v.string(),
    name: v.string(),
    color: v.string(),
    phase: v.string(),
    dayType: v.string(),
    blocks: v.array(v.object({
      time: v.string(), label: v.string(), type: v.string(), items: v.array(v.string()),
      note: v.optional(v.string()), macros: v.optional(v.string()), duration: v.optional(v.string()),
    })),
    compoundRules: v.optional(v.array(v.object({
      compoundName: v.string(), rule: v.string(),
      daysOn: v.optional(v.number()), daysOff: v.optional(v.number()),
      startDate: v.optional(v.string()), maxDays: v.optional(v.number()),
    }))),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { templateId, ...fields } = args;
    const existing = await ctx.db.query("scheduleTemplates")
      .withIndex("by_user", q => q.eq("userId", USER))
      .filter(q => q.eq(q.field("templateId"), templateId)).first();
    if (existing) await ctx.db.patch(existing._id, fields);
    else await ctx.db.insert("scheduleTemplates", { userId: USER, templateId, ...fields });
  },
});

export const deleteTemplate = mutation({
  args: { templateId: v.string() },
  handler: async (ctx, { templateId }) => {
    const existing = await ctx.db.query("scheduleTemplates")
      .withIndex("by_user", q => q.eq("userId", USER))
      .filter(q => q.eq(q.field("templateId"), templateId)).first();
    if (existing) await ctx.db.delete(existing._id);
  },
});

export const seedTemplates = mutation({
  args: {
    templates: v.array(v.object({
      templateId: v.string(), name: v.string(), color: v.string(), phase: v.string(), dayType: v.string(),
      blocks: v.array(v.object({
        time: v.string(), label: v.string(), type: v.string(), items: v.array(v.string()),
        note: v.optional(v.string()), macros: v.optional(v.string()), duration: v.optional(v.string()),
      })),
      sortOrder: v.optional(v.number()),
    })),
  },
  handler: async (ctx, { templates }) => {
    for (const t of templates) {
      const existing = await ctx.db.query("scheduleTemplates")
        .withIndex("by_user", q => q.eq("userId", USER))
        .filter(q => q.eq(q.field("templateId"), t.templateId)).first();
      if (!existing) await ctx.db.insert("scheduleTemplates", { userId: USER, ...t });
    }
  },
});

// ═══════════════════════════════════════════
// COMPOUNDS (LIBRARY)
// ═══════════════════════════════════════════

export const getCompounds = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("compounds").withIndex("by_user", q => q.eq("userId", USER)).collect();
  },
});

export const upsertCompound = mutation({
  args: {
    compoundId: v.string(), name: v.string(), category: v.string(),
    tags: v.array(v.string()),
    userNotes: v.optional(v.string()),
    links: v.optional(v.array(v.object({ label: v.string(), url: v.string() }))),
    researchNotes: v.optional(v.string()),
    deepResearchNotes: v.optional(v.string()),
    deepResearchStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { compoundId, ...fields } = args;
    const existing = await ctx.db.query("compounds")
      .withIndex("by_user_compoundId", q => q.eq("userId", USER).eq("compoundId", compoundId)).first();
    if (existing) await ctx.db.patch(existing._id, fields);
    else await ctx.db.insert("compounds", { userId: USER, compoundId, ...fields });
  },
});

export const deleteCompound = mutation({
  args: { compoundId: v.string() },
  handler: async (ctx, { compoundId }) => {
    const existing = await ctx.db.query("compounds")
      .withIndex("by_user_compoundId", q => q.eq("userId", USER).eq("compoundId", compoundId)).first();
    if (existing) await ctx.db.delete(existing._id);
  },
});

export const seedCompounds = mutation({
  args: {
    compounds: v.array(v.object({
      compoundId: v.string(), name: v.string(), category: v.string(), tags: v.array(v.string()),
    })),
  },
  handler: async (ctx, { compounds }) => {
    for (const c of compounds) {
      const existing = await ctx.db.query("compounds")
        .withIndex("by_user_compoundId", q => q.eq("userId", USER).eq("compoundId", c.compoundId)).first();
      if (!existing) await ctx.db.insert("compounds", { userId: USER, ...c });
    }
  },
});

export const saveCompoundResearch = mutation({
  args: { compoundId: v.string(), researchNotes: v.string() },
  handler: async (ctx, { compoundId, researchNotes }) => {
    const existing = await ctx.db.query("compounds")
      .withIndex("by_user_compoundId", q => q.eq("userId", USER).eq("compoundId", compoundId)).first();
    if (existing) await ctx.db.patch(existing._id, { researchNotes });
  },
});

export const setCompoundDeepResearchPending = mutation({
  args: { compoundId: v.string() },
  handler: async (ctx, { compoundId }) => {
    const existing = await ctx.db.query("compounds")
      .withIndex("by_user_compoundId", q => q.eq("userId", USER).eq("compoundId", compoundId)).first();
    if (existing) await ctx.db.patch(existing._id, { deepResearchStatus: "pending", deepResearchNotes: undefined });
  },
});

export const _saveCompoundDeepResearch = internalMutation({
  args: { compoundId: v.string(), deepResearchNotes: v.string(), status: v.string() },
  handler: async (ctx, { compoundId, deepResearchNotes, status }) => {
    const existing = await ctx.db.query("compounds")
      .withIndex("by_user_compoundId", q => q.eq("userId", USER).eq("compoundId", compoundId)).first();
    if (existing) await ctx.db.patch(existing._id, { deepResearchNotes, deepResearchStatus: status });
  },
});

export const runDeepResearch = action({
  args: { compoundId: v.string(), compoundName: v.string(), activeStack: v.array(v.string()) },
  handler: async (ctx, { compoundId, compoundName, activeStack }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("No GEMINI_API_KEY set");

    const activeList = activeStack.length ? activeStack.join(", ") : "none";
    const prompt = `Perform comprehensive deep research on the supplement/nootropic/peptide: "${compoundName}"

The user's current active protocol includes: ${activeList}

Please research and provide:
1. Mechanism of action (with specific receptors, pathways, and enzymes involved)
2. Evidence quality — what do actual clinical trials show vs. anecdotal? Include specific study citations.
3. Optimal dosing, timing, and form — what does the evidence support?
4. Cycling requirements — is tolerance a concern? What does research say?
5. Synergies with their current stack (${activeList}) — cite mechanistic reasons
6. Conflicts or cautions with their current stack — any pharmacological interactions?
7. Best sources / quality markers to look for when buying
8. Any recent research (2023-2025) that changes previous understanding
9. Honest verdict: is this worth taking for cognitive performance, body composition, or recovery?

Be specific, cite sources with URLs where possible, and flag anything where evidence is weak or only animal/in-vitro.`;

    const createResp = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ input: prompt, agent: "deep-research-pro-preview-12-2025", background: true }),
    });

    if (!createResp.ok) {
      const err = await createResp.text();
      await ctx.runMutation(internal.protocol._saveCompoundDeepResearch, {
        compoundId, deepResearchNotes: `Research failed: ${err}`, status: "failed",
      });
      return;
    }

    const interaction = await createResp.json();
    const interactionId = interaction.name?.split("/").pop() || interaction.id;

    let attempts = 0;
    while (attempts < 60) {
      await new Promise(r => setTimeout(r, 10000));
      attempts++;
      const pollResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions/${interactionId}`, {
        headers: { "x-goog-api-key": apiKey },
      });
      if (!pollResp.ok) continue;
      const data = await pollResp.json();
      const status = data.status || data.state || "";

      if (status === "completed" || status === "COMPLETED") {
        let report = "";
        if (data.output?.text) report = data.output.text;
        else if (typeof data.output === "string") report = data.output;
        else {
          const msgs = data.messages || data.turns || [];
          for (const m of msgs.reverse()) {
            const parts = m.content?.parts || m.parts || [];
            for (const p of parts) { if (p.text) { report = p.text; break; } }
            if (report) break;
          }
        }
        if (!report) report = JSON.stringify(data.output || data, null, 2);
        await ctx.runMutation(internal.protocol._saveCompoundDeepResearch, { compoundId, deepResearchNotes: report, status: "done" });
        return;
      }
      if (status === "failed" || status === "FAILED") {
        await ctx.runMutation(internal.protocol._saveCompoundDeepResearch, {
          compoundId, deepResearchNotes: `Deep research failed after ${attempts * 10}s`, status: "failed",
        });
        return;
      }
    }
    await ctx.runMutation(internal.protocol._saveCompoundDeepResearch, {
      compoundId, deepResearchNotes: "Deep research timed out after 10 minutes.", status: "failed",
    });
  },
});

// ═══════════════════════════════════════════
// SUPPLY
// ═══════════════════════════════════════════

export const getSupply = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("supply").withIndex("by_user", q => q.eq("userId", USER)).collect();
  },
});

export const upsertSupplyItem = mutation({
  args: {
    compoundId: v.string(), name: v.string(), category: v.string(), color: v.string(),
    currentStock: v.number(), stockUnit: v.string(),
    mgPerUnit: v.optional(v.number()), weeklyUsage: v.number(),
    vendors: v.array(v.object({ name: v.string(), url: v.string(), costPerOrder: v.number(), unitsPerOrder: v.number() })),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const { compoundId, ...fields } = args;
    const existing = await ctx.db.query("supply")
      .withIndex("by_user_compoundId", q => q.eq("userId", USER).eq("compoundId", compoundId)).first();
    if (existing) await ctx.db.patch(existing._id, fields);
    else await ctx.db.insert("supply", { userId: USER, compoundId, ...fields });
  },
});

export const deleteSupplyItem = mutation({
  args: { compoundId: v.string() },
  handler: async (ctx, { compoundId }) => {
    const existing = await ctx.db.query("supply")
      .withIndex("by_user_compoundId", q => q.eq("userId", USER).eq("compoundId", compoundId)).first();
    if (existing) await ctx.db.delete(existing._id);
  },
});

export const seedSupply = mutation({
  args: {
    items: v.array(v.object({
      compoundId: v.string(), name: v.string(), category: v.string(), color: v.string(),
      currentStock: v.number(), stockUnit: v.string(),
      mgPerUnit: v.optional(v.number()), weeklyUsage: v.number(),
      vendors: v.array(v.object({ name: v.string(), url: v.string(), costPerOrder: v.number(), unitsPerOrder: v.number() })),
      notes: v.string(),
    })),
  },
  handler: async (ctx, { items }) => {
    for (const item of items) {
      const existing = await ctx.db.query("supply")
        .withIndex("by_user_compoundId", q => q.eq("userId", USER).eq("compoundId", item.compoundId)).first();
      if (!existing) await ctx.db.insert("supply", { userId: USER, ...item });
    }
  },
});

// ═══════════════════════════════════════════
// STACKS
// ═══════════════════════════════════════════

export const getStacks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("stacks").withIndex("by_user", q => q.eq("userId", USER)).collect();
  },
});

export const upsertStack = mutation({
  args: {
    stackId: v.string(), name: v.string(), color: v.string(),
    items: v.array(v.object({
      compoundName: v.string(), dose: v.string(), freq: v.string(), notes: v.optional(v.string()),
    })),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { stackId, ...fields } = args;
    const existing = await ctx.db.query("stacks")
      .withIndex("by_user_stackId", q => q.eq("userId", USER).eq("stackId", stackId)).first();
    if (existing) await ctx.db.patch(existing._id, fields);
    else await ctx.db.insert("stacks", { userId: USER, stackId, ...fields });
  },
});

export const deleteStack = mutation({
  args: { stackId: v.string() },
  handler: async (ctx, { stackId }) => {
    const existing = await ctx.db.query("stacks")
      .withIndex("by_user_stackId", q => q.eq("userId", USER).eq("stackId", stackId)).first();
    if (existing) await ctx.db.delete(existing._id);
  },
});

export const seedStacks = mutation({
  args: {
    stacks: v.array(v.object({
      stackId: v.string(), name: v.string(), color: v.string(),
      items: v.array(v.object({
        compoundName: v.string(), dose: v.string(), freq: v.string(), notes: v.optional(v.string()),
      })),
      sortOrder: v.optional(v.number()),
    })),
  },
  handler: async (ctx, { stacks }) => {
    for (const s of stacks) {
      const existing = await ctx.db.query("stacks")
        .withIndex("by_user_stackId", q => q.eq("userId", USER).eq("stackId", s.stackId)).first();
      if (!existing) await ctx.db.insert("stacks", { userId: USER, ...s });
    }
  },
});

// ═══════════════════════════════════════════
// WEEKLY PLAN
// ═══════════════════════════════════════════

export const getWeeklyPlan = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("weeklyPlan").withIndex("by_user", q => q.eq("userId", USER)).collect();
  },
});

export const upsertWeeklyDay = mutation({
  args: { dayOfWeek: v.string(), templateId: v.string(), flags: v.optional(v.array(v.string())) },
  handler: async (ctx, { dayOfWeek, templateId, flags }) => {
    const existing = await ctx.db.query("weeklyPlan")
      .withIndex("by_user", q => q.eq("userId", USER))
      .filter(q => q.eq(q.field("dayOfWeek"), dayOfWeek)).first();
    if (existing) await ctx.db.patch(existing._id, { templateId, flags });
    else await ctx.db.insert("weeklyPlan", { userId: USER, dayOfWeek, templateId, flags });
  },
});

export const seedWeeklyPlan = mutation({
  args: {
    days: v.array(v.object({
      dayOfWeek: v.string(), templateId: v.string(), flags: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, { days }) => {
    for (const d of days) {
      const existing = await ctx.db.query("weeklyPlan")
        .withIndex("by_user", q => q.eq("userId", USER))
        .filter(q => q.eq(q.field("dayOfWeek"), d.dayOfWeek)).first();
      if (!existing) await ctx.db.insert("weeklyPlan", { userId: USER, ...d });
    }
  },
});

// ═══════════════════════════════════════════
// DAILY LOGS
// ═══════════════════════════════════════════

export const getDailyLog = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    return await ctx.db.query("dailyLogs")
      .withIndex("by_user_date", q => q.eq("userId", USER).eq("date", date)).first();
  },
});

export const getDailyLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("dailyLogs")
      .withIndex("by_user_date", q => q.eq("userId", USER)).collect();
  },
});

export const saveDailyRun = mutation({
  args: {
    date: v.string(),
    templateUsed: v.optional(v.string()),
    dailyRun: v.array(v.object({
      time: v.string(), label: v.string(), type: v.string(), items: v.array(v.string()),
      note: v.optional(v.string()), macros: v.optional(v.string()), duration: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { date, templateUsed, dailyRun }) => {
    const existing = await ctx.db.query("dailyLogs")
      .withIndex("by_user_date", q => q.eq("userId", USER).eq("date", date)).first();
    if (existing) await ctx.db.patch(existing._id, { templateUsed, dailyRun });
    else await ctx.db.insert("dailyLogs", { userId: USER, date, templateUsed, dailyRun });
  },
});

export const upsertDailyLog = mutation({
  args: {
    date: v.string(),
    weight: v.optional(v.number()),
    feeling: v.optional(v.number()),
    liftDone: v.optional(v.boolean()),
    ruckDone: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { date, ...fields } = args;
    const existing = await ctx.db.query("dailyLogs")
      .withIndex("by_user_date", q => q.eq("userId", USER).eq("date", date)).first();
    if (existing) await ctx.db.patch(existing._id, fields);
    else await ctx.db.insert("dailyLogs", { userId: USER, date, ...fields });
  },
});

// ═══════════════════════════════════════════
// CHECKS
// ═══════════════════════════════════════════

export const getChecks = query({
  args: { checkKey: v.string() },
  handler: async (ctx, { checkKey }) => {
    const rows = await ctx.db.query("checks")
      .withIndex("by_user_key", q => q.eq("userId", USER).eq("checkKey", checkKey)).collect();
    // Return as ARRAY to avoid em-dash in field names crashing Convex serialization
    return rows.map(r => ({ itemKey: r.itemKey, done: r.done }));
  },
});

export const toggleCheck = mutation({
  args: { checkKey: v.string(), itemKey: v.string(), done: v.boolean() },
  handler: async (ctx, { checkKey, itemKey, done }) => {
    const existing = await ctx.db.query("checks")
      .withIndex("by_user_key", q => q.eq("userId", USER).eq("checkKey", checkKey))
      .filter(q => q.eq(q.field("itemKey"), itemKey)).first();
    if (existing) await ctx.db.patch(existing._id, { done });
    else await ctx.db.insert("checks", { userId: USER, checkKey, itemKey, done });
  },
});

// History: get substance usage over last N days
export const getSubstanceHistory = query({
  args: { substanceName: v.string(), days: v.optional(v.number()) },
  handler: async (ctx, { substanceName, days }) => {
    const numDays = days ?? 90;
    const allChecks = await ctx.db.query("checks")
      .withIndex("by_user_key", q => q.eq("userId", USER)).collect();
    // Filter to checks containing this substance name
    const matching = allChecks.filter(c => c.itemKey.toLowerCase().includes(substanceName.toLowerCase()));
    // Group by date (extract from checkKey: "YYYY-MM-DD_phase_dayType")
    const byDate: Record<string, boolean> = {};
    for (const c of matching) {
      const date = c.checkKey.split("_")[0];
      if (c.done) byDate[date] = true;
      else if (!byDate[date]) byDate[date] = false;
    }
    // Filter to last N days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - numDays);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    const result: Array<{ date: string; done: boolean }> = [];
    for (const [date, done] of Object.entries(byDate)) {
      if (date >= cutoffStr) result.push({ date, done });
    }
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  },
});
