import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Daily check-offs keyed by "YYYY-MM-DD_phase_dayType"
  checks: defineTable({
    userId: v.string(),
    checkKey: v.string(),   // e.g. "2026-03-29_reset_lift"
    itemKey: v.string(),    // e.g. "WAKE__Pinealon 1mg — oral, fasted"
    done: v.boolean(),
  }).index("by_user_key", ["userId", "checkKey"]),

  // Daily logs (weight, feeling, activity)
  dailyLogs: defineTable({
    userId: v.string(),
    date: v.string(),       // YYYY-MM-DD
    weight: v.optional(v.number()),
    feeling: v.optional(v.number()),
    liftDone: v.optional(v.boolean()),
    ruckDone: v.optional(v.boolean()),
    ruckWeight: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("by_user_date", ["userId", "date"]),

  // Cycle records (on/off timed cycles)
  cycles: defineTable({
    userId: v.string(),
    substanceName: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    phase: v.union(v.literal("on"), v.literal("off")),
  }).index("by_user", ["userId"]),

  // Maintenance records (always-on substances)
  maintenance: defineTable({
    userId: v.string(),
    substanceName: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Supply items (per-substance inventory + cost)
  supply: defineTable({
    userId: v.string(),
    itemId: v.string(),     // stable client-side id e.g. "pinealon"
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
    deepResearchStatus: v.optional(v.string()), // "pending" | "done" | "failed"
  }).index("by_user", ["userId"])
    .index("by_user_itemId", ["userId", "itemId"]),

  // User stacks (personal + imported from reference)
  stacks: defineTable({
    userId: v.string(),
    stackId: v.string(),    // stable client-side id
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
  }).index("by_user", ["userId"])
    .index("by_user_stackId", ["userId", "stackId"]),
});
