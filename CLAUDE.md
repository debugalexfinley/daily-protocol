# CLAUDE.md — Daily Protocol App

## What This Is
Single-user supplement/biohacking protocol tracker. 4-tab mobile-first dark UI:
**SCHEDULE → LOG → SUPPLY → LIBRARY**

User: Nathan (`const USER = "nathan"` hardcoded)

Live: https://daily-protocol-two.vercel.app

## Tech Stack
- **Frontend**: Next.js 16 + React 19, single `src/app/page.tsx` (all UI)
- **Backend**: Convex (real-time sync) — `beloved-mosquito-782` (prod)
- **Styling**: Inline styles, dark theme (#0d0d0d bg, #1a1a1a cards, #2a2a2a borders)
- **Research**: Gemini Flash via `/api/research/route.ts` (Quick) + Convex action (Deep)
- **Deploy**: Vercel (`daily-protocol` project, `loangraphs` team)

## Key Files
```
src/app/page.tsx          — Entire UI (1200+ lines, "use client")
src/app/api/research/     — Gemini Flash quick research route
convex/schema.ts          — 7 tables: scheduleTemplates, compounds, supply, stacks, weeklyPlan, dailyLogs, checks
convex/protocol.ts        — All queries/mutations/actions
PRD.md                    — Full product spec
PRD-features.md           — Feature wishlist
```

## Critical Rules

### Convex Gotchas
- `getChecks` returns **ARRAY** of `{itemKey, done}` — NOT an object map
- Convert on client: `Object.fromEntries(arr.map(r => [r.itemKey, r.done]))`
- Em-dash `—` in field names crashes Convex — never use as object keys
- `mgPerUnit` is `v.optional(v.number())` — pass `undefined` not `null`

### Env Vars
- Vercel: `NEXT_PUBLIC_CONVEX_URL=https://beloved-mosquito-782.convex.cloud`, `GEMINI_API_KEY`
- Convex prod: `GEMINI_API_KEY` (for deep research action)
- `.env.local` points to **dev** deployment (lovable-mockingbird-372) — do NOT deploy from local without `--prod`
- Set Vercel env vars with `printf` not `echo` (avoids trailing newline)

### Deploy
```bash
cd ~/Documents/GitHub/daily-protocol
npx next build                # verify build
npx convex deploy --yes       # push schema+functions to prod
npx vercel --prod             # deploy frontend
```

### Don't Touch
- `/api/research/route.ts` — Gemini Flash quick research, works as-is
- `ConvexClientProvider.tsx` — standard provider wrapper

## Architecture

### Tab 1: SCHEDULE
- Template selector pills (Maintenance Lift/Ruck, Reset Lift/Ruck)
- Time-blocked schedule view with type filter (All/Supplement/Meal/Training/Focus)
- "Push to Today" → saves blocks to `dailyLogs.dailyRun`
- Weekly planner: Mon-Sun template assignment
- Schedule constants: `RESET_LIFT`, `RESET_RUCK`, `POST_LIFT`, `POST_RUCK`
- Type colors: supplement=#2d5a2d, meal=#5a4d2d, training=#2d2d5a, focus=#5a2d5a

### Tab 2: LOG
- Today's pushed schedule with per-item checkboxes
- Type filter (All/Supplement/Meal/Training/Focus)
- Daily metrics: weight, feeling (1-10), lift/ruck toggles, notes
- Progress bar (done/total items)
- 30-day history heatmap

### Tab 3: SUPPLY
- 74 items with vendor data, mg-per-unit dosing, configurable units
- Unit types: caps, tabs, doses, servings, mg, mL, IU, g, packets, pouches, days
- Sortable by runway/cost/name
- Expandable vendor comparison (best price green)
- Edit modal: stock, unit (dropdown), mg/unit, weekly usage, vendors, notes
- Runway warnings: amber <2wk, red <1wk
- All unverified items start at 0 stock — user updates as they verify

### Tab 4: LIBRARY
- Compounds: cards with tags, research buttons, stack badges
- Stacks: named groupings (9 reference stacks seeded)
- Quick research → `/api/research` POST
- Deep research → `runDeepResearch` Convex action

## Convex Tables
| Table | Purpose | Key indexes |
|-------|---------|-------------|
| scheduleTemplates | Editable protocol blueprints | by_user |
| compounds | Reference data for each substance | by_user, by_user_compoundId |
| supply | Inventory + vendors + dosing | by_user, by_user_compoundId |
| stacks | Named compound groupings | by_user, by_user_stackId |
| weeklyPlan | Template per day of week | by_user |
| dailyLogs | Daily run + metrics | by_user_date |
| checks | Per-item checkoffs | by_user_key |

## Seed Data
All seed functions are idempotent (check before insert). Triggered on first load:
- `seedTemplates` — 4 templates from schedule constants
- `seedSupply` — 74 items with vendors, mg/unit, categories
- `seedCompounds` — 73 compounds with tags
- `seedStacks` — 9 reference stacks
- `seedWeeklyPlan` — Mon-Sun default assignment

## Recommended Improvements (TODO)
1. **Auto-decrement supply** — When checking off a supplement in LOG, subtract from supply stock
2. **Reorder notifications** — Push/telegram alert when any item hits <1 week runway
3. **Photo inventory** — Let user snap shelf photo, OCR/vision to batch-update stock
4. **Cycle tracker** — Visual timeline for cycling compounds (Cordyceps 8on/2off, 9-me-BC 4wk stop)
5. **Template editing in-app** — Currently view-only; add inline block editing (time, add/remove items)
6. **Export/share** — Generate shareable PDF or link of current protocol
7. **Barcode scanner** — Scan supplement bottles to auto-identify and update stock
8. **Cost dashboard** — Monthly/weekly spend chart across all supplements
9. **Interaction checker** — Flag potential compound interactions (via Gemini)
10. **PWA support** — Add manifest + service worker for install-to-homescreen
