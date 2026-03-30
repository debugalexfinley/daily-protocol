import { mutation, query } from "./_generated/server";
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
