import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Schedule templates (editable blueprints)
  scheduleTemplates: defineTable({
    userId: v.string(),
    templateId: v.string(),
    name: v.string(),
    color: v.string(),
    phase: v.string(), // "maintenance" | "reset" | "custom"
    dayType: v.string(), // "lift" | "ruck" | "rest" | "custom"
    blocks: v.array(v.object({
      time: v.string(),
      label: v.string(),
      type: v.string(), // "supplement" | "meal" | "training" | "focus"
      items: v.array(v.string()),
      note: v.optional(v.string()),
      macros: v.optional(v.string()),
      duration: v.optional(v.string()),
    })),
    compoundRules: v.optional(v.array(v.object({
      compoundName: v.string(),
      rule: v.string(), // "indefinite" | "fixed" | "cycle"
      daysOn: v.optional(v.number()),
      daysOff: v.optional(v.number()),
      startDate: v.optional(v.string()),
      maxDays: v.optional(v.number()),
    }))),
    sortOrder: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // Compounds (LIBRARY reference data)
  compounds: defineTable({
    userId: v.string(),
    compoundId: v.string(),
    name: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    userNotes: v.optional(v.string()),
    links: v.optional(v.array(v.object({ label: v.string(), url: v.string() }))),
    researchNotes: v.optional(v.string()),
    deepResearchNotes: v.optional(v.string()),
    deepResearchStatus: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_user_compoundId", ["userId", "compoundId"]),

  // Supply (inventory + vendors)
  supply: defineTable({
    userId: v.string(),
    compoundId: v.string(),
    name: v.string(),
    category: v.string(),
    color: v.string(),
    currentStock: v.number(),
    stockUnit: v.string(), // "doses" | "caps" | "mg" | "g" | "servings" | "days"
    mgPerUnit: v.optional(v.number()),
    weeklyUsage: v.number(),
    vendors: v.array(v.object({
      name: v.string(),
      url: v.string(),
      costPerOrder: v.number(),
      unitsPerOrder: v.number(),
    })),
    notes: v.string(),
  }).index("by_user", ["userId"])
    .index("by_user_compoundId", ["userId", "compoundId"]),

  // Stacks (LIBRARY groupings)
  stacks: defineTable({
    userId: v.string(),
    stackId: v.string(),
    name: v.string(),
    color: v.string(),
    items: v.array(v.object({
      compoundName: v.string(),
      dose: v.string(),
      freq: v.string(),
      notes: v.optional(v.string()),
    })),
    sortOrder: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_user_stackId", ["userId", "stackId"]),

  // Weekly plan (which template per day)
  weeklyPlan: defineTable({
    userId: v.string(),
    dayOfWeek: v.string(), // "Mon" | "Tue" | ... | "Sun"
    templateId: v.string(),
    flags: v.optional(v.array(v.string())),
  }).index("by_user", ["userId"]),

  // Daily logs
  dailyLogs: defineTable({
    userId: v.string(),
    date: v.string(),
    templateUsed: v.optional(v.string()),
    dailyRun: v.optional(v.array(v.object({
      time: v.string(),
      label: v.string(),
      type: v.string(),
      items: v.array(v.string()),
      note: v.optional(v.string()),
      macros: v.optional(v.string()),
      duration: v.optional(v.string()),
    }))),
    weight: v.optional(v.number()),
    feeling: v.optional(v.number()),
    liftDone: v.optional(v.boolean()),
    ruckDone: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  }).index("by_user_date", ["userId", "date"]),

  // Checks (individual item checkoffs)
  checks: defineTable({
    userId: v.string(),
    checkKey: v.string(),
    itemKey: v.string(),
    done: v.boolean(),
  }).index("by_user_key", ["userId", "checkKey"]),
});
