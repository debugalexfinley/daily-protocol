# Daily Protocol App — Full Redesign PRD

## Tasks

- [ ] Read the existing src/app/page.tsx, convex/schema.ts, convex/protocol.ts fully before making any changes
- [ ] Rewrite convex/schema.ts with new schema (scheduleTemplates, compounds, supply with vendors+weeklyUsage, stacks simplified, dailyLogs with dailyRun, checks unchanged)
- [ ] Rewrite convex/protocol.ts with all new queries/mutations/actions (see spec below). CRITICAL: getChecks must return ARRAY of {itemKey,done} not object map
- [ ] Rewrite src/app/page.tsx as 4-tab app: SCHEDULE, LOG, SUPPLY, LIBRARY (see spec below). Keep existing dark theme. Keep /api/research route unchanged.
- [ ] Seed data: templates from existing RESET_LIFT/RESET_RUCK/POST_LIFT/POST_RUCK constants, compounds from all unique substances, supply with vendors+weekly usage for 70+ items, stacks from REF_STACKS
- [ ] Run `npx convex deploy --yes` to deploy schema+functions to prod (beloved-mosquito-782)
- [ ] Run `npx vercel --prod` to deploy frontend  
- [ ] Run `git add -A && git commit -m "feat: full redesign — 4-tab architecture with schedule templates, log, supply vendors, library compounds"` to commit

## Architecture: 4 Tabs

### Tab 1: SCHEDULE — Editable Protocol Templates
- Template selector (pills/dropdown): Maintenance Lift, Maintenance Ruck, Reset Lift, Reset Ruck, Custom
- Shows time-blocked schedule for selected template (same visual as current)
- **Filter by type**: buttons/pills to filter schedule view by: All | Supplements Only | Meals Only | Training Only | Focus Only
- Each block editable: tap a block to edit it:
  - Change the TIME for the entire block (e.g., move "WAKE" supplements from 5:15 AM to 6:00 AM)
  - Add items to the block (search/autocomplete from compounds library)
  - Remove individual items from the block (✕ button per item)
  - Change block label, type, note, macros
- "+ Add Block", "+ New Template" buttons
- "▶ Push to Today" button: saves blocks to dailyLogs.dailyRun, warns if already exists
- **Weekly Planner**: collapsible section or sub-view showing Mon-Sun grid
  - Each day shows which template is assigned (e.g., Mon=Maintenance Lift, Wed=Maintenance Ruck)
  - User can tap a day to change which template it uses
  - The WEEKLY constant (existing) seeds this: Mon=lift, Tue=lift, Wed=ruck, Thu=lift, Fri=lift, Sat=ruck, Sun=ruck
  - Also shows per-day flags: Reta injection days (Mon/Wed/Fri), GHK-Cu (Mon-Fri)
  - Store in Convex: `weeklyPlan` table or field on user preferences
- Cycle status banner: "Cordyceps: Week 3/8 ON · 9-me-BC: STOPPED"
- Per-compound lifecycle rules: indefinite, fixed duration (N days), cycling (X on / Y off)
- Collapsible rules section (from RESET_RULES/POST_RULES constants)

### Tab 2: LOG — Today + History
- Default: today's pushed schedule with checkboxes per item
- If no protocol loaded: CTA to go to Schedule
- Daily metrics: weight, feeling (1-5), lift/ruck done, notes
- Progress bar: "14/32 complete"
- History section: search compound → 90-day calendar heatmap (gray/dim-green/bright-green)
- Streak stats: current streak, best streak, total days

### Tab 3: SUPPLY — Inventory + Cost
- Per-substance: collapsed row (name, category, stock, runway weeks, best price)
- Expanded: vendor comparison table (name, qty, price, $/unit — best highlighted green)
- Sort by runway (low first), name, cost, category
- Edit modal: stock, weeklyUsage, vendors, mgPerUnit, stockUnit
- Amber warning <2wk runway, red <1wk
- Seed 70+ items with real vendor data

### Tab 4: LIBRARY — Compounds + Stacks
- Sub-view toggle: Compounds (default) | Stacks
- **Compounds**: cards with name, category, tags, user notes, links
  - Expand: full research markdown, Quick/Deep research buttons
  - Tag filter bar: #focus #sleep #blood-pressure #recovery #peptide etc.
  - "In stacks: X · Y" badges
  - "+ Add to Stack" per compound
- **Stacks**: named groupings with compounds+doses
  - Add/remove compounds, create/delete stacks
  - Seed from REF_STACKS

## Convex Schema (convex/schema.ts)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  scheduleTemplates: defineTable({
    userId: v.string(),
    templateId: v.string(),
    name: v.string(),
    color: v.string(),
    phase: v.string(),
    dayType: v.string(),
    blocks: v.array(v.object({
      time: v.string(),
      label: v.string(),
      type: v.string(),
      items: v.array(v.string()),
      note: v.optional(v.string()),
      macros: v.optional(v.string()),
      duration: v.optional(v.string()),
    })),
    compoundRules: v.optional(v.array(v.object({
      compoundName: v.string(),
      rule: v.string(),
      daysOn: v.optional(v.number()),
      daysOff: v.optional(v.number()),
      startDate: v.optional(v.string()),
      maxDays: v.optional(v.number()),
    }))),
    sortOrder: v.optional(v.number()),
  }).index("by_user", ["userId"]),

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

  supply: defineTable({
    userId: v.string(),
    compoundId: v.string(),
    name: v.string(),
    category: v.string(),
    color: v.string(),
    currentStock: v.number(),
    stockUnit: v.string(),
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

  weeklyPlan: defineTable({
    userId: v.string(),
    dayOfWeek: v.string(), // "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
    templateId: v.string(), // which template to use this day
    flags: v.optional(v.array(v.string())), // e.g. ["reta", "ghk-cu"]
  }).index("by_user", ["userId"]),

  checks: defineTable({
    userId: v.string(),
    checkKey: v.string(),
    itemKey: v.string(),
    done: v.boolean(),
  }).index("by_user_key", ["userId", "checkKey"]),
});
```

## Convex Functions (convex/protocol.ts)

const USER = "nathan";

Queries: getTemplates, getCompounds, getSupply, getStacks, getDailyLog(date), getChecks(checkKey) → returns ARRAY [{itemKey,done}], getSubstanceHistory(substanceName,days) → scans checks, getDailyLogs → all logs

Mutations: upsertTemplate, deleteTemplate, upsertCompound, deleteCompound, upsertSupplyItem, deleteSupplyItem, upsertStack, deleteStack, saveDailyRun(date,templateUsed,blocks), upsertDailyLog(date,data), toggleCheck(checkKey,itemKey,done), seedTemplates, seedCompounds, seedSupply, seedStacks, saveResearchNotes(compoundId,notes), setDeepResearchPending(compoundId)

Actions: runDeepResearch(compoundId,compoundName,activeStack[]) — same Gemini Deep Research logic as current (poll interactions API). Uses internal mutation _saveDeepResearch to write results.

## Supply Seed Data (70+ items)

All items need: compoundId, name, category, color, currentStock (sensible default), stockUnit, weeklyUsage, vendors (1-3 real vendors with URLs and prices), notes.

**Existing 24 items** (update with weeklyUsage + vendor arrays):
pinealon (7/wk, CosmoPeptide $45/30), alpha-gpc (4/wk, ND $19/60, Amazon $17/60), citicoline (3/wk, ND $64.99/180), bromantane (7/wk, Nootropic Source $30/20), bpc157 (0/wk default, Peptide Sciences $40/20), 9mebc (0/wk default, Nootropic Source $25/25), semax (14/wk, Peptide Sciences $40/16), selank (14/wk, Peptide Sciences $40/20), thiamine (7/wk, Amazon/NOW $15/100), magglycinate (7/wk, Doctor's Best $15/120, Walmart $12/120), creatine (7/wk, Bulk Supplements $25/50), cordyceps (7/wk, ND $30/30), polygala (7/wk, ND $29.99/60), agmatine (7/wk, Bulk Supplements $20/167), tau (7/wk, ND $30/30), reta (3/wk doses = ~4mg/wk, LLN $80/10mg, Peptide Sciences $75/10mg), gh (7/wk, Rx $150/30), ghkcu (5/wk, Peptide Sciences $50/5, LLN $45/5), sabroxy (2.5/wk, ND $39.99/180), dynamine (2.5/wk, ND $30/60), lcarnitine (7/wk, Bulk Supplements $20/40), pump-blend (4/wk, Custom $35/30), 5amino1mq (14/wk, peptide vendor $50/60), motsc (3/wk, Peptide Sciences $60/1, LLN $55/1)

**50 new items** (add with sensible data):
nac (14/wk, NOW $15/250), r-lipoic-acid (14/wk, Life Extension $52/90), vitamin-c (14/wk, NOW $20/250), fish-oil (14/wk, Nordic Naturals $22/60), tudca (14/wk, Double Wood $28/60), black-seed-oil (14/wk, Grimm's $30/16oz), coq10 (7/wk, Jarrow $30/60), nattokinase (14/wk, Doctor's Best $20/90), carditone (7/wk, Ayush $30/60), aged-garlic (7/wk, Kyolic $15/100), tadalafil (7/wk, Rx $30/30), nobiletin (7/wk, ND $20/60), ginkgo (7/wk, NOW $10/120), huperzine-a (2/wk, ND $22/120), lions-mane (7/wk, Real Mushrooms $30/60), glycine (7/wk, Bulk Supplements $15/100), mag-threonate (7/wk, Life Extension $25/90), psyllium (21/wk, Walmart $10/72), tongkat-ali (7/wk, ND $30/60), l-theanine (7/wk, NOW $15/100), mucuna (2/wk, ND $15/90), l-tyrosine (7/wk, NOW $10/120), rhodiola (7/wk, ND $18/90), cognance (7/wk, ND $70/180), dma-dhf (7/wk, ND $75/90), betaine-anhydrous (4/wk, Bulk Supplements $12/100), glycerol (4/wk, Bulk Supplements $15/60), l-citrulline (4/wk, Bulk Supplements $20/60), methylene-blue (2/wk, various $25/60), betaine-hcl (7/wk, NOW $12/120), l-glutamine (7/wk, Bulk Supplements $20/100), digestive-enzymes (21/wk, NOW $20/90), vitamin-d3 (7/wk, NOW $12/240), vitamin-k2 (7/wk, NOW $15/120), zinc (7/wk, NOW $8/120), boron (7/wk, Double Wood $15/120), ashwagandha (7/wk, ND $25/90), berberine (14/wk, Thorne $40/60), nmn (7/wk, Double Wood $40/60), pterostilbene (7/wk, ND $20/60), resveratrol (7/wk, NOW $25/120), melatonin (7/wk, NOW $8/180), gaba (7/wk, NOW $10/100), phosphatidylserine (7/wk, Double Wood $20/120), alcar (7/wk, NOW $15/100), lclt (4/wk, Bulk Supplements $18/60), collagen (7/wk, Vital Proteins $25/28), electrolyte-mix (7/wk, LMNT $45/30), nicotine (0/wk, Zyn $5/15), dmaa (1/wk, various $20/60)

## Compound Seed Data

Extract all unique compound names from templates + supply + stacks. For each, assign:
- category (from supply data)
- tags (assign 2-4 relevant tags each from: focus, sleep, blood-pressure, recovery, peptide, nootropic, vitamin, mineral, amino-acid, mushroom, herb, metabolic, anti-inflammatory, heart-health, gut-health, cognitive, hormonal, cycle-required, daily-ok, as-needed)
- userNotes: empty initially
- links: empty initially

## Predefined Tags
focus, sleep, blood-pressure, recovery, peptide, nootropic, vitamin, mineral, amino-acid, mushroom, herb, metabolic, anti-inflammatory, heart-health, gut-health, cognitive, hormonal, cycle-required, daily-ok, as-needed

## Important Notes
- Keep the dark theme (#0d0d0d bg, #1a1a1a cards, #2a2a2a borders, colored accents)
- Keep src/app/api/research/route.ts unchanged (Gemini Flash quick research)
- Keep src/app/ConvexClientProvider.tsx unchanged
- Mobile-first responsive design
- const USER = "nathan" single-user hardcoded
- GEMINI_API_KEY is set in Convex prod env vars already
- getChecks MUST return array not object (em-dash bug)
