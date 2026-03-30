import { mutation, query, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const USER = "nathan"; // single-user app

// ─────────────────────────────────────────
// CHECKS
// ─────────────────────────────────────────

export const getChecks = query({
  args: { checkKey: v.string() },
  handler: async (ctx, { checkKey }) => {
    const rows = await ctx.db
      .query("checks")
      .withIndex("by_user_key", q => q.eq("userId", USER).eq("checkKey", checkKey))
      .collect();
    const map: Record<string, boolean> = {};
    for (const r of rows) map[r.itemKey] = r.done;
    return map;
  },
});

export const toggleCheck = mutation({
  args: { checkKey: v.string(), itemKey: v.string(), done: v.boolean() },
  handler: async (ctx, { checkKey, itemKey, done }) => {
    const existing = await ctx.db
      .query("checks")
      .withIndex("by_user_key", q => q.eq("userId", USER).eq("checkKey", checkKey))
      .filter(q => q.eq(q.field("itemKey"), itemKey))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { done });
    } else {
      await ctx.db.insert("checks", { userId: USER, checkKey, itemKey, done });
    }
  },
});

// ─────────────────────────────────────────
// DAILY LOGS
// ─────────────────────────────────────────

export const getLogs = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("dailyLogs")
      .withIndex("by_user_date", q => q.eq("userId", USER))
      .collect();
    const map: Record<string, object> = {};
    for (const r of rows) {
      map[r.date] = {
        weight: r.weight,
        feeling: r.feeling,
        liftDone: r.liftDone,
        ruckDone: r.ruckDone,
        ruckWeight: r.ruckWeight,
        notes: r.notes,
      };
    }
    return map;
  },
});

export const upsertLog = mutation({
  args: {
    date: v.string(),
    weight: v.optional(v.number()),
    feeling: v.optional(v.number()),
    liftDone: v.optional(v.boolean()),
    ruckDone: v.optional(v.boolean()),
    ruckWeight: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { date, ...fields } = args;
    const existing = await ctx.db
      .query("dailyLogs")
      .withIndex("by_user_date", q => q.eq("userId", USER).eq("date", date))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, fields);
    } else {
      await ctx.db.insert("dailyLogs", { userId: USER, date, ...fields });
    }
  },
});

// ─────────────────────────────────────────
// CYCLES
// ─────────────────────────────────────────

export const getCycles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("cycles")
      .withIndex("by_user", q => q.eq("userId", USER))
      .collect();
  },
});

export const startCycle = mutation({
  args: { substanceName: v.string(), phase: v.union(v.literal("on"), v.literal("off")), startDate: v.string() },
  handler: async (ctx, { substanceName, phase, startDate }) => {
    // End any open cycle for this substance
    const open = await ctx.db
      .query("cycles")
      .withIndex("by_user", q => q.eq("userId", USER))
      .filter(q => q.and(q.eq(q.field("substanceName"), substanceName), q.eq(q.field("endDate"), undefined)))
      .first();
    if (open) await ctx.db.patch(open._id, { endDate: startDate });
    await ctx.db.insert("cycles", { userId: USER, substanceName, phase, startDate });
  },
});

export const endCycle = mutation({
  args: { id: v.id("cycles"), endDate: v.string() },
  handler: async (ctx, { id, endDate }) => {
    await ctx.db.patch(id, { endDate });
  },
});

export const deleteCycle = mutation({
  args: { id: v.id("cycles") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ─────────────────────────────────────────
// MAINTENANCE
// ─────────────────────────────────────────

export const getMaintenance = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("maintenance")
      .withIndex("by_user", q => q.eq("userId", USER))
      .collect();
  },
});

export const startMaintenance = mutation({
  args: { substanceName: v.string(), startDate: v.string() },
  handler: async (ctx, { substanceName, startDate }) => {
    const existing = await ctx.db
      .query("maintenance")
      .withIndex("by_user", q => q.eq("userId", USER))
      .filter(q => q.and(q.eq(q.field("substanceName"), substanceName), q.eq(q.field("endDate"), undefined)))
      .first();
    if (existing) return; // already active
    await ctx.db.insert("maintenance", { userId: USER, substanceName, startDate });
  },
});

export const stopMaintenance = mutation({
  args: { substanceName: v.string(), endDate: v.string() },
  handler: async (ctx, { substanceName, endDate }) => {
    const open = await ctx.db
      .query("maintenance")
      .withIndex("by_user", q => q.eq("userId", USER))
      .filter(q => q.and(q.eq(q.field("substanceName"), substanceName), q.eq(q.field("endDate"), undefined)))
      .first();
    if (open) await ctx.db.patch(open._id, { endDate });
  },
});

// ─────────────────────────────────────────
// SUPPLY
// ─────────────────────────────────────────

export const getSupply = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("supply")
      .withIndex("by_user", q => q.eq("userId", USER))
      .collect();
  },
});

export const upsertSupplyItem = mutation({
  args: {
    itemId: v.string(),
    name: v.string(),
    cat: v.string(),
    color: v.string(),
    supplier: v.string(),
    supplierUrl: v.string(),
    costPerOrder: v.number(),
    unitsPerOrder: v.number(),
    currentUnits: v.number(),
    unitsPerDay: v.number(),
    unitLabel: v.string(),
    notes: v.string(),
    links: v.optional(v.array(v.object({ label: v.string(), url: v.string() }))),
    researchNotes: v.optional(v.string()),
    deepResearchNotes: v.optional(v.string()),
    deepResearchStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { itemId, ...fields } = args;
    const existing = await ctx.db
      .query("supply")
      .withIndex("by_user_itemId", q => q.eq("userId", USER).eq("itemId", itemId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...fields });
    } else {
      await ctx.db.insert("supply", { userId: USER, itemId, ...fields });
    }
  },
});

export const saveResearchNotes = mutation({
  args: { itemId: v.string(), researchNotes: v.string() },
  handler: async (ctx, { itemId, researchNotes }) => {
    const existing = await ctx.db
      .query("supply")
      .withIndex("by_user_itemId", q => q.eq("userId", USER).eq("itemId", itemId))
      .first();
    if (existing) await ctx.db.patch(existing._id, { researchNotes });
  },
});

// Internal mutation to write deep research results back
export const _saveDeepResearch = internalMutation({
  args: { itemId: v.string(), deepResearchNotes: v.string(), status: v.string() },
  handler: async (ctx, { itemId, deepResearchNotes, status }) => {
    const existing = await ctx.db
      .query("supply")
      .withIndex("by_user_itemId", q => q.eq("userId", USER).eq("itemId", itemId))
      .first();
    if (existing) await ctx.db.patch(existing._id, { deepResearchNotes, deepResearchStatus: status });
  },
});

// Public mutation to set pending status
export const setDeepResearchPending = mutation({
  args: { itemId: v.string() },
  handler: async (ctx, { itemId }) => {
    const existing = await ctx.db
      .query("supply")
      .withIndex("by_user_itemId", q => q.eq("userId", USER).eq("itemId", itemId))
      .first();
    if (existing) await ctx.db.patch(existing._id, { deepResearchStatus: "pending", deepResearchNotes: undefined });
  },
});

// Action: calls Gemini Deep Research API (can do async HTTP, runs server-side)
export const runDeepResearch = action({
  args: {
    itemId: v.string(),
    supplementName: v.string(),
    activeStack: v.array(v.string()),
  },
  handler: async (ctx, { itemId, supplementName, activeStack }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("No GEMINI_API_KEY set");

    const activeList = activeStack.length ? activeStack.join(", ") : "none";
    const query = `Perform comprehensive deep research on the supplement/nootropic/peptide: "${supplementName}"

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

    // Start the deep research interaction
    const createResp = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ input: query, agent: "deep-research-pro-preview-12-2025", background: true }),
    });

    if (!createResp.ok) {
      const err = await createResp.text();
      await ctx.runMutation(internal.protocol._saveDeepResearch, {
        itemId, deepResearchNotes: `Research failed: ${err}`, status: "failed"
      });
      return;
    }

    const interaction = await createResp.json();
    const interactionId = interaction.name?.split("/").pop() || interaction.id;

    // Poll until complete (Convex actions can run up to 10 minutes)
    let attempts = 0;
    while (attempts < 60) {
      await new Promise(r => setTimeout(r, 10000)); // wait 10s
      attempts++;

      const pollResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/interactions/${interactionId}`, {
        headers: { "x-goog-api-key": apiKey },
      });

      if (!pollResp.ok) continue;
      const data = await pollResp.json();
      const status = data.status || data.state || "";

      if (status === "completed" || status === "COMPLETED") {
        // Extract text from output
        let report = "";
        if (data.output?.text) report = data.output.text;
        else if (typeof data.output === "string") report = data.output;
        else {
          const msgs = data.messages || data.turns || [];
          for (const m of msgs.reverse()) {
            const parts = m.content?.parts || m.parts || [];
            for (const p of parts) {
              if (p.text) { report = p.text; break; }
            }
            if (report) break;
          }
        }
        if (!report) report = JSON.stringify(data.output || data, null, 2);
        await ctx.runMutation(internal.protocol._saveDeepResearch, { itemId, deepResearchNotes: report, status: "done" });
        return;
      }

      if (status === "failed" || status === "FAILED") {
        await ctx.runMutation(internal.protocol._saveDeepResearch, {
          itemId, deepResearchNotes: `Deep research failed after ${attempts * 10}s`, status: "failed"
        });
        return;
      }
    }

    // Timeout
    await ctx.runMutation(internal.protocol._saveDeepResearch, {
      itemId, deepResearchNotes: "Deep research timed out after 10 minutes.", status: "failed"
    });
  },
});

export const seedSupply = mutation({
  args: {
    items: v.array(v.object({
      itemId: v.string(),
      name: v.string(),
      cat: v.string(),
      color: v.string(),
      supplier: v.string(),
      supplierUrl: v.string(),
      costPerOrder: v.number(),
      unitsPerOrder: v.number(),
      currentUnits: v.number(),
      unitsPerDay: v.number(),
      unitLabel: v.string(),
      notes: v.string(),
    })),
  },
  handler: async (ctx, { items }) => {
    for (const item of items) {
      const { itemId, ...fields } = item;
      const existing = await ctx.db
        .query("supply")
        .withIndex("by_user_itemId", q => q.eq("userId", USER).eq("itemId", itemId))
        .first();
      if (!existing) {
        await ctx.db.insert("supply", { userId: USER, itemId, ...fields });
      }
    }
  },
});

// ─────────────────────────────────────────
// STACKS
// ─────────────────────────────────────────

export const getStacks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("stacks")
      .withIndex("by_user", q => q.eq("userId", USER))
      .collect();
  },
});

export const upsertStack = mutation({
  args: {
    stackId: v.string(),
    name: v.string(),
    color: v.string(),
    notes: v.string(),
    items: v.array(v.object({
      name: v.string(),
      dose: v.string(),
      freq: v.string(),
      source: v.string(),
      price: v.string(),
      what: v.string(),
    })),
    mode: v.union(v.literal("inactive"), v.literal("daily"), v.literal("once")),
    activeSince: v.optional(v.string()),
    activeDate: v.optional(v.string()),
    fromRef: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { stackId, ...fields } = args;
    const existing = await ctx.db
      .query("stacks")
      .withIndex("by_user_stackId", q => q.eq("userId", USER).eq("stackId", stackId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, fields);
    } else {
      await ctx.db.insert("stacks", { userId: USER, stackId, ...fields });
    }
  },
});

export const deleteStack = mutation({
  args: { stackId: v.string() },
  handler: async (ctx, { stackId }) => {
    const existing = await ctx.db
      .query("stacks")
      .withIndex("by_user_stackId", q => q.eq("userId", USER).eq("stackId", stackId))
      .first();
    if (existing) await ctx.db.delete(existing._id);
  },
});
