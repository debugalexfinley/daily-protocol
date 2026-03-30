# Daily Protocol App — Feature PRD

## Tasks

- [x] **SUPPLY: unitsPerDay → unitsPerWeek** — rename field throughout (schema, mutations, UI labels, runway calc). Runway = currentUnits ÷ (unitsPerWeek/7).

- [ ] **SUPPLY: Multiple vendors** — add `vendors` array to schema (`{name,url,costPerOrder,unitsPerOrder}`). In edit modal, allow add/edit/delete vendors. Show lowest-cost-per-unit vendor highlighted green. Primary `supplier/supplierUrl/costPerOrder/unitsPerOrder` become the "best vendor" auto-derived from vendors array (lowest cost per unit).

- [ ] **SUPPLY: mg tracking** — add `mgPerUnit: v.optional(v.number())` to schema. If set, show stock as "30 caps / 9,000mg". Add mgPerUnit field to edit modal.

- [ ] **SUPPLY: Update DEFAULT_SUPPLY** — change all items to use `unitsPerWeek` with correct weekly usage values. Add `vendors` arrays with real vendor data. Add all 50 new items listed below.

  New items to add: NAC (N-Acetyl Cysteine) 2000mg/day, R-Lipoic Acid, Vitamin C 2000mg/day, EPA Omega 3 Fish Oil, TUDCA 500mg/day, Black Seed Oil, Ubiquinol CoQ10, Nattokinase, Carditone, Aged Garlic Extract, Tadalafil (Cialis 5mg daily), Nobiletin, Ginkgo Biloba 120mg/day, Huperzine A (cycle 2x/week), Lion's Mane 1g/day, Glycine 3g/day, Magnesium L-Threonate, Psyllium Husk (pre-meal), Tongkat Ali, L-Theanine 400mg, Mucuna Pruriens (2x/week max), L-Tyrosine 500mg/day, Rhodiola Rosea, Bacopa Monnieri (Cognance), 4-DMA-78-DHF, Betaine Anhydrous 2.5g (lift days), Glycerol Monostearate (lift days), L-Citrulline 8g (lift days), Methylene Blue (as needed), Betaine HCL, L-Glutamine 15g/day, Digestive Enzymes, Vitamin D3 5000IU/day, Vitamin K2 MK-7, Zinc 30mg/day, Boron 3mg/day, Ashwagandha KSM-66, Berberine 500mg 2x/day, NMN 500mg/day, Pterostilbene, Resveratrol, Melatonin 0.3mg, GABA, Phosphatidylserine 300mg/day, Acetyl-L-Carnitine ALCAR, L-Carnitine L-Tartrate LCLT, Collagen Peptides 20g/day, Electrolyte Mix.
  
  For each new item use sensible vendor data from known sources (Nootropics Depot, Amazon/NOW, Bulk Supplements, Life Extension, Double Wood, etc.)

- [ ] **SCHEDULE: "▶ Run Today" button** — Add button at top of Schedule tab. On click: check if `dailyRun` exists for today in Convex. If not, save schedule blocks to `dailyLogs.dailyRun`. If already set, show confirm modal "Today's protocol already set. Start over?" with Cancel/Start Over. Show success toast "✓ Today's protocol loaded".

- [ ] **Convex schema: dailyRun field** — Add `dailyRun: v.optional(v.array(v.object({time:v.string(), label:v.string(), type:v.string(), items:v.array(v.string()), note:v.optional(v.string()), macros:v.optional(v.string()), duration:v.optional(v.string())})))` to `dailyLogs` table.

- [ ] **Convex mutations: saveDailyRun + getDailyRun** — Add `saveDailyRun({date, blocks})` mutation and `getDailyRun({date})` query to protocol.ts.

- [ ] **MAINTENANCE TAB: Import from Stacks** — Add "+ Import from Stacks" button that opens modal listing all stacks from STACKS tab. User selects one → all items imported as maintenance entries. Add "+ Import from Schedule" button to pull all supplement items from current schedule into maintenance.

- [ ] **MAINTENANCE TAB: Delete button** — Ensure each maintenance item has a ✕ delete button. Deleting from maintenance does NOT affect stacks/reference data.

- [ ] **LOG TAB: New tab** — Add "LOG" tab (after SUPPLY, before CYCLES). Shows:
  - Today's loaded protocol (the dailyRun blocks) in same visual style as SCHEDULE but read-only with checkboxes
  - Daily metrics (weight, feeling, lift/ruck done) same as TRACK tab
  - "No protocol loaded yet — go to Schedule and click Run Today" if empty

- [ ] **LOG TAB: History / Substance Search** — Section within LOG tab:
  - Search input: type substance name
  - Shows 90-day calendar heatmap: each day cell colored gray (no data), dim green (logged but not done), bright green (done)
  - Below calendar: recent use list with dates
  - Streak display: "Current streak: X days" and "Best streak: X days"
  - Convex query `getSubstanceHistory({substanceName})` → scans checks table for last 90 days

- [ ] **Deploy** — Run `npx convex deploy --yes` then `npx vercel --prod` after all changes.

- [ ] **Git commit** — Commit all changes with message "feat: vendors, mg tracking, Run Today, Log tab, History heatmap, 50 new supply items"
