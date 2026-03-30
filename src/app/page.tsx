"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// ─── SCHEDULE DATA ───
const RESET_LIFT = [
  { time:"5:15 AM",label:"WAKE",type:"supplement",items:["Pinealon 1mg — oral, fasted","Alpha-GPC 600mg","Bromantane 100mg — sublingual","BPC-157 500mcg — oral","9-me-BC 20mg","Semax 300mcg — nasal spray","Selank 250mcg — nasal spray","Thiamine HCL 300–600mg","Magnesium Glycinate 200mg","Creatine 10g"],note:"Chroma Golden Glo glasses ON"},
  { time:"5:20 AM",label:"PRE-LIFT SNACK",type:"meal",items:["1 banana + 1 tbsp honey","OR rice cake + honey","Quick carbs only — ~45g carb"]},
  { time:"5:30 AM",label:"LIFT",type:"training",items:["Heavy compounds","Intra-workout: 1 scoop intra carb (156 cal, 39g carb)"],duration:"60 min"},
  { time:"6:30 AM",label:"RUCK",type:"training",items:["20–30 lbs plate carrier","Neighborhood walk — catch sunrise"],note:"Golden Glo OFF — real sunlight now",duration:"30 min"},
  { time:"7:15 AM",label:"MEAL 1 — OATMEAL BOWL",type:"meal",items:["175g cooked oats","45g custom protein blend","14g pumpkin seeds","30g banana + 37g blueberries","240g unsweetened almond milk","12oz orange juice"],macros:"711 cal · 47g P · 97g C · 14g F"},
  { time:"7:15 AM",label:"SUPPLEMENTS — ROUND 2",type:"supplement",items:["Cordyceps 1000mg","Polygala Tenuifolia 100mg","Agmatine Sulfate 750mg"]},
  { time:"10:00 AM",label:"BPC-157",type:"supplement",items:["BPC-157 500mcg — oral"]},
  { time:"12:00 PM",label:"MEAL 2 — CHICKEN & RICE",type:"meal",items:["6oz chicken breast (170g)","1 cup jasmine rice (158g)","1 cup mixed vegetables (160g)","½ avocado (75g)"],macros:"690 cal · 63g P · 56g C · 19g F"},
  { time:"1:30 PM",label:"SUPPLEMENTS — ROUND 3",type:"supplement",items:["BPC-157 500mcg — oral","Semax 300mcg — nasal spray","Selank 250mcg — nasal spray","Cordyceps 1000mg","Polygala Tenuifolia 100mg","Agmatine Sulfate 750mg"],note:"Last Semax dose — do not dose after 3 PM"},
  { time:"5:30 PM",label:"MEAL 3 — STEAK & POTATO",type:"meal",items:["6oz sirloin steak (170g)","8oz white potato (227g)","1 cup mixed vegetables (160g)"],macros:"648 cal · 60g P · 54g C · 17g F"},
  { time:"6:00 PM",label:"BPC-157",type:"supplement",items:["BPC-157 500mcg — oral"]},
  { time:"8:00 PM",label:"RETA INJECTION (Mon/Wed/Fri)",type:"supplement",items:["Retatrutide ~1.33mg SubQ — evening injection","4mg/week split across 3 doses"],note:"Skip on Tue/Thu/Sat/Sun"},
  { time:"SUNSET",label:"EVENING WIND-DOWN",type:"supplement",items:["Polygala Tenuifolia 100mg"],note:"Chroma Nightshades ON"},
  { time:"10:00 PM",label:"BEFORE BED",type:"supplement",items:["Triacetyluridine 25mg","GH 2 IU — SubQ daily","GHK-Cu 2mg — SubQ (Mon–Fri only)"],note:"Lights out by 10:15 PM"},
];
const RESET_RUCK = [
  { time:"6:00 AM",label:"WAKE",type:"supplement",items:["Pinealon 1mg — oral, fasted","Citicoline 500mg (not Alpha-GPC)","Bromantane 100mg — sublingual","BPC-157 500mcg — oral","9-me-BC 20mg","Semax 300mcg — nasal spray","Selank 250mcg — nasal spray","Thiamine HCL 300–600mg","Magnesium Glycinate 200mg","Creatine 10g"],note:"No glasses — heading straight outside"},
  { time:"6:15 AM",label:"FASTED RUCK",type:"training",items:["20–30 lbs plate carrier","Neighborhood walk — sunrise exposure","Fully fasted — max fat oxidation"],duration:"30 min"},
  { time:"7:00 AM",label:"MEAL 1 — OATMEAL BOWL",type:"meal",items:["175g cooked oats","45g custom protein blend","14g pumpkin seeds","30g banana + 37g blueberries","240g unsweetened almond milk","NO orange juice on rest days"],macros:"544 cal · 45g P · 58g C · 14g F"},
  { time:"7:15 AM",label:"SUPPLEMENTS — ROUND 2",type:"supplement",items:["Cordyceps 1000mg","Polygala Tenuifolia 100mg","Agmatine Sulfate 750mg"]},
  { time:"10:00 AM",label:"BPC-157",type:"supplement",items:["BPC-157 500mcg — oral"]},
  { time:"12:00 PM",label:"MEAL 2 — CHICKEN & RICE",type:"meal",items:["6oz chicken breast (170g)","1 cup jasmine rice (158g)","1 cup mixed vegetables (160g)","½ avocado (75g)"],macros:"690 cal · 63g P · 56g C · 19g F"},
  { time:"1:30 PM",label:"SUPPLEMENTS — ROUND 3",type:"supplement",items:["BPC-157 500mcg — oral","Semax 300mcg — nasal spray","Selank 250mcg — nasal spray","Cordyceps 1000mg","Polygala Tenuifolia 100mg","Agmatine Sulfate 750mg"],note:"Last Semax dose — do not dose after 3 PM"},
  { time:"5:30 PM",label:"MEAL 3 — STEAK & POTATO",type:"meal",items:["6oz sirloin steak (170g)","8oz white potato (227g)","1 cup mixed vegetables (160g)"],macros:"648 cal · 60g P · 54g C · 17g F"},
  { time:"6:00 PM",label:"BPC-157",type:"supplement",items:["BPC-157 500mcg — oral"]},
  { time:"8:00 PM",label:"RETA INJECTION (Mon/Wed/Fri)",type:"supplement",items:["Retatrutide ~1.33mg SubQ — evening injection","4mg/week split across 3 doses"],note:"Skip on Tue/Thu/Sat/Sun"},
  { time:"SUNSET",label:"EVENING WIND-DOWN",type:"supplement",items:["Polygala Tenuifolia 100mg"],note:"Chroma Nightshades ON"},
  { time:"10:00 PM",label:"BEFORE BED",type:"supplement",items:["Triacetyluridine 25mg","GH 2 IU — SubQ daily","GHK-Cu 2mg — SubQ (Mon–Fri only)"],note:"Lights out by 10:15 PM"},
];
const POST_LIFT = [
  { time:"5:15 AM",label:"WAKE — ALL SUPPLEMENTS",type:"supplement",items:["Pinealon 1mg — oral, fasted","Alpha-GPC 600mg","Bromantane 100mg — sublingual","Semax 300mcg — nasal spray","Selank 250mcg — nasal spray","Thiamine HCL 300–600mg","Magnesium Glycinate 400mg","Creatine 10g","Cordyceps 2000mg","Polygala Tenuifolia 300mg"],note:"Chroma Golden Glo ON · Everything once, AM only"},
  { time:"5:15 AM",label:"FOCUS BOOST (AS NEEDED)",type:"focus",items:["Sabroxy — deep work days only","Dynamine — deep work days only","Max 2–3x per week, not daily"],note:"For deep work blocks only"},
  { time:"5:20 AM",label:"PRE-LIFT SNACK",type:"meal",items:["1 banana + 1 tbsp honey","OR rice cake + honey","Quick carbs only — ~45g carb"]},
  { time:"5:30 AM",label:"LIFT",type:"training",items:["Heavy compounds","Intra-workout: 1 scoop intra carb (156 cal, 39g carb)"],duration:"60 min"},
  { time:"6:30 AM",label:"RUCK",type:"training",items:["20–30 lbs plate carrier","Neighborhood walk — catch sunrise"],note:"Golden Glo OFF — real sunlight now",duration:"30 min"},
  { time:"7:15 AM",label:"MEAL 1 — OATMEAL BOWL",type:"meal",items:["175g cooked oats","45g custom protein blend","14g pumpkin seeds","30g banana + 37g blueberries","240g unsweetened almond milk","12oz orange juice"],macros:"711 cal · 47g P · 97g C · 14g F"},
  { time:"12:00 PM",label:"MEAL 2 — CHICKEN & RICE",type:"meal",items:["6oz chicken breast (170g)","1 cup jasmine rice (158g)","1 cup mixed vegetables (160g)","½ avocado (75g)"],macros:"690 cal · 63g P · 56g C · 19g F"},
  { time:"5:30 PM",label:"MEAL 3 — STEAK & POTATO",type:"meal",items:["6oz sirloin steak (170g)","8oz white potato (227g)","1 cup mixed vegetables (160g)"],macros:"648 cal · 60g P · 54g C · 17g F"},
  { time:"8:00 PM",label:"RETA INJECTION (Mon/Wed/Fri)",type:"supplement",items:["Retatrutide ~1.33mg SubQ — evening injection","4mg/week split across 3 doses"],note:"Skip on Tue/Thu/Sat/Sun"},
  { time:"SUNSET",label:"NIGHTSHADES ON",type:"supplement",items:["Chroma Nightshades ON"]},
  { time:"10:00 PM",label:"BEFORE BED",type:"supplement",items:["Triacetyluridine 25mg","GH 2 IU — SubQ daily","GHK-Cu 2mg — SubQ (Mon–Fri only)"],note:"Lights out by 10:15 PM"},
];
const POST_RUCK = [
  { time:"6:00 AM",label:"WAKE — ALL SUPPLEMENTS",type:"supplement",items:["Pinealon 1mg — oral, fasted","Citicoline 500mg (not Alpha-GPC)","Bromantane 100mg — sublingual","Semax 300mcg — nasal spray","Selank 250mcg — nasal spray","Thiamine HCL 300–600mg","Magnesium Glycinate 400mg","Creatine 10g","Cordyceps 2000mg","Polygala Tenuifolia 300mg","Agmatine Sulfate 1500mg"],note:"No glasses — heading straight outside · Everything once, AM only"},
  { time:"6:15 AM",label:"FASTED RUCK",type:"training",items:["20–30 lbs plate carrier","Neighborhood walk — sunrise exposure","Fully fasted — max fat oxidation"],duration:"30 min"},
  { time:"7:00 AM",label:"MEAL 1 — OATMEAL BOWL",type:"meal",items:["175g cooked oats","45g custom protein blend","14g pumpkin seeds","30g banana + 37g blueberries","240g unsweetened almond milk","NO orange juice on rest days"],macros:"544 cal · 45g P · 58g C · 14g F"},
  { time:"12:00 PM",label:"MEAL 2 — CHICKEN & RICE",type:"meal",items:["6oz chicken breast (170g)","1 cup jasmine rice (158g)","1 cup mixed vegetables (160g)","½ avocado (75g)"],macros:"690 cal · 63g P · 56g C · 19g F"},
  { time:"5:30 PM",label:"MEAL 3 — STEAK & POTATO",type:"meal",items:["6oz sirloin steak (170g)","8oz white potato (227g)","1 cup mixed vegetables (160g)"],macros:"648 cal · 60g P · 54g C · 17g F"},
  { time:"8:00 PM",label:"RETA INJECTION (Mon/Wed/Fri)",type:"supplement",items:["Retatrutide ~1.33mg SubQ — evening injection","4mg/week split across 3 doses"],note:"Skip on Tue/Thu/Sat/Sun"},
  { time:"SUNSET",label:"NIGHTSHADES ON",type:"supplement",items:["Chroma Nightshades ON"]},
  { time:"10:00 PM",label:"BEFORE BED",type:"supplement",items:["Triacetyluridine 25mg","GH 2 IU — SubQ daily","GHK-Cu 2mg — SubQ (Mon–Fri only)"],note:"Lights out by 10:15 PM"},
];
const WEEKLY = [
  {day:"Mon",type:"lift",reta:true,gh:true,ghk:true},
  {day:"Tue",type:"lift",reta:false,gh:true,ghk:true},
  {day:"Wed",type:"ruck",reta:true,gh:true,ghk:true},
  {day:"Thu",type:"lift",reta:false,gh:true,ghk:true},
  {day:"Fri",type:"lift",reta:true,gh:true,ghk:true},
  {day:"Sat",type:"ruck",reta:false,gh:true,ghk:false},
  {day:"Sun",type:"ruck",reta:false,gh:true,ghk:false},
];
const RESET_RULES=["Hit 170g protein every day regardless of appetite","Reta days (Mon/Thu) — front-load protein, shrink carbs never protein","Under 5 hrs sleep — skip lift, just ruck","Ruck every day, no exceptions. 30 min outside.","No music, no podcasts — silence during cardio & ruck","Phone on Downtime 10PM–8AM. No apps, no scrolling.","1–2 hrs max controlled fun per day. No aimless browsing.","Nightshades ON at sunset, not a clock time","Cycle 9-me-BC: 4 weeks on then STOP","Fat floor is 50g — bump to 65g when possible","Golden Glo in gym only — OFF when you step outside","Wed fast optional: last meal Tue 6PM → break Wed 6PM"];
const POST_RULES=["Hit 170g protein every day regardless of appetite","Reta days (Mon/Thu) — front-load protein, shrink carbs never protein","Under 5 hrs sleep — skip lift, just ruck","Ruck every day, no exceptions. 30 min outside.","Sabroxy + Dynamine max 2–3x/week — deep work days only","If reaching for focus stack daily, systems are broken not your brain","Nightshades ON at sunset, not a clock time","Cycle Cordyceps & Polygala: 8 weeks on, 2 off","Bromantane stays daily — low tolerance risk","9-me-BC is DONE — 2-week break minimum before any re-run","Fat floor is 50g — bump to 65g when possible","Golden Glo in gym only — OFF when you step outside"];

// ─── CYCLED SUBSTANCES ───
const CYCLED_SUBSTANCES = [
  {name:"9-me-BC",color:"#6f8fcf",onWeeks:4,offWeeks:null,rule:"4 wks ON → STOP (min 2 wk break)",note:"Dopamine neurogenesis. Full stop after reset cycle."},
  {name:"Cordyceps",color:"#6fcfcf",onWeeks:8,offWeeks:2,rule:"8 wks ON / 2 wks OFF",note:"Mushroom adaptogen. Cycle with Polygala/Agmatine."},
  {name:"Polygala Tenuifolia",color:"#cf6fcf",onWeeks:8,offWeeks:2,rule:"8 wks ON / 2 wks OFF",note:"BDNF enhancer. Same cycle as Cordyceps."},
  {name:"Agmatine Sulfate",color:"#cfcf6f",onWeeks:8,offWeeks:2,rule:"8 wks ON / 2 wks OFF",note:"NMDA modulator. Cycle alongside Cordyceps/Polygala."},
  {name:"BPC-157",color:"#6fcf6f",onWeeks:4,offWeeks:null,rule:"Reset phase only (4 wks)",note:"Peptide repair protocol. Drops off at maintenance."},
  {name:"Alpha-GPC",color:"#cfb86f",onWeeks:null,offWeeks:null,rule:"Lift days only (cycle with Citicoline)",note:"Depletes choline stores. Citicoline on rest/ruck days."},
  {name:"Sabroxy",color:"#cf6fcf",onWeeks:null,offWeeks:null,rule:"Max 2–3x/week (maintenance only)",note:"On-demand deep work. Never daily."},
];

// ─── MAINTENANCE SUBSTANCES ───
const MAINTENANCE_SUBSTANCES = [
  {name:"Bromantane",color:"#6f8fcf",note:"Daily, low tolerance risk. Stays in indefinitely."},
  {name:"Semax",color:"#6fcf6f",note:"Daily AM. Max 2 doses on reset."},
  {name:"Selank",color:"#6fcf6f",note:"Daily AM. Max 2 doses on reset."},
  {name:"Thiamine HCL",color:"#cf8f6f",note:"Daily AM. 300–600mg."},
  {name:"Magnesium Glycinate",color:"#8f8fcf",note:"Daily AM. 400mg maintenance."},
  {name:"Creatine",color:"#cfcf6f",note:"Daily 10g. All at once AM."},
  {name:"Triacetyluridine",color:"#6f8fcf",note:"Daily before bed. 25mg."},
  {name:"GH",color:"#6fcf6f",note:"2 IU SubQ daily before bed."},
  {name:"GHK-Cu",color:"#8f8fcf",note:"2mg SubQ Mon–Fri before bed. Skip weekends."},
  {name:"Retatrutide",color:"#cf6f6f",note:"~1.33mg SubQ Mon/Wed/Fri evening. 4mg/week total."},
  {name:"Pinealon",color:"#cf6fcf",note:"1mg oral fasted AM."},
];

// ─── DEFAULT SUPPLY DATA ───
const DEFAULT_SUPPLY = [
  {id:"pinealon",name:"Pinealon",cat:"peptide",color:"#cf6fcf",supplier:"Peptide vendor",supplierUrl:"",costPerOrder:45,unitsPerOrder:30,currentUnits:30,unitsPerDay:1,unitLabel:"doses",notes:"1mg per dose, fasted AM"},
  {id:"alpha-gpc",name:"Alpha-GPC",cat:"choline",color:"#cfb86f",supplier:"Amazon / ND",supplierUrl:"",costPerOrder:19,unitsPerOrder:60,currentUnits:60,unitsPerDay:0.57,unitLabel:"caps",notes:"600mg caps, lift days only (4x/week avg)"},
  {id:"citicoline",name:"Citicoline (CDP-Choline)",cat:"choline",color:"#cfb86f",supplier:"Nootropics Depot",supplierUrl:"https://nootropicsdepot.com",costPerOrder:64.99,unitsPerOrder:180,currentUnits:180,unitsPerDay:0.43,unitLabel:"caps",notes:"500mg caps, ruck/rest days only (3x/week avg)"},
  {id:"bromantane",name:"Bromantane",cat:"nootropic",color:"#6f8fcf",supplier:"Nootropic Source",supplierUrl:"",costPerOrder:30,unitsPerOrder:20,currentUnits:20,unitsPerDay:1,unitLabel:"doses",notes:"100mg/dose from 2g powder. Weigh with Gemini-20 scale."},
  {id:"bpc157",name:"BPC-157",cat:"peptide",color:"#6fcf6f",supplier:"Peptide vendor",supplierUrl:"",costPerOrder:40,unitsPerOrder:20,currentUnits:0,unitsPerDay:0,unitLabel:"doses",notes:"500mcg/dose oral. Reset phase only (4 doses/day x 4 weeks)."},
  {id:"9mebc",name:"9-me-BC",cat:"nootropic",color:"#6f8fcf",supplier:"Nootropic vendor",supplierUrl:"",costPerOrder:25,unitsPerOrder:25,currentUnits:0,unitsPerDay:0,unitLabel:"doses",notes:"20mg/dose. Reset phase only (4 weeks max then stop)."},
  {id:"semax",name:"Semax",cat:"peptide",color:"#6fcf6f",supplier:"Peptide vendor",supplierUrl:"",costPerOrder:40,unitsPerOrder:16,currentUnits:16,unitsPerDay:1,unitLabel:"doses",notes:"300mcg/dose nasal. 5mg vial + 2.5ml bac water = ~16 doses at 300mcg."},
  {id:"selank",name:"Selank",cat:"peptide",color:"#6fcf6f",supplier:"Peptide vendor",supplierUrl:"",costPerOrder:40,unitsPerOrder:20,currentUnits:20,unitsPerDay:1,unitLabel:"doses",notes:"250mcg/dose nasal. 5mg vial + 2.5ml bac water = ~20 doses at 250mcg."},
  {id:"thiamine",name:"Thiamine HCL",cat:"vitamin",color:"#cf8f6f",supplier:"Amazon / NOW",supplierUrl:"",costPerOrder:15,unitsPerOrder:100,currentUnits:100,unitsPerDay:1,unitLabel:"caps",notes:"500mg caps. Daily AM."},
  {id:"magglycinate",name:"Magnesium Glycinate",cat:"mineral",color:"#8f8fcf",supplier:"Various",supplierUrl:"",costPerOrder:15,unitsPerOrder:120,currentUnits:120,unitsPerDay:1,unitLabel:"caps",notes:"400mg caps. Daily AM."},
  {id:"creatine",name:"Creatine Monohydrate",cat:"amino",color:"#cfcf6f",supplier:"Various",supplierUrl:"",costPerOrder:25,unitsPerOrder:50,currentUnits:50,unitsPerDay:1,unitLabel:"servings",notes:"10g/serving. Daily AM all at once."},
  {id:"cordyceps",name:"Cordyceps",cat:"mushroom",color:"#6fcfcf",supplier:"Various",supplierUrl:"",costPerOrder:30,unitsPerOrder:30,currentUnits:30,unitsPerDay:1,unitLabel:"days",notes:"2000mg/day maintenance (2x 1000mg). Cycle 8wks on / 2 wks off."},
  {id:"polygala",name:"Polygala Tenuifolia",cat:"herb",color:"#cf6fcf",supplier:"Nootropics Depot",supplierUrl:"https://nootropicsdepot.com",costPerOrder:29.99,unitsPerOrder:60,currentUnits:60,unitsPerDay:1,unitLabel:"days",notes:"300mg/day maintenance (3x 100mg caps). Cycle 8wks on / 2 wks off."},
  {id:"agmatine",name:"Agmatine Sulfate",cat:"amino",color:"#cfcf6f",supplier:"Various (bulk powder)",supplierUrl:"",costPerOrder:20,unitsPerOrder:167,currentUnits:167,unitsPerDay:1,unitLabel:"doses",notes:"750mg–1500mg/day. 250g powder ÷ 1.5g/day ≈ 167 days."},
  {id:"tau",name:"Triacetyluridine",cat:"nootropic",color:"#6f8fcf",supplier:"Nootropics Depot",supplierUrl:"https://nootropicsdepot.com",costPerOrder:30,unitsPerOrder:30,currentUnits:30,unitsPerDay:1,unitLabel:"caps",notes:"25mg caps. Daily before bed."},
  {id:"reta",name:"Retatrutide",cat:"peptide",color:"#cf6f6f",supplier:"Peptide vendor",supplierUrl:"",costPerOrder:80,unitsPerOrder:2.5,currentUnits:2.5,unitsPerDay:0.43,unitLabel:"weeks",notes:"4mg/week total split 3x. 10mg vial = 2.5 weeks supply."},
  {id:"gh",name:"GH (Growth Hormone)",cat:"peptide",color:"#6fcf6f",supplier:"Rx / compounding pharmacy",supplierUrl:"",costPerOrder:150,unitsPerOrder:30,currentUnits:30,unitsPerDay:1,unitLabel:"days",notes:"2 IU SubQ daily before bed. Cost varies by Rx source."},
  {id:"ghkcu",name:"GHK-Cu",cat:"peptide",color:"#8f8fcf",supplier:"Peptide vendor",supplierUrl:"",costPerOrder:50,unitsPerOrder:14,currentUnits:14,unitsPerDay:0.71,unitLabel:"doses",notes:"2mg SubQ Mon–Fri. 10mg vial ÷ 2mg/dose = 5 doses = ~7 days at 5x/week."},
  {id:"sabroxy",name:"Sabroxy",cat:"focus",color:"#cf6fcf",supplier:"Nootropics Depot",supplierUrl:"https://nootropicsdepot.com",costPerOrder:39.99,unitsPerOrder:180,currentUnits:180,unitsPerDay:0.36,unitLabel:"caps",notes:"200mg caps. 2–3x/week max on deep work days only."},
  {id:"dynamine",name:"Dynamine",cat:"focus",color:"#cf6fcf",supplier:"Various",supplierUrl:"",costPerOrder:30,unitsPerOrder:60,currentUnits:60,unitsPerDay:0.36,unitLabel:"caps",notes:"Per label. 2–3x/week max alongside Sabroxy."},
  // ─── NEW ───
  {id:"lcarnitine",name:"L-Carnitine",cat:"amino",color:"#cfb86f",supplier:"Various",supplierUrl:"",costPerOrder:20,unitsPerOrder:40,currentUnits:40,unitsPerDay:1,unitLabel:"servings",notes:"2–4g/serving fasted AM or pre-cardio. Builds in tissue over 2–3 weeks of daily use."},
  {id:"pump-blend",name:"Pump Blend (Pre-Workout)",cat:"blend",color:"#cf6f8f",supplier:"Various / bulk",supplierUrl:"",costPerOrder:35,unitsPerOrder:30,currentUnits:30,unitsPerDay:1,unitLabel:"servings",notes:"L-Citrulline 6–10g + Agmatine 750mg + Betaine 2.5g + Glycerol 2g + salt. Mix custom or buy pre-made. Lift days only."},
  {id:"5amino1mq",name:"5-Amino-1MQ",cat:"metabolic",color:"#6fcf6f",supplier:"Peptide vendor",supplierUrl:"",costPerOrder:50,unitsPerOrder:60,currentUnits:0,unitsPerDay:1,unitLabel:"caps",notes:"20–50mg caps 1–2x/day with food. Cycle 8 wks on / 4 wks off. NNMT inhibitor — metabolic + NAD+ activation."},
  {id:"motsc",name:"MOTS-c",cat:"peptide",color:"#8f6fcf",supplier:"Peptide vendor",supplierUrl:"",costPerOrder:60,unitsPerOrder:3,currentUnits:0,unitsPerDay:0.43,unitLabel:"doses",notes:"5–10mg SubQ 2–3x/week fasted AM pre-exercise. 10mg vial ÷ 10mg/dose = 1 dose/vial, or split into 5mg doses = 2 doses. Store in fridge."},
];

// ─── SUPPLEMENT STACKS (reference) ───
const REF_STACKS=[
  {name:"ADDERALL STACK (FOCUS)",color:"#cf6fcf",items:[
    {name:"Sabroxy (10% Oroxylin A)",dose:"100–500mg",freq:"Up to 2x/day",source:"Nootropics Depot",price:"$39.99/180ct",what:"Dopamine reuptake inhibitor — natural Ritalin analog"},
    {name:"Polygala Tenuifolia 20:1",dose:"100mg sublingual",freq:"Up to 3x/day",source:"Nootropics Depot",price:"$29.99/180ct",what:"BDNF enhancer, dopamine potentiator"},
    {name:"4'-DMA-7,8-DHF",dose:"10mg sublingual",freq:"Daily",source:"Nootropics Depot",price:"$74.99/90ct",what:"TrkB agonist — mimics BDNF signaling"},
    {name:"Cognance (Enhanced Bacopa)",dose:"200mg",freq:"Daily",source:"Nootropics Depot",price:"$69.99/180ct",what:"Acetylcholine optimization, memory consolidation"},
    {name:"CDP Choline (Citicoline)",dose:"250mg",freq:"Up to 2x/day",source:"Nootropics Depot",price:"$64.99/180ct",what:"Choline + cytidine for acetylcholine and membrane repair"},
  ]},
  {name:"ANTI-INFLAMMATION STACK",color:"#6fcf6f",items:[
    {name:"NAC (N-Acetyl Cysteine)",dose:"600–1000mg",freq:"2x/day",source:"Walmart/NOW",price:"$34.99/180ct",what:"Glutathione precursor, liver detox, mucolytic"},
    {name:"R-Lipoic Acid",dose:"240–480mg",freq:"2x/day",source:"Life Extension",price:"$52.37/90ct",what:"Mitochondrial antioxidant, blood sugar regulation"},
    {name:"Vitamin C",dose:"1000mg",freq:"2x/day",source:"Walmart/NOW",price:"$19.99/250ct",what:"Immune support, collagen synthesis, antioxidant"},
    {name:"EPA Omega 3 (Fish Oil)",dose:"1–5g",freq:"2x/day",source:"Nordic Naturals liquid",price:"$22.06/8oz",what:"Anti-inflammatory, cardiovascular, brain health"},
    {name:"TUDCA",dose:"250mg",freq:"2x/day",source:"Double Wood",price:"$27.97/60ct",what:"Bile acid, liver protection, ER stress reduction"},
    {name:"Black Seed Oil",dose:"1 Tbsp",freq:"2x/day",source:"Grimm's Apothecary",price:"$29.99",what:"Thymoquinone — anti-inflammatory, immune modulator"},
    {name:"Magnesium",dose:"300–500mg",freq:"With each meal",source:"Various",price:"~$10–15",what:"300+ enzyme reactions, sleep, muscle, nerve function"},
  ]},
  {name:"HEART HEALTH STACK",color:"#cf6f6f",items:[
    {name:"Ubiquinol CoQ10",dose:"Per label",freq:"Daily",source:"Jarrow Formulas",price:"~$30",what:"Mitochondrial electron transport, heart energy"},
    {name:"Nattokinase",dose:"8–10k FU/day",freq:"4k AM + 4k PM",source:"Doctor's Best",price:"~$20",what:"Fibrinolytic enzyme — breaks down blood clots"},
    {name:"Carditone",dose:"Per label",freq:"Daily",source:"Ayush Herbs",price:"~$30",what:"Ayurvedic BP support — rauwolfia + magnesium"},
    {name:"Aged Garlic Extract",dose:"Per label",freq:"Daily",source:"Kyolic",price:"~$15",what:"BP reduction, arterial flexibility"},
    {name:"Magnesium Glycinate",dose:"Per label",freq:"1–2 servings/meal",source:"Various",price:"~$12",what:"Lowers BP significantly, best absorbed form"},
    {name:"Cialis (Tadalafil)",dose:"5mg",freq:"Daily",source:"Rx",price:"Varies",what:"PDE5 inhibitor — vascular health, BP support"},
  ]},
  {name:"MEMORY STACK",color:"#cfb86f",items:[
    {name:"Nobiletin",dose:"Per label",freq:"Daily",source:"Nootropics Depot",price:"$20",what:"Citrus flavonoid — circadian clock modulator, neuroprotective"},
    {name:"Ginkgo Biloba",dose:"120mg",freq:"Daily",source:"Walmart/NOW",price:"$10",what:"Cerebral blood flow, antioxidant"},
    {name:"Huperzine A",dose:"Per label",freq:"Daily",source:"Various",price:"$22",what:"Acetylcholinesterase inhibitor — boosts ACh levels"},
    {name:"Lion's Mane Extract",dose:"Per label",freq:"Daily",source:"Various",price:"~$20",what:"NGF stimulation, neurogenesis"},
    {name:"Glycine",dose:"Per label",freq:"Daily",source:"Various",price:"$10",what:"Inhibitory neurotransmitter, sleep quality, collagen"},
    {name:"Magnesium L-Threonate",dose:"Per label",freq:"Daily",source:"Various",price:"$15",what:"Crosses BBB — brain magnesium, synaptic density"},
  ]},
  {name:"WEIGHT LOSS STACK",color:"#6fcfcf",items:[
    {name:"Retatrutide",dose:"2mg SubQ",freq:"3x/week",source:"Peptide vendor",price:"Varies",what:"Triple agonist GLP-1/GIP/glucagon — appetite + metabolic"},
    {name:"Psyllium Husk",dose:"5–10g in 1L water",freq:"15 min before meals",source:"Walmart",price:"~$10",what:"Soluble fiber — satiety, glucose buffering"},
    {name:"L-Carnitine",dose:"4g",freq:"AM",source:"Various",price:"~$15",what:"Fatty acid transport into mitochondria"},
    {name:"Tongkat Ali",dose:"Per label",freq:"Daily",source:"Nootropics Depot",price:"~$20",what:"Testosterone, cortisol modulation"},
  ]},
  {name:"CHOLINERGIC — Memory & Focus",color:"#6fcfcf",items:[
    {name:"CDP-Choline (Citicoline)",dose:"250–1000mg",freq:"Daily driver",source:"Nootropics Depot",price:"$64.99/180ct",what:"Choline source — increases choline stores for improved cognition."},
    {name:"Alpha-GPC",dose:"300–1200mg",freq:"1–2x/week (depletes stores)",source:"Amazon/ND",price:"~$19",what:"Choline source + release. Depletes natural stores — cycle."},
    {name:"Huperzine A",dose:"100–400mcg",freq:"Cycle",source:"Various",price:"~$22",what:"Strongest OTC acetylcholinesterase inhibitor"},
    {name:"Bacopa Monnieri",dose:"Per label",freq:"Daily",source:"ND (Cognance)",price:"$69.99",what:"AChE inhibitor — anti-inflammatory in brain"},
    {name:"Nicotine",dose:"1–9mg",freq:"As needed",source:"Zyn",price:"~$5",what:"Cholinergic + dopaminergic. Acute focus."},
  ]},
  {name:"DOPAMINERGIC — Drive & Motivation",color:"#cf6fcf",items:[
    {name:"Mucuna Pruriens",dose:"100–800mg",freq:"2x/week max",source:"ND",price:"~$15",what:"L-DOPA source — direct dopamine precursor. Tolerance builds fast."},
    {name:"L-Tyrosine",dose:"500–5000mg",freq:"Daily OK",source:"Amazon",price:"$10",what:"Building blocks for dopamine. Can use everyday."},
    {name:"Caffeine",dose:"50–400mg",freq:"Daily",source:"Coffee/pills",price:"Cheap",what:"Adenosine antagonist, indirect dopamine boost"},
    {name:"DMAA",dose:"10–100mg",freq:"2x/week MAX",source:"Various",price:"~$20",what:"Extremely potent stimulant — euphoric, focused, unreal energy. Limit use."},
  ]},
  {name:"COMBO: Computer Work / Study",color:"#6f8fcf",items:[
    {name:"Caffeine",dose:"200mg",freq:"Stack",source:"",price:"",what:""},
    {name:"L-Theanine",dose:"400mg",freq:"Stack",source:"",price:"",what:""},
    {name:"CDP-Choline",dose:"250mg",freq:"Stack",source:"",price:"",what:""},
    {name:"Huperzine A",dose:"200mcg",freq:"Stack",source:"",price:"",what:""},
    {name:"Rhodiola",dose:"500mg",freq:"Stack",source:"",price:"",what:""},
  ]},
  {name:"COMBO: Nuclear Workday (2x/week MAX)",color:"#cf6f6f",items:[
    {name:"CDP-Choline",dose:"500mg",freq:"Stack",source:"",price:"",what:""},
    {name:"Alpha-GPC",dose:"600mg",freq:"Stack",source:"",price:"",what:""},
    {name:"Caffeine",dose:"400mg",freq:"Stack",source:"",price:"",what:""},
    {name:"L-Tyrosine",dose:"5000mg",freq:"Stack",source:"",price:"",what:""},
    {name:"L-Theanine",dose:"400–800mg",freq:"Stack",source:"",price:"",what:""},
    {name:"Huperzine A",dose:"400mcg",freq:"Stack",source:"",price:"",what:""},
    {name:"Methylene Blue",dose:"5–10mg",freq:"Stack",source:"",price:"",what:""},
  ]},
  {name:"COMBO: PR Day (1–2x/week)",color:"#cf8f6f",items:[
    {name:"Caffeine",dose:"300mg",freq:"Stack",source:"",price:"",what:""},
    {name:"DMAA",dose:"25mg",freq:"Stack",source:"",price:"",what:"Limit use"},
    {name:"L-Tyrosine",dose:"5000mg",freq:"Stack",source:"",price:"",what:""},
    {name:"Alpha-GPC",dose:"1000mg",freq:"Stack",source:"",price:"",what:""},
    {name:"Rhodiola",dose:"1000mg",freq:"Stack",source:"",price:"",what:""},
    {name:"Ginkgo Biloba",dose:"240mg",freq:"Stack",source:"",price:"",what:""},
  ]},
  {name:"PRE-WORKOUT: Pump / Vasodilators",color:"#cf6f8f",items:[
    {name:"L-Citrulline",dose:"5–10g",freq:"Pre-workout",source:"Various",price:"~$20",what:"Vasodilator — relaxes blood vessels for pumps."},
    {name:"Betaine Anhydrous",dose:"2–5g",freq:"Pre-workout",source:"Various",price:"~$12",what:"Cellular hydration — draws water into muscle"},
    {name:"Glycerol",dose:"2.5–20g",freq:"Pre-workout",source:"Various",price:"~$20",what:"Cellular hydration — hyper-hydrates muscle tissue"},
    {name:"Creatine",dose:"5–15g",freq:"Pre/daily",source:"Various",price:"~$15",what:"Cellular hydration + ATP production"},
  ]},
  {name:"DIGESTION — Signs & Fixes",color:"#8fcf6f",items:[
    {name:"⚠ Signs of poor digestion",dose:"",freq:"",source:"",price:"",what:"Bloating, gas, loose stools, heartburn, brain fog, tired after meals"},
    {name:"Betaine HCL",dose:"1 serving",freq:"With final meal",source:"Various",price:"~$15",what:"Acidifies stomach — do NOT pound Tums (makes it worse)"},
    {name:"L-Glutamine",dose:"15–30g",freq:"AM empty stomach",source:"Various",price:"~$20",what:"Gut lining repair — intestinal barrier integrity"},
    {name:"Digestive Enzymes",dose:"Per label",freq:"With meals",source:"Various",price:"~$20",what:"Break down protein, fats, carbs more efficiently"},
    {name:"Pro-digestive foods",dose:"",freq:"Daily",source:"Grocery",price:"",what:"Pineapple, kefir, sauerkraut, kimchi, Greek yogurt, kombucha"},
  ]},
  {name:"PEPTIDES — Active Protocol",color:"#6fcfcf",items:[
    {name:"BPC-157",dose:"500mcg",freq:"3–4x/day oral (reset phase)",source:"Peptide vendor",price:"~$40/vial",what:"Gut + systemic repair peptide. Heals tendons, gut lining, CNS. Reset phase only."},
    {name:"GHK-Cu",dose:"2mg SubQ",freq:"Mon–Fri before bed",source:"Peptide vendor",price:"~$50/10mg vial",what:"Copper tripeptide — collagen, wound healing, anti-inflammatory, hair follicle activation."},
    {name:"GH (Growth Hormone)",dose:"2 IU SubQ",freq:"Daily before bed",source:"Rx / compounding",price:"~$150/mo",what:"IGF-1 stimulation, fat oxidation, tissue repair, sleep quality. Must cycle 5 on / 2 off."},
    {name:"Retatrutide",dose:"~1.33mg SubQ",freq:"Mon/Wed/Fri evening",source:"Peptide vendor",price:"~$80/10mg vial",what:"Triple agonist GLP-1/GIP/glucagon — appetite suppression, fat loss, metabolic health."},
    {name:"Semax",dose:"300mcg per nostril",freq:"1–2x daily AM (no dosing after 3PM)",source:"Peptide vendor",price:"~$40/5mg vial",what:"ACTH analog — BDNF boost, focus, neuroprotection. 5mg vial + 2.5ml bac water ≈ 16 doses."},
    {name:"Selank",dose:"250mcg per nostril",freq:"1–2x daily AM",source:"Peptide vendor",price:"~$40/5mg vial",what:"Anxiolytic peptide — reduces anxiety without sedation, memory, immune modulation."},
    {name:"Pinealon",dose:"1mg oral",freq:"Daily AM fasted",source:"Peptide vendor",price:"~$45/30 doses",what:"Epigenetic peptide from pineal gland — circadian regulation, neuroprotection, sleep depth."},
    {name:"MOTS-c",dose:"5–10mg SubQ",freq:"2–3x/week AM (fasted + pre-exercise)",source:"Peptide vendor",price:"~$60/10mg vial",what:"Mitochondrial-derived peptide — AMPK activation, insulin sensitivity, fat oxidation. Stack with exercise."},
  ]},
  {name:"L-CARNITINE — Fat Oxidation",color:"#cfb86f",items:[
    {name:"L-Carnitine (base)",dose:"2–4g",freq:"AM fasted or pre-cardio",source:"Various (powder/liquid)",price:"~$15–25",what:"Shuttles fatty acids into mitochondria for energy. Best taken fasted or before cardio."},
    {name:"L-Carnitine L-Tartrate (LCLT)",dose:"2g",freq:"Pre-workout",source:"Various",price:"~$20",what:"Most bioavailable form — androgen receptor upregulation, recovery, reduces DOMS."},
    {name:"Acetyl-L-Carnitine (ALCAR)",dose:"500mg–2g",freq:"AM or pre-workout",source:"Various",price:"~$15",what:"Crosses BBB — cognitive + fat oxidation combo. Use when you want brain + body benefit."},
    {name:"⚠ Protocol note",dose:"",freq:"",source:"",price:"",what:"Stack carnitine with insulin spike (banana + honey pre-lift) for max muscle uptake. Daily use builds tissue levels over 2–3 weeks."},
  ]},
  {name:"PUMP BLEND — Pre-Workout Vasodilation",color:"#cf6f8f",items:[
    {name:"L-Citrulline",dose:"6–10g",freq:"30–45 min pre-lift",source:"Bulk powder",price:"~$20/200g",what:"Converts to arginine → NO production → vasodilation. Better than arginine direct."},
    {name:"Agmatine Sulfate",dose:"500–1500mg",freq:"Pre-workout",source:"Bulk powder / Swolverine",price:"~$20",what:"NO synthase modulator, NMDA antagonist. Pump + pain tolerance + mood."},
    {name:"Betaine Anhydrous",dose:"2.5g",freq:"Pre-workout",source:"Bulk powder",price:"~$12",what:"Osmolyte — draws water into muscle cells. Power output + cellular hydration."},
    {name:"Glycerol Monostearate",dose:"2–3g",freq:"Pre-workout",source:"Bulk powder",price:"~$15",what:"Hyperhydration — pulls water into muscle. Stack with high water intake (16–24oz)."},
    {name:"Himalayan Pink Salt",dose:"1g (¼ tsp)",freq:"Pre-workout with water",source:"Grocery",price:"<$5",what:"Electrolyte prime — sodium primes pumps and maintains intra-workout hydration."},
    {name:"⚠ Protocol note",dose:"",freq:"",source:"",price:"",what:"Take 30–45 min before lift with 20–24oz water. Do NOT stack with caffeine-heavy stims if sensitive to BP spikes."},
  ]},
  {name:"5-AMINO-1MQ — Metabolic",color:"#6fcf6f",items:[
    {name:"5-Amino-1MQ",dose:"20–50mg",freq:"1–2x/day with food",source:"Peptide vendor / nootropic source",price:"~$50/60ct",what:"NNMT inhibitor — activates dormant fat cells, increases NAD+, boosts mitochondrial biogenesis. Strong metabolic compound."},
    {name:"⚠ Cycle note",dose:"",freq:"",source:"",price:"",what:"Cycle 8 weeks ON / 4 weeks OFF. Monitor energy and metabolism. Best stacked with MOTS-c and Retatrutide for max fat loss synergy."},
    {name:"Stack with: Retatrutide",dose:"Per protocol",freq:"Mon/Wed/Fri",source:"",price:"",what:"Triple agonist GLP-1 — complements 5-Amino-1MQ's fat mobilization."},
    {name:"Stack with: MOTS-c",dose:"5–10mg SubQ",freq:"2–3x/week fasted",source:"",price:"",what:"AMPK activation synergizes with NNMT inhibition for metabolic reset."},
    {name:"Stack with: L-Carnitine",dose:"2–4g",freq:"AM fasted",source:"",price:"",what:"Shuttles mobilized fatty acids into mitochondria — completes the fat oxidation pathway."},
  ]},
  {name:"MOTS-c — Mitochondrial & Metabolic",color:"#8f6fcf",items:[
    {name:"MOTS-c",dose:"5–10mg SubQ",freq:"2–3x/week AM, fasted + pre-exercise",source:"Peptide vendor",price:"~$60/10mg vial",what:"Mitochondrial ORF peptide — AMPK activation, insulin sensitization, fat oxidation, anti-aging."},
    {name:"⚠ Timing note",dose:"",freq:"",source:"",price:"",what:"Inject 30–60 min before fasted cardio or ruck for maximum AMPK-driven fat oxidation. Do not take before heavy carb meals."},
    {name:"Stack synergy",dose:"",freq:"",source:"",price:"",what:"MOTS-c + 5-Amino-1MQ + Retatrutide = metabolic triple stack. All three target different fat oxidation pathways simultaneously."},
    {name:"Reconstitution",dose:"",freq:"",source:"",price:"",what:"10mg vial + 1ml bac water = 10mg/ml. Draw 0.5–1 unit on insulin syringe for 5–10mg dose. Store in fridge, use within 30 days."},
  ]},
];

// ─── TYPES ───
interface Block { time:string;label:string;type:string;items:string[];note?:string;duration?:string;macros?:string; }
interface DailyLog { weight?:number;feeling?:number;liftDone?:boolean;ruckDone?:boolean;ruckWeight?:number;notes?:string; }
interface CycleRecord { id:string;substance:string;startDate:string;endDate?:string;phase:"on"|"off"; }
interface MaintRecord { id:string;substance:string;startDate:string;endDate?:string; }
interface ResearchLink { label:string;url:string; }
interface SupplyItem { id:string;name:string;cat:string;color:string;supplier:string;supplierUrl:string;costPerOrder:number;unitsPerOrder:number;currentUnits:number;unitsPerDay:number;unitLabel:string;notes:string;links?:ResearchLink[];researchNotes?:string; }
interface StackItem { name:string;dose:string;freq:string;source:string;price:string;what:string; }
interface UserStack { id:string;name:string;color:string;notes:string;items:StackItem[];mode:"inactive"|"daily"|"once";activeSince?:string;activeDate?:string;fromRef?:string; }

// ─── UTILS ───
function todayStr(){return new Date().toISOString().split("T")[0];}
function formatDate(d:string){const dt=new Date(d+"T12:00:00");return dt.toLocaleDateString("en-US",{month:"short",day:"numeric"});}
function daysBetween(a:string,b:string){return Math.floor((new Date(b+"T12:00:00").getTime()-new Date(a+"T12:00:00").getTime())/86400000);}
function last14Days(){return Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(13-i));return d.toISOString().split("T")[0];});}
function fmtCost(n:number){return n<0.01?"<$0.01":n<1?`$${n.toFixed(2)}`:`$${n.toFixed(2)}`;}
function feelingLabel(n:number){if(n<=2)return"💀 Rough";if(n<=4)return"😐 Meh";if(n<=6)return"🙂 Decent";if(n<=8)return"😤 Good";return"🔥 Locked in";}
function feelingColor(n:number){if(n<=3)return"#cf6f6f";if(n<=5)return"#cfb86f";if(n<=7)return"#6fcf6f";return"#6f8fcf";}

// ─── DEBOUNCE HOOK ───
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return debounced;
}

// ─── TYPE BADGE ───
function TypeBadge({type}:{type:string}){
  const s:Record<string,{bg:string;border:string;text:string}>={supplement:{bg:"#1a2f1a",border:"#2d5a2d",text:"#6fcf6f"},meal:{bg:"#2f2a1a",border:"#5a4d2d",text:"#cfb86f"},training:{bg:"#1a1a2f",border:"#2d2d5a",text:"#6f8fcf"},focus:{bg:"#2f1a2f",border:"#5a2d5a",text:"#cf6fcf"}};
  const c=s[type]||{bg:"#222",border:"#444",text:"#aaa"};
  return<span style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:c.text,background:c.bg,border:`1px solid ${c.border}`,padding:"2px 8px",borderRadius:3}}>{type==="focus"?"optional":type}</span>;
}

// ─── SCHEDULE BLOCK ───
function ScheduleBlock({block,checks,onToggle}:{block:Block;checks:Record<string,boolean>;onToggle:(k:string)=>void;}){
  const bc:Record<string,string>={supplement:"#2d5a2d",meal:"#5a4d2d",training:"#2d2d5a",focus:"#5a2d5a"};
  const borderColor=bc[block.type]||"#333";
  const doneCount=block.items.filter(item=>checks[`${block.label}__${item}`]).length;
  const allDone=doneCount===block.items.length;
  return(
    <div style={{borderLeft:`3px solid ${allDone?"#2a2a2a":borderColor}`,paddingLeft:16,marginBottom:20,opacity:allDone?0.55:1,transition:"opacity 0.2s"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
        <span style={{fontFamily:"monospace",fontSize:12,color:"#8a8a8a",minWidth:72}}>{block.time}</span>
        <TypeBadge type={block.type}/>
        {block.duration&&<span style={{fontSize:10,color:"#666",fontStyle:"italic"}}>{block.duration}</span>}
        {doneCount>0&&<span style={{fontSize:9,color:allDone?"#6fcf6f":"#666",marginLeft:"auto"}}>{allDone?"✓ DONE":`${doneCount}/${block.items.length}`}</span>}
      </div>
      <div style={{fontWeight:700,fontSize:14,color:allDone?"#444":"#e0e0e0",marginBottom:6}}>{block.label}</div>
      <div style={{display:"flex",flexDirection:"column",gap:2}}>
        {block.items.map((item,i)=>{
          const key=`${block.label}__${item}`;const done=!!checks[key];
          return(
            <button key={i} onClick={()=>onToggle(key)} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer",padding:"4px 0",textAlign:"left"}}>
              <div style={{width:16,height:16,borderRadius:"50%",flexShrink:0,border:`1.5px solid ${done?"#6fcf6f":"#2d2d2d"}`,background:done?"#6fcf6f":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                {done&&<span style={{fontSize:9,color:"#0d0d0d",fontWeight:900}}>✓</span>}
              </div>
              <span style={{fontSize:13,color:done?"#444":"#b0b0b0",lineHeight:1.4,textDecoration:done?"line-through":"none",transition:"all 0.15s"}}>{item}</span>
            </button>
          );
        })}
      </div>
      {block.macros&&<div style={{marginTop:6,fontSize:11,fontFamily:"monospace",color:"#cfb86f",background:"#1a1812",display:"inline-block",padding:"3px 10px",borderRadius:3}}>{block.macros}</div>}
      {block.note&&<div style={{marginTop:6,fontSize:11,color:"#cf6f6f",fontWeight:600}}>▸ {block.note}</div>}
    </div>
  );
}

// ─── TRACK PAGE ───
function TrackPage(){
  const[date,setDate]=useState(todayStr());
  const logsRaw=useQuery(api.protocol.getLogs)??{};
  const logs:Record<string,DailyLog>=logsRaw as Record<string,DailyLog>;
  const upsertLog=useMutation(api.protocol.upsertLog);
  const log:DailyLog=logs[date]||{};
  // local optimistic state for the current date
  const[localLog,setLocalLog]=useState<DailyLog>({});
  useEffect(()=>{setLocalLog(logs[date]||{});},[date,JSON.stringify(logs[date])]);
  const update=(updates:Partial<DailyLog>)=>{
    const next={...localLog,...updates};
    setLocalLog(next);
    upsertLog({date,...next});
  };
  const history=last14Days();
  const navDate=(dir:number)=>{const dt=new Date(date+"T12:00:00");dt.setDate(dt.getDate()+dir);const nd=dt.toISOString().split("T")[0];if(nd<=todayStr())setDate(nd);};
  const isToday=date===todayStr();
  return(
    <div style={{padding:"16px 16px 40px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <button onClick={()=>navDate(-1)} style={{background:"#111",border:"1px solid #222",color:"#888",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:14}}>←</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>{isToday?"TODAY":formatDate(date)}</div>
          <div style={{fontSize:10,color:"#555",marginTop:2}}>{date}</div>
        </div>
        <button onClick={()=>navDate(1)} disabled={isToday} style={{background:"#111",border:"1px solid #222",color:isToday?"#2a2a2a":"#888",borderRadius:6,padding:"6px 12px",cursor:isToday?"default":"pointer",fontSize:14}}>→</button>
      </div>
      {/* Activity */}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {[{key:"liftDone" as const,label:"LIFT",icon:"🏋️",active:localLog.liftDone},{key:"ruckDone" as const,label:"RUCK",icon:"🎒",active:localLog.ruckDone}].map(t=>(
          <button key={t.key} onClick={()=>update({[t.key]:!t.active})} style={{flex:1,padding:"12px 8px",borderRadius:8,border:`1px solid ${t.active?"#2d5a2d":"#1f1f1f"}`,background:t.active?"#1a2f1a":"#111",cursor:"pointer"}}>
            <div style={{fontSize:20,marginBottom:4}}>{t.icon}</div>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:"0.1em",color:t.active?"#6fcf6f":"#444"}}>{t.label}</div>
            <div style={{fontSize:9,color:t.active?"#6fcf6f":"#333",marginTop:2}}>{t.active?"✓ DONE":"tap to mark"}</div>
          </button>
        ))}
      </div>
      {localLog.ruckDone&&(
        <div style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:8,padding:14,marginBottom:12}}>
          <div style={{fontSize:10,color:"#555",letterSpacing:"0.1em",marginBottom:8}}>RUCK WEIGHT (lbs)</div>
          <div style={{display:"flex",gap:6}}>
            {[20,25,30,35,40].map(w=>(
              <button key={w} onClick={()=>update({ruckWeight:w})} style={{flex:1,padding:"8px 4px",borderRadius:6,border:`1px solid ${localLog.ruckWeight===w?"#6f8fcf":"#222"}`,background:localLog.ruckWeight===w?"#1a1a2f":"#0d0d0d",color:localLog.ruckWeight===w?"#6f8fcf":"#555",fontSize:12,fontWeight:700,cursor:"pointer"}}>{w}</button>
            ))}
          </div>
        </div>
      )}
      {/* Weight */}
      <div style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:8,padding:14,marginBottom:12}}>
        <div style={{fontSize:10,color:"#555",letterSpacing:"0.1em",marginBottom:8}}>BODYWEIGHT (lbs)</div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>update({weight:(localLog.weight||200)-0.5})} style={{background:"#1a1a1a",border:"1px solid #222",color:"#888",borderRadius:6,padding:"6px 14px",cursor:"pointer",fontSize:18}}>−</button>
          <input type="number" step="0.5" value={localLog.weight||""} onChange={e=>update({weight:parseFloat(e.target.value)||undefined})} placeholder="---" style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:28,fontWeight:800,fontFamily:"monospace",color:"#fff",textAlign:"center"}}/>
          <button onClick={()=>update({weight:(localLog.weight||200)+0.5})} style={{background:"#1a1a1a",border:"1px solid #222",color:"#888",borderRadius:6,padding:"6px 14px",cursor:"pointer",fontSize:18}}>+</button>
        </div>
      </div>
      {/* Feeling */}
      <div style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:8,padding:14,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:10,color:"#555",letterSpacing:"0.1em"}}>FEELING TODAY</div>
          {localLog.feeling&&<span style={{fontSize:12,color:feelingColor(localLog.feeling)}}>{feelingLabel(localLog.feeling)}</span>}
        </div>
        <div style={{display:"flex",gap:4}}>
          {[1,2,3,4,5,6,7,8,9,10].map(n=>(
            <button key={n} onClick={()=>update({feeling:n})} style={{flex:1,padding:"10px 2px",borderRadius:4,background:localLog.feeling===n?feelingColor(n):localLog.feeling&&n<=localLog.feeling?`${feelingColor(localLog.feeling)}22`:"#1a1a1a",border:`1px solid ${localLog.feeling===n?feelingColor(n):"#222"}`,color:localLog.feeling===n?"#0d0d0d":localLog.feeling&&n<=localLog.feeling?feelingColor(localLog.feeling):"#333",fontSize:11,fontWeight:800,cursor:"pointer"}}>{n}</button>
          ))}
        </div>
      </div>
      {/* Notes */}
      <div style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:8,padding:14,marginBottom:20}}>
        <div style={{fontSize:10,color:"#555",letterSpacing:"0.1em",marginBottom:8}}>NOTES</div>
        <textarea value={localLog.notes||""} onChange={e=>update({notes:e.target.value})} placeholder="PRs, sleep quality, side effects, observations..." style={{width:"100%",background:"transparent",border:"none",outline:"none",color:"#b0b0b0",fontSize:13,lineHeight:1.6,resize:"none",minHeight:70,fontFamily:"inherit"}}/>
      </div>
      {/* History */}
      {history.some(d=>logs[d])&&(
        <>
          <div style={{fontSize:10,color:"#555",letterSpacing:"0.15em",marginBottom:12}}>14-DAY HISTORY</div>
          <div style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:8,padding:14,marginBottom:12}}>
            <div style={{fontSize:10,color:"#555",letterSpacing:"0.1em",marginBottom:10}}>BODYWEIGHT</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:3,height:48}}>
              {history.map(d=>{
                const w=logs[d]?.weight;
                const all=history.map(x=>logs[x]?.weight).filter(Boolean) as number[];
                const min=all.length?Math.min(...all)-2:180;const max=all.length?Math.max(...all)+2:220;
                const pct=w?((w-min)/(max-min))*100:0;
                return(
                  <div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <div style={{width:"100%",height:36,display:"flex",alignItems:"flex-end"}}>
                      {w?<div style={{width:"100%",background:d===date?"#6f8fcf":"#2a3a4a",borderRadius:"2px 2px 0 0",height:`${Math.max(4,pct)}%`}}/>:<div style={{width:"100%",height:2,background:"#1a1a1a",marginTop:"auto"}}/>}
                    </div>
                    <div style={{fontSize:7,color:d===date?"#6f8fcf":"#333"}}>{formatDate(d).split(" ")[1]}</div>
                  </div>
                );
              })}
            </div>
            {(()=>{const ws=history.map(d=>logs[d]?.weight).filter(Boolean) as number[];if(ws.length<2)return null;const diff=ws[ws.length-1]-ws[0];return(<div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{fontSize:10,color:"#555"}}>14d change</span><span style={{fontSize:11,fontWeight:700,color:diff<0?"#6fcf6f":diff>0?"#cf6f6f":"#888"}}>{diff>0?"+":""}{diff.toFixed(1)} lbs</span></div>);})()}
          </div>
          <div style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:8,padding:14}}>
            <div style={{fontSize:10,color:"#555",letterSpacing:"0.1em",marginBottom:10}}>DAILY LOG</div>
            {history.filter(d=>logs[d]).reverse().map(d=>{
              const l=logs[d];
              return(
                <div key={d} onClick={()=>setDate(d)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #1a1a1a",cursor:"pointer"}}>
                  <div style={{minWidth:56,fontSize:11,color:d===date?"#fff":"#888",fontWeight:d===date?700:400}}>{formatDate(d)}</div>
                  <div style={{display:"flex",gap:4,flex:1}}>
                    {l?.liftDone&&<span style={{fontSize:10}}>🏋️</span>}
                    {l?.ruckDone&&<span style={{fontSize:10}}>🎒</span>}
                    {l?.ruckWeight&&<span style={{fontSize:9,color:"#555"}}>{l.ruckWeight}lb</span>}
                  </div>
                  {l?.weight&&<span style={{fontSize:12,color:"#ccc",fontFamily:"monospace",fontWeight:600}}>{l.weight}</span>}
                  {l?.feeling&&<div style={{width:22,height:22,borderRadius:"50%",background:`${feelingColor(l.feeling)}33`,border:`1px solid ${feelingColor(l.feeling)}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:10,fontWeight:800,color:feelingColor(l.feeling)}}>{l.feeling}</span></div>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── SUPPLY PAGE ───
function SupplyPage(){
  const supplyRaw=useQuery(api.protocol.getSupply)??[];
  const upsertSupplyItem=useMutation(api.protocol.upsertSupplyItem);
  const seedSupply=useMutation(api.protocol.seedSupply);
  const seeded=useRef(false);
  useEffect(()=>{
    if(!seeded.current&&supplyRaw.length===0){
      seeded.current=true;
      seedSupply({items:DEFAULT_SUPPLY.map(i=>({itemId:i.id,name:i.name,cat:i.cat,color:i.color,supplier:i.supplier,supplierUrl:i.supplierUrl,costPerOrder:i.costPerOrder,unitsPerOrder:i.unitsPerOrder,currentUnits:i.currentUnits,unitsPerDay:i.unitsPerDay,unitLabel:i.unitLabel,notes:i.notes}))});
    }
  },[supplyRaw.length]);
  // Map Convex rows back to SupplyItem shape
  const supply:SupplyItem[]=supplyRaw.length>0
    ?supplyRaw.map(r=>({id:(r as {itemId:string}).itemId,name:r.name,cat:r.cat,color:r.color,supplier:r.supplier,supplierUrl:r.supplierUrl,costPerOrder:r.costPerOrder,unitsPerOrder:r.unitsPerOrder,currentUnits:r.currentUnits,unitsPerDay:r.unitsPerDay,unitLabel:r.unitLabel,notes:r.notes,links:(r as {links?:ResearchLink[]}).links||[],researchNotes:(r as {researchNotes?:string}).researchNotes}))
    :DEFAULT_SUPPLY;
  const setSupply=(_:unknown)=>{}; // unused
  void setSupply;
  const saveResearchNotes=useMutation(api.protocol.saveResearchNotes);

  const[editing,setEditing]=useState<string|null>(null);
  const[editBuf,setEditBuf]=useState<Partial<SupplyItem>>({});
  const[sortBy,setSortBy]=useState<"name"|"cost"|"runway">("runway");
  const[researching,setResearching]=useState<string|null>(null);  // itemId being researched
  const[researchOpen,setResearchOpen]=useState<string|null>(null); // itemId with panel open

  // Get active supply names + stacks for context
  const activeStacksRaw=useQuery(api.protocol.getStacks)??[];
  const activeStackContext=activeStacksRaw
    .filter(s=>s.mode==="daily"||s.mode==="once")
    .flatMap(s=>(s.items as StackItem[]).map(i=>i.name).filter(Boolean));
  const allActiveItems=supply.filter(i=>i.unitsPerDay>0).map(i=>i.name);
  const fullContext=[...new Set([...activeStackContext,...allActiveItems])];

  const runResearch=async(item:SupplyItem)=>{
    setResearching(item.id);
    setResearchOpen(item.id);
    try{
      const res=await fetch("/api/research",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({supplement:item.name,activeStack:fullContext.filter(n=>n!==item.name),currentProtocol:"maintenance"})});
      const data=await res.json();
      if(data.result){
        saveResearchNotes({itemId:item.id,researchNotes:data.result});
      }
    }catch(e){console.error(e);}
    setResearching(null);
  };

  const startEdit=(item:SupplyItem)=>{setEditing(item.id);setEditBuf({...item,links:item.links||[]});};
  const saveEdit=()=>{
    if(!editing)return;
    const merged={...supply.find(i=>i.id===editing),...editBuf} as SupplyItem;
    upsertSupplyItem({itemId:merged.id,name:merged.name,cat:merged.cat,color:merged.color,supplier:merged.supplier,supplierUrl:merged.supplierUrl,costPerOrder:merged.costPerOrder,unitsPerOrder:merged.unitsPerOrder,currentUnits:merged.currentUnits,unitsPerDay:merged.unitsPerDay,unitLabel:merged.unitLabel,notes:merged.notes,links:merged.links||[],researchNotes:merged.researchNotes});
    setEditing(null);setEditBuf({});
  };
  const cancelEdit=()=>{setEditing(null);setEditBuf({});};

  const derived=(item:SupplyItem)=>{
    const cpUnit=item.unitsPerOrder>0?item.costPerOrder/item.unitsPerOrder:0;
    const cpDay=cpUnit*item.unitsPerDay;
    const cpWeek=cpDay*7;
    const cpMonth=cpDay*30;
    const daysLeft=item.unitsPerDay>0?item.currentUnits/item.unitsPerDay:Infinity;
    const weeksLeft=daysLeft/7;
    return{cpUnit,cpDay,cpWeek,cpMonth,daysLeft,weeksLeft};
  };

  const sorted=[...supply].sort((a,b)=>{
    if(sortBy==="cost"){return derived(b).cpMonth-derived(a).cpMonth;}
    if(sortBy==="runway"){const da=derived(a).daysLeft;const db=derived(b).daysLeft;if(!isFinite(da)&&!isFinite(db))return 0;if(!isFinite(da))return 1;if(!isFinite(db))return-1;return da-db;}
    return a.name.localeCompare(b.name);
  });

  const totalCpDay=supply.reduce((acc,i)=>acc+derived(i).cpDay,0);
  const totalCpWeek=totalCpDay*7;
  const totalCpMonth=totalCpDay*30;
  const lowestRunway=supply.filter(i=>i.unitsPerDay>0).reduce((min,i)=>{const w=derived(i).weeksLeft;return w<min?w:min;},Infinity);

  const runwayColor=(w:number)=>{if(w<2)return"#cf6f6f";if(w<4)return"#cfb86f";return"#6fcf6f";};

  return(
    <div style={{padding:"0 0 40px"}}>
      {/* Summary */}
      <div style={{background:"#111",borderBottom:"1px solid #1a1a1a",padding:"16px"}}>
        <div style={{fontSize:9,color:"#555",letterSpacing:"0.15em",marginBottom:8}}>MONTHLY SPEND OVERVIEW</div>
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          {[{l:"/ DAY",v:`$${totalCpDay.toFixed(2)}`,c:"#ccc"},{l:"/ WEEK",v:`$${totalCpWeek.toFixed(2)}`,c:"#cfb86f"},{l:"/ MONTH",v:`$${totalCpMonth.toFixed(2)}`,c:"#6fcf6f"}].map(m=>(
            <div key={m.l} style={{flex:1,background:"#0d0d0d",border:"1px solid #1f1f1f",borderRadius:8,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div>
              <div style={{fontSize:15,fontWeight:800,fontFamily:"monospace",color:m.c}}>{m.v}</div>
            </div>
          ))}
        </div>
        {isFinite(lowestRunway)&&(
          <div style={{background:lowestRunway<2?"#2a1a1a":lowestRunway<4?"#2a2a1a":"#1a2a1a",border:`1px solid ${runwayColor(lowestRunway)}40`,borderRadius:6,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:"#888"}}>Lowest supply runway</span>
            <span style={{fontSize:12,fontWeight:700,color:runwayColor(lowestRunway)}}>{lowestRunway<1?`${Math.round(lowestRunway*7)}d`:`${lowestRunway.toFixed(1)} wks`}</span>
          </div>
        )}
      </div>

      {/* Sort */}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid #1a1a1a",background:"#0d0d0d"}}>
        {[{id:"runway",label:"BY RUNWAY"},{id:"cost",label:"BY COST"},{id:"name",label:"A–Z"}].map(s=>(
          <button key={s.id} onClick={()=>setSortBy(s.id as "name"|"cost"|"runway")} style={{flex:1,padding:"10px 4px",background:"none",border:"none",borderBottom:sortBy===s.id?"2px solid #fff":"2px solid transparent",color:sortBy===s.id?"#fff":"#555",cursor:"pointer",fontSize:10,fontWeight:700,letterSpacing:"0.06em"}}>{s.label}</button>
        ))}
      </div>

      {/* Items */}
      <div style={{padding:"12px 12px 0"}}>
        {sorted.map(item=>{
          const d=derived(item);
          const isEdit=editing===item.id;
          const buf=isEdit?editBuf:item;
          const runColor=runwayColor(d.weeksLeft);
          const runPct=isFinite(d.weeksLeft)?Math.min(100,(d.weeksLeft/12)*100):100;

          return(
            <div key={item.id} style={{marginBottom:8,background:"#111",border:`1px solid ${isEdit?"#333":"#1a1a1a"}`,borderRadius:8,overflow:"hidden"}}>
              {/* Header row */}
              <div style={{padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:item.color,flexShrink:0}}/>
                      <span style={{fontSize:13,fontWeight:700,color:"#e0e0e0"}}>{item.name}</span>
                    </div>
                    <div style={{fontSize:10,color:"#555",marginLeft:16}}>{item.supplier||"No supplier set"}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:12,fontWeight:800,fontFamily:"monospace",color:"#cfb86f"}}>{fmtCost(d.cpMonth)}<span style={{fontSize:9,color:"#555",fontWeight:400}}>/mo</span></div>
                    {item.unitsPerDay>0&&<div style={{fontSize:10,color:runColor,marginTop:2}}>{isFinite(d.weeksLeft)?`${d.weeksLeft.toFixed(1)} wks left`:"∞"}</div>}
                  </div>
                </div>

                {/* Runway bar */}
                {item.unitsPerDay>0&&isFinite(d.daysLeft)&&(
                  <div style={{height:3,background:"#1a1a1a",borderRadius:2,marginBottom:8}}>
                    <div style={{height:"100%",width:`${runPct}%`,background:runColor,borderRadius:2,transition:"width 0.3s"}}/>
                  </div>
                )}

                {/* Cost breakdown row */}
                <div style={{display:"flex",gap:6,marginBottom:8}}>
                  {[{l:"per dose",v:fmtCost(d.cpUnit)},{l:"per week",v:fmtCost(d.cpWeek)},{l:"per month",v:fmtCost(d.cpMonth)}].map(c=>(
                    <div key={c.l} style={{flex:1,background:"#0d0d0d",borderRadius:4,padding:"5px 4px",textAlign:"center"}}>
                      <div style={{fontSize:8,color:"#444",letterSpacing:"0.05em"}}>{c.l}</div>
                      <div style={{fontSize:11,fontWeight:700,fontFamily:"monospace",color:"#888"}}>{c.v}</div>
                    </div>
                  ))}
                </div>

                {/* Action buttons row */}
                {!isEdit&&(
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>startEdit(item)} style={{flex:1,padding:"7px",background:"#0d0d0d",border:"1px solid #222",borderRadius:6,color:"#555",fontSize:11,cursor:"pointer",fontWeight:600}}>✎ Edit</button>
                    <button onClick={()=>researching===item.id?null:runResearch(item)} disabled={researching===item.id} style={{flex:1,padding:"7px",background:researching===item.id?"#141a14":"#0a1a0a",border:"1px solid #1a3a1a",borderRadius:6,color:researching===item.id?"#555":"#6fcf6f",fontSize:11,cursor:researching===item.id?"default":"pointer",fontWeight:600}}>{researching===item.id?"🔬 Researching…":"🔬 Gemini Research"}</button>
                    {(item.researchNotes||item.links?.length)&&<button onClick={()=>setResearchOpen(researchOpen===item.id?null:item.id)} style={{padding:"7px 10px",background:"#0d0d0d",border:"1px solid #222",borderRadius:6,color:"#6f8fcf",fontSize:12,cursor:"pointer"}}>{researchOpen===item.id?"▲":"▼"}</button>}
                  </div>
                )}

                {/* Research / links panel */}
                {!isEdit&&researchOpen===item.id&&(
                  <div style={{marginTop:8,background:"#090f09",border:"1px solid #1a2a1a",borderRadius:6,padding:12}}>
                    {/* Links */}
                    {item.links&&item.links.length>0&&(
                      <div style={{marginBottom:10}}>
                        <div style={{fontSize:9,color:"#444",letterSpacing:"0.1em",marginBottom:6}}>RESEARCH LINKS</div>
                        <div style={{display:"flex",flexDirection:"column",gap:4}}>
                          {item.links.map((lnk,li)=>(
                            <a key={li} href={lnk.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#6f8fcf",textDecoration:"none",display:"flex",alignItems:"center",gap:6,padding:"5px 8px",background:"#0d0d0d",borderRadius:4,border:"1px solid #1a1a2a"}}>
                              <span style={{fontSize:10}}>🔗</span>
                              <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lnk.label||lnk.url}</span>
                              <span style={{fontSize:10,color:"#333"}}>↗</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Research notes */}
                    {item.researchNotes&&(
                      <div>
                        <div style={{fontSize:9,color:"#444",letterSpacing:"0.1em",marginBottom:6}}>GEMINI RESEARCH</div>
                        <div style={{fontSize:11,color:"#888",lineHeight:1.7,whiteSpace:"pre-wrap",fontFamily:"inherit"}}>
                          {item.researchNotes.split("\n").map((line,li)=>{
                            const isH=line.startsWith("## ");
                            const cleaned=line.replace(/^##\s*/,"").replace(/\*\*(.*?)\*\*/g,"$1");
                            return isH
                              ?<div key={li} style={{fontSize:10,fontWeight:800,color:"#6fcf6f",letterSpacing:"0.08em",marginTop:li>0?10:0,marginBottom:3}}>{cleaned}</div>
                              :<div key={li} style={{color:line.startsWith("-")||line.startsWith("•")?"#aaa":"#777",paddingLeft:line.startsWith("-")||line.startsWith("•")?8:0}}>{cleaned||"\u00a0"}</div>;
                          })}
                        </div>
                      </div>
                    )}
                    {!item.researchNotes&&!item.links?.length&&(
                      <div style={{fontSize:11,color:"#333",fontStyle:"italic"}}>No research yet. Tap 🔬 Gemini Research to generate.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Edit panel */}
              {isEdit&&(
                <div style={{borderTop:"1px solid #1f1f1f",padding:"14px",background:"#0d0d0d"}}>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {/* Supplier */}
                    <div>
                      <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>SUPPLIER</div>
                      <input value={(buf.supplier)||""} onChange={e=>setEditBuf(p=>({...p,supplier:e.target.value}))} placeholder="e.g. Nootropics Depot" style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,padding:"8px 10px",color:"#e0e0e0",fontSize:13,outline:"none"}}/>
                    </div>
                    {/* Supplier URL */}
                    <div>
                      <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>SUPPLIER URL</div>
                      <input value={(buf.supplierUrl)||""} onChange={e=>setEditBuf(p=>({...p,supplierUrl:e.target.value}))} placeholder="https://..." style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,padding:"8px 10px",color:"#e0e0e0",fontSize:13,outline:"none"}}/>
                    </div>
                    {/* Stock + unit */}
                    <div style={{display:"flex",gap:8}}>
                      <div style={{flex:2}}>
                        <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>CURRENT STOCK</div>
                        <input type="number" value={(buf.currentUnits)??""} onChange={e=>setEditBuf(p=>({...p,currentUnits:parseFloat(e.target.value)||0}))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,padding:"8px 10px",color:"#e0e0e0",fontSize:13,outline:"none"}}/>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>UNIT</div>
                        <input value={(buf.unitLabel)||""} onChange={e=>setEditBuf(p=>({...p,unitLabel:e.target.value}))} placeholder="caps" style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,padding:"8px 10px",color:"#e0e0e0",fontSize:13,outline:"none"}}/>
                      </div>
                    </div>
                    {/* Units per day */}
                    <div>
                      <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>UNITS USED PER DAY (avg, e.g. 0.43 = 3x/week)</div>
                      <input type="number" step="0.01" value={(buf.unitsPerDay)??""} onChange={e=>setEditBuf(p=>({...p,unitsPerDay:parseFloat(e.target.value)||0}))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,padding:"8px 10px",color:"#e0e0e0",fontSize:13,outline:"none"}}/>
                    </div>
                    {/* Order cost + units */}
                    <div style={{display:"flex",gap:8}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>COST PER ORDER ($)</div>
                        <input type="number" step="0.01" value={(buf.costPerOrder)??""} onChange={e=>setEditBuf(p=>({...p,costPerOrder:parseFloat(e.target.value)||0}))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,padding:"8px 10px",color:"#e0e0e0",fontSize:13,outline:"none"}}/>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>UNITS PER ORDER</div>
                        <input type="number" value={(buf.unitsPerOrder)??""} onChange={e=>setEditBuf(p=>({...p,unitsPerOrder:parseFloat(e.target.value)||0}))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,padding:"8px 10px",color:"#e0e0e0",fontSize:13,outline:"none"}}/>
                      </div>
                    </div>
                    {/* Notes */}
                    <div>
                      <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>NOTES</div>
                      <textarea value={(buf.notes)||""} onChange={e=>setEditBuf(p=>({...p,notes:e.target.value}))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,padding:"8px 10px",color:"#b0b0b0",fontSize:12,outline:"none",resize:"none",minHeight:48,fontFamily:"inherit"}}/>
                    </div>
                    {/* Research Links */}
                    <div>
                      <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>RESEARCH LINKS</div>
                      {(buf.links||[]).map((lnk,li)=>(
                        <div key={li} style={{display:"flex",gap:6,marginBottom:6}}>
                          <input value={lnk.label} onChange={e=>setEditBuf(p=>({...p,links:p.links?.map((l,i)=>i===li?{...l,label:e.target.value}:l)||[]}))} placeholder="Label (e.g. PubMed study)" style={{flex:1,background:"#111",border:"1px solid #222",borderRadius:4,padding:"6px 8px",color:"#6f8fcf",fontSize:11,outline:"none"}}/>
                          <input value={lnk.url} onChange={e=>setEditBuf(p=>({...p,links:p.links?.map((l,i)=>i===li?{...l,url:e.target.value}:l)||[]}))} placeholder="https://..." style={{flex:2,background:"#111",border:"1px solid #222",borderRadius:4,padding:"6px 8px",color:"#888",fontSize:11,outline:"none"}}/>
                          <button onClick={()=>setEditBuf(p=>({...p,links:p.links?.filter((_,i)=>i!==li)||[]}))} style={{padding:"6px 8px",background:"#1a1010",border:"1px solid #3a1a1a",borderRadius:4,color:"#cf6f6f",fontSize:12,cursor:"pointer"}}>×</button>
                        </div>
                      ))}
                      <button onClick={()=>setEditBuf(p=>({...p,links:[...(p.links||[]),{label:"",url:""}]}))} style={{width:"100%",padding:"6px",background:"#0d0d0d",border:"1px dashed #1a2a1a",borderRadius:4,color:"#444",fontSize:10,cursor:"pointer"}}>+ Add link</button>
                    </div>
                    {/* Preview */}
                    {(buf.costPerOrder||0)>0&&(buf.unitsPerOrder||0)>0&&(
                      <div style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:6,padding:"10px 12px"}}>
                        <div style={{fontSize:9,color:"#555",marginBottom:6,letterSpacing:"0.1em"}}>CALCULATED PREVIEW</div>
                        {(()=>{
                          const cpU=(buf.costPerOrder||0)/(buf.unitsPerOrder||1);
                          const cpD=cpU*(buf.unitsPerDay||0);
                          const dLeft=(buf.unitsPerDay||0)>0?(buf.currentUnits||0)/(buf.unitsPerDay||1):Infinity;
                          return(
                            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                              <span style={{fontSize:11,color:"#888"}}>Per dose: <strong style={{color:"#cfb86f"}}>{fmtCost(cpU)}</strong></span>
                              <span style={{fontSize:11,color:"#888"}}>Per week: <strong style={{color:"#cfb86f"}}>{fmtCost(cpD*7)}</strong></span>
                              <span style={{fontSize:11,color:"#888"}}>Per month: <strong style={{color:"#cfb86f"}}>{fmtCost(cpD*30)}</strong></span>
                              <span style={{fontSize:11,color:"#888"}}>Runway: <strong style={{color:runwayColor(dLeft/7)}}>{isFinite(dLeft)?`${(dLeft/7).toFixed(1)} wks`:"∞"}</strong></span>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    {/* Save/cancel */}
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={saveEdit} style={{flex:2,padding:"10px",background:"#1a2f1a",border:"1px solid #2d5a2d",borderRadius:6,color:"#6fcf6f",fontSize:12,fontWeight:700,cursor:"pointer"}}>✓ Save</button>
                      <button onClick={cancelEdit} style={{flex:1,padding:"10px",background:"#1a1a1a",border:"1px solid #222",borderRadius:6,color:"#666",fontSize:12,cursor:"pointer"}}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CYCLES PAGE ───
function CyclesPage(){
  const[tab,setTab]=useState<"maint"|"cycles">("maint");
  const[expanded,setExpanded]=useState<string|null>(null);
  const today=todayStr();

  // Convex
  const cyclesRaw=useQuery(api.protocol.getCycles)??[];
  const maintRaw=useQuery(api.protocol.getMaintenance)??[];
  const cvxStartCycle=useMutation(api.protocol.startCycle);
  const cvxEndCycle=useMutation(api.protocol.endCycle);
  const cvxDelCycle=useMutation(api.protocol.deleteCycle);
  const cvxStartMaint=useMutation(api.protocol.startMaintenance);
  const cvxStopMaint=useMutation(api.protocol.stopMaintenance);

  type CycleRow = typeof cyclesRaw[number];
  type MaintRow = typeof maintRaw[number];

  // ─── MAINTENANCE ───
  const getMaint=(name:string)=>maintRaw.find((m:MaintRow)=>m.substanceName===name&&!m.endDate);
  const startMaint=(name:string)=>cvxStartMaint({substanceName:name,startDate:today});
  const stopMaint=(name:string)=>cvxStopMaint({substanceName:name,endDate:today});
  const getMaintHistory=(name:string)=>[...maintRaw.filter((m:MaintRow)=>m.substanceName===name)].sort((a,b)=>b.startDate.localeCompare(a.startDate));

  // ─── CYCLES ───
  const getActiveCycle=(name:string)=>[...cyclesRaw.filter((c:CycleRow)=>c.substanceName===name)].sort((a,b)=>b.startDate.localeCompare(a.startDate))[0] as CycleRow|undefined;
  const getCycleHistory=(name:string)=>[...cyclesRaw.filter((c:CycleRow)=>c.substanceName===name)].sort((a,b)=>b.startDate.localeCompare(a.startDate));
  const startCycle=(name:string,phase:"on"|"off")=>cvxStartCycle({substanceName:name,phase,startDate:today});
  const endCycle=(id:Id<"cycles">)=>cvxEndCycle({id,endDate:today});
  const delCycle=(id:Id<"cycles">)=>cvxDelCycle({id});

  return(
    <div style={{padding:"0 0 40px"}}>
      {/* Sub-tabs */}
      <div style={{display:"flex",borderBottom:"1px solid #1f1f1f",background:"#0d0d0d"}}>
        {[{id:"maint",label:"MAINTENANCE",sub:`${maintRaw.filter((m:{endDate?:string})=>!m.endDate).length} active`},{id:"cycles",label:"SPECIFIC CYCLES",sub:`${cyclesRaw.filter((c:{endDate?:string})=>!c.endDate).length} active`}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as "maint"|"cycles")} style={{flex:1,padding:"12px 8px",background:"none",border:"none",borderBottom:tab===t.id?"2px solid #fff":"2px solid transparent",color:tab===t.id?"#fff":"#555",cursor:"pointer"}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.06em"}}>{t.label}</div>
            <div style={{fontSize:9,color:tab===t.id?"#888":"#3a3a3a",marginTop:2}}>{t.sub}</div>
          </button>
        ))}
      </div>

      {tab==="maint"&&(
        <div style={{padding:"16px 12px 0"}}>
          <div style={{fontSize:11,color:"#555",lineHeight:1.6,marginBottom:16}}>Track substances you take daily on maintenance. Independent of timed cycles — both can run simultaneously.</div>
          {MAINTENANCE_SUBSTANCES.map(sub=>{
            const active=getMaint(sub.name);
            const history=getMaintHistory(sub.name);
            const daysIn=active?daysBetween(active.startDate,today)+1:0;
            const isExp=expanded===`m_${sub.name}`;
            return(
              <div key={sub.name} style={{marginBottom:8,background:"#111",border:`1px solid ${active?"#1f2f1f":"#1a1a1a"}`,borderRadius:8,overflow:"hidden"}}>
                <div style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:active?sub.color:"#333"}}/>
                      <span style={{fontSize:13,fontWeight:700,color:active?"#e0e0e0":"#666"}}>{sub.name}</span>
                    </div>
                    {active&&<div style={{fontSize:10,color:sub.color,fontWeight:700}}>Day {daysIn}</div>}
                  </div>
                  <div style={{fontSize:10,color:"#555",marginLeft:16,marginBottom:10}}>{sub.note}</div>
                  <div style={{display:"flex",gap:6}}>
                    {!active?(
                      <button onClick={()=>startMaint(sub.name)} style={{flex:1,padding:"8px",background:`${sub.color}15`,border:`1px solid ${sub.color}40`,borderRadius:6,color:sub.color,fontSize:11,fontWeight:700,cursor:"pointer"}}>▶ START MAINTENANCE</button>
                    ):(
                      <button onClick={()=>stopMaint(sub.name)} style={{flex:1,padding:"8px",background:"#2a1a1a",border:"1px solid #5a2d2d",borderRadius:6,color:"#cf6f6f",fontSize:11,fontWeight:700,cursor:"pointer"}}>■ STOP</button>
                    )}
                    {history.length>0&&<button onClick={()=>setExpanded(isExp?null:`m_${sub.name}`)} style={{padding:"8px 12px",background:"#1a1a1a",border:"1px solid #222",borderRadius:6,color:"#555",fontSize:12,cursor:"pointer"}}>{isExp?"▲":"▼"}</button>}
                  </div>
                </div>
                {isExp&&(
                  <div style={{borderTop:"1px solid #1a1a1a",padding:14}}>
                    <div style={{fontSize:9,color:"#444",letterSpacing:"0.1em",marginBottom:8}}>HISTORY</div>
                    {history.map((rec:{_id:string;startDate:string;endDate?:string},i)=>{
                      const dur=rec.endDate?daysBetween(rec.startDate,rec.endDate):daysBetween(rec.startDate,today)+1;
                      return(
                        <div key={rec._id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<history.length-1?"1px solid #141414":"none"}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:rec.endDate?"#333":sub.color,flexShrink:0}}/>
                          <div style={{flex:1}}>
                            <span style={{fontSize:11,color:rec.endDate?"#555":"#ccc",fontWeight:600}}>{rec.endDate?"Past":"Active"}</span>
                            <span style={{fontSize:10,color:"#444",marginLeft:8}}>{formatDate(rec.startDate)} → {rec.endDate?formatDate(rec.endDate):"now"}</span>
                          </div>
                          <span style={{fontSize:11,fontFamily:"monospace",color:"#555"}}>{dur}d</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab==="cycles"&&(
        <div style={{padding:"16px 12px 0"}}>
          <div style={{fontSize:11,color:"#555",lineHeight:1.6,marginBottom:16}}>Track timed on/off cycles. Can run alongside maintenance tracking simultaneously.</div>
          {CYCLED_SUBSTANCES.map(sub=>{
            const active=getActiveCycle(sub.name);
            const history=getCycleHistory(sub.name);
            const isExp=expanded===`c_${sub.name}`;
            const daysIn=active?daysBetween(active.startDate,today)+1:0;
            const targetDays=active?.phase==="on"?(sub.onWeeks?sub.onWeeks*7:null):(sub.offWeeks?sub.offWeeks*7:null);
            const pct=targetDays?Math.min(100,(daysIn/targetDays)*100):null;
            const isOverdue=!!(targetDays&&daysIn>targetDays);
            return(
              <div key={sub.name} style={{marginBottom:8,background:"#111",border:`1px solid ${active&&!active.endDate?(isOverdue?"#5a2d2d":"#1f2f1f"):"#1a1a1a"}`,borderRadius:8,overflow:"hidden"}}>
                <div style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:sub.color}}/>
                        <span style={{fontSize:13,fontWeight:700,color:"#e0e0e0"}}>{sub.name}</span>
                      </div>
                      <div style={{fontSize:10,color:"#555",marginLeft:16}}>{sub.rule}</div>
                    </div>
                    {active&&!active.endDate&&(
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:9,color:isOverdue?"#cf6f6f":sub.color,fontWeight:700,letterSpacing:"0.1em"}}>{active.phase.toUpperCase()} — DAY {daysIn}</div>
                        {targetDays&&<div style={{fontSize:9,color:isOverdue?"#cf6f6f":"#555",marginTop:2}}>{isOverdue?`⚠ ${daysIn-targetDays}d OVERDUE`:`${targetDays-daysIn}d left`}</div>}
                      </div>
                    )}
                  </div>
                  {active&&!active.endDate&&pct!==null&&(
                    <div style={{height:3,background:"#1a1a1a",borderRadius:2,marginBottom:10}}>
                      <div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:isOverdue?"#cf6f6f":sub.color,borderRadius:2}}/>
                    </div>
                  )}
                  <div style={{display:"flex",gap:6}}>
                    {(!active||active.endDate)?(
                      <>
                        <button onClick={()=>startCycle(sub.name,"on")} style={{flex:1,padding:"8px",background:`${sub.color}15`,border:`1px solid ${sub.color}40`,borderRadius:6,color:sub.color,fontSize:11,fontWeight:700,cursor:"pointer"}}>▶ ON</button>
                        {sub.offWeeks&&<button onClick={()=>startCycle(sub.name,"off")} style={{flex:1,padding:"8px",background:"#1a1a1a",border:"1px solid #222",borderRadius:6,color:"#666",fontSize:11,fontWeight:700,cursor:"pointer"}}>◼ BREAK</button>}
                      </>
                    ):(
                      <>
                        <button onClick={()=>endCycle(active._id as Id<"cycles">)} style={{flex:2,padding:"8px",background:"#2a1a1a",border:"1px solid #5a2d2d",borderRadius:6,color:"#cf6f6f",fontSize:11,fontWeight:700,cursor:"pointer"}}>■ END {active.phase.toUpperCase()}</button>
                        {sub.offWeeks&&active.phase==="on"&&<button onClick={()=>startCycle(sub.name,"off")} style={{flex:1,padding:"8px",background:"#1a1a1a",border:"1px solid #222",borderRadius:6,color:"#666",fontSize:11,fontWeight:700,cursor:"pointer"}}>→ BREAK</button>}
                        {active.phase==="off"&&<button onClick={()=>startCycle(sub.name,"on")} style={{flex:1,padding:"8px",background:`${sub.color}15`,border:`1px solid ${sub.color}40`,borderRadius:6,color:sub.color,fontSize:11,fontWeight:700,cursor:"pointer"}}>→ ON</button>}
                      </>
                    )}
                    <button onClick={()=>setExpanded(isExp?null:`c_${sub.name}`)} style={{padding:"8px 12px",background:"#1a1a1a",border:"1px solid #222",borderRadius:6,color:"#555",fontSize:12,cursor:"pointer"}}>{isExp?"▲":"▼"}</button>
                  </div>
                </div>
                {isExp&&(
                  <div style={{borderTop:"1px solid #1a1a1a",padding:14}}>
                    <div style={{fontSize:11,color:"#666",lineHeight:1.6,marginBottom:10}}>{sub.note}</div>
                    {history.length>0&&(
                      <>
                        <div style={{fontSize:9,color:"#444",letterSpacing:"0.1em",marginBottom:8}}>HISTORY</div>
                        {history.map((rec:{_id:string;startDate:string;endDate?:string;phase:string},i)=>{
                          const dur=rec.endDate?daysBetween(rec.startDate,rec.endDate):daysBetween(rec.startDate,today)+1;
                          return(
                            <div key={rec._id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<history.length-1?"1px solid #141414":"none"}}>
                              <div style={{width:6,height:6,borderRadius:"50%",background:rec.phase==="on"?sub.color:"#444",flexShrink:0}}/>
                              <div style={{flex:1}}>
                                <span style={{fontSize:11,color:rec.phase==="on"?"#ccc":"#666",fontWeight:600}}>{rec.phase==="on"?"ON":"BREAK"}</span>
                                <span style={{fontSize:10,color:"#444",marginLeft:8}}>{formatDate(rec.startDate)} → {rec.endDate?formatDate(rec.endDate):"now"}</span>
                              </div>
                              <span style={{fontSize:11,fontFamily:"monospace",color:"#555"}}>{dur}d</span>
                              <button onClick={()=>delCycle(rec._id as Id<"cycles">)} style={{background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:14,padding:"0 2px"}}>×</button>
                            </div>
                          );
                        })}
                      </>
                    )}
                    {history.length===0&&<div style={{fontSize:11,color:"#333",fontStyle:"italic"}}>No history yet.</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── STACKS PAGE ───
const BLANK_ITEM:StackItem={name:"",dose:"",freq:"",source:"",price:"",what:""};
const STACK_COLORS=["#6f8fcf","#6fcfcf","#cf6fcf","#cfcf6f","#6fcf6f","#cf6f6f","#cfb86f","#8f8fcf","#cf8f6f","#8fcf6f"];

function StacksPage(){
  const[view,setView]=useState<"active"|"all"|"ref">("active");
  const[expanded,setExpanded]=useState<string|null>(null);
  const[editing,setEditing]=useState<string|null>(null);
  const[editBuf,setEditBuf]=useState<Partial<UserStack>>({});
  const[showImport,setShowImport]=useState(false);
  const today=todayStr();

  const stacksRaw=useQuery(api.protocol.getStacks)??[];
  const cvxUpsertStack=useMutation(api.protocol.upsertStack);
  const cvxDeleteStack=useMutation(api.protocol.deleteStack);

  // Map to UserStack shape using stackId as local id
  const stacks:UserStack[]=stacksRaw.map(r=>({
    id:(r as {stackId:string}).stackId,
    name:r.name,color:r.color,notes:r.notes,
    items:r.items as StackItem[],
    mode:r.mode as "inactive"|"daily"|"once",
    activeSince:r.activeSince,activeDate:r.activeDate,fromRef:r.fromRef,
  }));

  const upsertStack=(s:UserStack)=>cvxUpsertStack({stackId:s.id,name:s.name,color:s.color,notes:s.notes,items:s.items,mode:s.mode,activeSince:s.activeSince,activeDate:s.activeDate,fromRef:s.fromRef,sortOrder:Date.now()});

  // import from reference
  const importRef=(ref:{name:string;color:string;items:{name:string;dose:string;freq:string;source:string;price:string;what:string}[]})=>{
    const exists=stacks.find(s=>s.fromRef===ref.name||s.name===ref.name);
    if(exists){alert("Already imported.");return;}
    const ns:UserStack={id:`stack_${Date.now()}`,name:ref.name,color:ref.color,notes:"",items:ref.items.map(i=>({...i})),mode:"inactive",fromRef:ref.name};
    upsertStack(ns);
    setShowImport(false);
    setExpanded(ns.id);
  };

  const newStack=()=>{
    const ns:UserStack={id:`stack_${Date.now()}`,name:"New Stack",color:STACK_COLORS[stacks.length%STACK_COLORS.length],notes:"",items:[{...BLANK_ITEM}],mode:"inactive"};
    upsertStack(ns);
    setEditing(ns.id);
    setEditBuf({...ns});
  };

  const saveEdit=()=>{
    if(!editing)return;
    const base=stacks.find(s=>s.id===editing);
    if(base)upsertStack({...base,...editBuf} as UserStack);
    setEditing(null);setEditBuf({});
  };

  const deleteStack=(id:string)=>{
    if(!confirm("Delete this stack?"))return;
    cvxDeleteStack({stackId:id});
    if(expanded===id)setExpanded(null);
  };

  const setMode=(id:string,mode:"inactive"|"daily"|"once")=>{
    const s=stacks.find(x=>x.id===id);
    if(!s)return;
    const updates:Partial<UserStack>={mode};
    if(mode==="daily"&&!s.activeSince)updates.activeSince=today;
    if(mode==="once")updates.activeDate=today;
    if(mode==="inactive"){updates.activeSince=undefined;updates.activeDate=undefined;}
    upsertStack({...s,...updates});
  };

  const activeStacks=stacks.filter(s=>s.mode==="daily"||s.mode==="once");
  const display=view==="active"?activeStacks:view==="all"?stacks:[];

  const modeColor=(m:"inactive"|"daily"|"once")=>m==="daily"?"#6fcf6f":m==="once"?"#cfb86f":"#333";
  const modeLabel=(m:"inactive"|"daily"|"once")=>m==="daily"?"● DAILY ROTATION":m==="once"?"◉ ONE-TIME TODAY":"○ INACTIVE";

  return(
    <div style={{padding:"0 0 60px"}}>
      {/* header */}
      <div style={{background:"#111",borderBottom:"1px solid #1a1a1a",padding:"14px 14px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>STACKS</div>
            <div style={{fontSize:10,color:"#555",marginTop:2}}>{activeStacks.length} active · {stacks.length} total</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setShowImport(v=>!v)} style={{padding:"7px 12px",background:"#1a1a2f",border:"1px solid #3a3a6f",borderRadius:6,color:"#6f8fcf",fontSize:11,fontWeight:700,cursor:"pointer"}}>↓ Import</button>
            <button onClick={newStack} style={{padding:"7px 12px",background:"#1a2f1a",border:"1px solid #2d5a2d",borderRadius:6,color:"#6fcf6f",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ New</button>
          </div>
        </div>

        {/* import panel */}
        {showImport&&(
          <div style={{background:"#0d0d0d",border:"1px solid #222",borderRadius:8,padding:12,marginBottom:12}}>
            <div style={{fontSize:10,color:"#555",letterSpacing:"0.1em",marginBottom:8}}>IMPORT FROM REFERENCE LIBRARY</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {REF_STACKS.filter(r=>!stacks.find(s=>s.fromRef===r.name||s.name===r.name)).map((r,i)=>(
                <button key={i} onClick={()=>importRef(r)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:"#111",border:"1px solid #1f1f1f",borderRadius:6,cursor:"pointer",textAlign:"left"}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:r.color}}>{r.name}</div>
                    <div style={{fontSize:9,color:"#555",marginTop:1}}>{r.items.length} compounds</div>
                  </div>
                  <span style={{color:"#6f8fcf",fontSize:12}}>↓</span>
                </button>
              ))}
              {REF_STACKS.every(r=>stacks.find(s=>s.fromRef===r.name||s.name===r.name))&&<div style={{fontSize:11,color:"#444",fontStyle:"italic",padding:"6px 0"}}>All reference stacks imported.</div>}
            </div>
          </div>
        )}

        {/* sub-tabs */}
        <div style={{display:"flex"}}>
          {[{id:"active",label:"ACTIVE",sub:`${activeStacks.length}`},{id:"all",label:"ALL STACKS",sub:`${stacks.length}`},{id:"ref",label:"REFERENCE",sub:`${REF_STACKS.length}`}].map(t=>(
            <button key={t.id} onClick={()=>setView(t.id as "active"|"all"|"ref")} style={{flex:1,padding:"10px 0",background:"none",border:"none",borderBottom:view===t.id?"2px solid #fff":"2px solid transparent",color:view===t.id?"#fff":"#555",cursor:"pointer"}}>
              <div style={{fontSize:10,fontWeight:800,letterSpacing:"0.06em"}}>{t.label}</div>
              <div style={{fontSize:9,color:view===t.id?"#888":"#333",marginTop:1}}>{t.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── REFERENCE view ─── */}
      {view==="ref"&&(
        <div style={{padding:"12px 12px 0"}}>
          <div style={{fontSize:10,color:"#555",lineHeight:1.6,marginBottom:10}}>Reference library — tap ↓ to import into your stacks and activate.</div>
          {REF_STACKS.map((stack,i)=>{
            const imported=!!stacks.find(s=>s.fromRef===stack.name||s.name===stack.name);
            const isExp=expanded===`ref_${i}`;
            return(
              <div key={i} style={{marginBottom:8}}>
                <div style={{display:"flex",alignItems:"stretch",gap:0}}>
                  <button onClick={()=>setExpanded(isExp?null:`ref_${i}`)} style={{flex:1,textAlign:"left",padding:14,background:"#111",border:`1px solid ${isExp?"#333":"#1a1a1a"}`,borderRadius:isExp?"8px 0 0 0":"8px 0 0 8px",cursor:"pointer"}}>
                    <div style={{fontSize:12,fontWeight:700,color:stack.color,letterSpacing:"0.05em"}}>{stack.name}</div>
                    <div style={{fontSize:9,color:"#555",marginTop:2}}>{stack.items.length} compounds{imported?" · imported":""}</div>
                  </button>
                  <button onClick={()=>imported?undefined:importRef(stack)} style={{padding:"0 14px",background:imported?"#111":"#1a1a2f",border:`1px solid ${isExp?"#333":"#1a1a1a"}`,borderLeft:"1px solid #1a1a1a",borderRadius:isExp?"0 8px 0 0":"0 8px 8px 0",cursor:imported?"default":"pointer",color:imported?"#333":"#6f8fcf",fontSize:12,fontWeight:700}}>
                    {imported?"✓":"↓"}
                  </button>
                </div>
                {isExp&&(
                  <div style={{background:"#0d0d0d",border:"1px solid #333",borderTop:"none",borderRadius:"0 0 8px 8px",padding:12}}>
                    {stack.items.map((item,ii)=>(
                      <div key={ii} style={{padding:"9px 0",borderBottom:ii<stack.items.length-1?"1px solid #141414":"none"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                          <span style={{fontSize:12,fontWeight:700,color:"#e0e0e0"}}>{item.name}</span>
                          <span style={{fontSize:9,color:"#666"}}>{item.price}</span>
                        </div>
                        {(item.dose||item.freq)&&<div style={{display:"flex",gap:10,marginBottom:2}}>{item.dose&&<span style={{fontSize:10,color:stack.color}}>{item.dose}</span>}{item.freq&&item.freq!=="Stack"&&<span style={{fontSize:10,color:"#888"}}>{item.freq}</span>}</div>}
                        {item.what&&<div style={{fontSize:10,color:"#555",lineHeight:1.4}}>{item.what}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── ACTIVE / ALL view ─── */}
      {view!=="ref"&&(
        <div style={{padding:"12px 12px 0"}}>
          {display.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:"#333",fontSize:12,fontStyle:"italic"}}>{view==="active"?"No active stacks. Import or activate one below.":"No stacks yet. Import from reference or create new."}</div>}
          {display.map(stack=>{
            const isExp=expanded===stack.id;
            const isEdit=editing===stack.id;
            const buf=isEdit?editBuf:stack;
            return(
              <div key={stack.id} style={{marginBottom:8,background:"#111",border:`1px solid ${stack.mode!=="inactive"?"#2a2a1a":"#1a1a1a"}`,borderRadius:8,overflow:"hidden"}}>
                {/* Header */}
                <div style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:stack.color,flexShrink:0}}/>
                        <span style={{fontSize:13,fontWeight:700,color:"#e0e0e0"}}>{stack.name}</span>
                        {stack.fromRef&&<span style={{fontSize:8,color:"#444",border:"1px solid #2a2a2a",padding:"1px 5px",borderRadius:2}}>REF</span>}
                      </div>
                      <div style={{fontSize:9,color:modeColor(stack.mode),marginLeft:16,letterSpacing:"0.08em",fontWeight:600}}>{modeLabel(stack.mode)}</div>
                    </div>
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={()=>{setEditing(stack.id);setEditBuf({...stack});setExpanded(null);}} style={{padding:"5px 8px",background:"#1a1a1a",border:"1px solid #222",borderRadius:5,color:"#555",fontSize:11,cursor:"pointer"}}>✎</button>
                      <button onClick={()=>deleteStack(stack.id)} style={{padding:"5px 8px",background:"#1a1a1a",border:"1px solid #222",borderRadius:5,color:"#444",fontSize:11,cursor:"pointer"}}>×</button>
                    </div>
                  </div>

                  {/* Mode buttons */}
                  {!isEdit&&(
                    <div style={{display:"flex",gap:5,marginBottom:8}}>
                      <button onClick={()=>setMode(stack.id,"daily")} style={{flex:1,padding:"7px 4px",background:stack.mode==="daily"?"#1a2f1a":"#111",border:`1px solid ${stack.mode==="daily"?"#2d5a2d":"#222"}`,borderRadius:5,color:stack.mode==="daily"?"#6fcf6f":"#555",fontSize:9,fontWeight:700,cursor:"pointer",letterSpacing:"0.05em"}}>● DAILY</button>
                      <button onClick={()=>setMode(stack.id,"once")} style={{flex:1,padding:"7px 4px",background:stack.mode==="once"?"#2f2a1a":"#111",border:`1px solid ${stack.mode==="once"?"#5a4d2d":"#222"}`,borderRadius:5,color:stack.mode==="once"?"#cfb86f":"#555",fontSize:9,fontWeight:700,cursor:"pointer",letterSpacing:"0.05em"}}>◉ TODAY</button>
                      <button onClick={()=>setMode(stack.id,"inactive")} style={{flex:1,padding:"7px 4px",background:stack.mode==="inactive"?"#1a1a1a":"#111",border:`1px solid ${stack.mode==="inactive"?"#333":"#222"}`,borderRadius:5,color:stack.mode==="inactive"?"#888":"#444",fontSize:9,fontWeight:700,cursor:"pointer",letterSpacing:"0.05em"}}>○ OFF</button>
                      <button onClick={()=>setExpanded(isExp?null:stack.id)} style={{padding:"7px 10px",background:"#0d0d0d",border:"1px solid #222",borderRadius:5,color:"#555",fontSize:12,cursor:"pointer"}}>{isExp?"▲":"▼"}</button>
                    </div>
                  )}

                  {stack.notes&&!isEdit&&<div style={{fontSize:11,color:"#888",lineHeight:1.5,background:"#0d0d0d",borderRadius:4,padding:"6px 10px",marginBottom:4}}>{stack.notes}</div>}
                  {stack.mode==="daily"&&stack.activeSince&&!isEdit&&<div style={{fontSize:9,color:"#555",marginTop:4}}>Active since {formatDate(stack.activeSince)}</div>}
                </div>

                {/* Expanded items */}
                {isExp&&!isEdit&&(
                  <div style={{borderTop:"1px solid #1a1a1a",padding:"12px 14px"}}>
                    {stack.items.map((item,ii)=>(
                      <div key={ii} style={{padding:"8px 0",borderBottom:ii<stack.items.length-1?"1px solid #141414":"none"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                          <span style={{fontSize:12,fontWeight:700,color:"#e0e0e0"}}>{item.name}</span>
                          {item.price&&<span style={{fontSize:9,color:"#555"}}>{item.price}</span>}
                        </div>
                        {(item.dose||item.freq)&&<div style={{display:"flex",gap:10,marginBottom:2}}>{item.dose&&<span style={{fontSize:10,color:stack.color}}>{item.dose}</span>}{item.freq&&item.freq!=="Stack"&&<span style={{fontSize:10,color:"#888"}}>{item.freq}</span>}</div>}
                        {item.what&&<div style={{fontSize:10,color:"#555",lineHeight:1.4}}>{item.what}</div>}
                        {item.source&&<div style={{fontSize:9,color:"#3a3a3a",marginTop:1}}>Source: {item.source}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Edit form */}
                {isEdit&&(
                  <div style={{borderTop:"1px solid #1f1f1f",padding:14,background:"#0d0d0d"}}>
                    {/* Name + color */}
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>STACK NAME</div>
                      <input value={buf.name||""} onChange={e=>setEditBuf(p=>({...p,name:e.target.value}))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,padding:"8px 10px",color:"#fff",fontSize:14,fontWeight:700,outline:"none"}}/>
                    </div>
                    {/* Color picker */}
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>COLOR</div>
                      <div style={{display:"flex",gap:6}}>
                        {STACK_COLORS.map(c=>(
                          <div key={c} onClick={()=>setEditBuf(p=>({...p,color:c}))} style={{width:24,height:24,borderRadius:"50%",background:c,cursor:"pointer",border:(buf.color||stack.color)===c?"2px solid #fff":"2px solid transparent",opacity:(buf.color||stack.color)===c?1:0.5}}/>
                        ))}
                      </div>
                    </div>
                    {/* Notes */}
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>NOTES / WHEN TO USE</div>
                      <textarea value={buf.notes||""} onChange={e=>setEditBuf(p=>({...p,notes:e.target.value}))} placeholder="e.g. Deep work mornings only, 2x/week max..." style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,padding:"8px 10px",color:"#b0b0b0",fontSize:12,outline:"none",resize:"none",minHeight:52,fontFamily:"inherit"}}/>
                    </div>
                    {/* Items */}
                    <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:6}}>COMPOUNDS ({(buf.items||[]).length})</div>
                    {(buf.items||[]).map((item,ii)=>(
                      <div key={ii} style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:6,padding:10,marginBottom:6}}>
                        <div style={{display:"flex",gap:6,marginBottom:6}}>
                          <input value={item.name} onChange={e=>setEditBuf(p=>({...p,items:p.items?.map((it,idx)=>idx===ii?{...it,name:e.target.value}:it)||[]}))} placeholder="Name" style={{flex:2,background:"#0d0d0d",border:"1px solid #222",borderRadius:4,padding:"6px 8px",color:"#fff",fontSize:12,outline:"none"}}/>
                          <input value={item.dose} onChange={e=>setEditBuf(p=>({...p,items:p.items?.map((it,idx)=>idx===ii?{...it,dose:e.target.value}:it)||[]}))} placeholder="Dose" style={{flex:1,background:"#0d0d0d",border:"1px solid #222",borderRadius:4,padding:"6px 8px",color:"#cfb86f",fontSize:12,outline:"none"}}/>
                        </div>
                        <div style={{display:"flex",gap:6,marginBottom:6}}>
                          <input value={item.freq} onChange={e=>setEditBuf(p=>({...p,items:p.items?.map((it,idx)=>idx===ii?{...it,freq:e.target.value}:it)||[]}))} placeholder="Frequency" style={{flex:1,background:"#0d0d0d",border:"1px solid #222",borderRadius:4,padding:"6px 8px",color:"#888",fontSize:12,outline:"none"}}/>
                          <input value={item.source} onChange={e=>setEditBuf(p=>({...p,items:p.items?.map((it,idx)=>idx===ii?{...it,source:e.target.value}:it)||[]}))} placeholder="Source" style={{flex:1,background:"#0d0d0d",border:"1px solid #222",borderRadius:4,padding:"6px 8px",color:"#888",fontSize:12,outline:"none"}}/>
                          <input value={item.price} onChange={e=>setEditBuf(p=>({...p,items:p.items?.map((it,idx)=>idx===ii?{...it,price:e.target.value}:it)||[]}))} placeholder="$" style={{width:56,background:"#0d0d0d",border:"1px solid #222",borderRadius:4,padding:"6px 8px",color:"#888",fontSize:12,outline:"none"}}/>
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          <input value={item.what} onChange={e=>setEditBuf(p=>({...p,items:p.items?.map((it,idx)=>idx===ii?{...it,what:e.target.value}:it)||[]}))} placeholder="What it does..." style={{flex:1,background:"#0d0d0d",border:"1px solid #222",borderRadius:4,padding:"6px 8px",color:"#555",fontSize:12,outline:"none"}}/>
                          <button onClick={()=>setEditBuf(p=>({...p,items:p.items?.filter((_,idx)=>idx!==ii)||[]}))} style={{padding:"6px 10px",background:"#1a1010",border:"1px solid #3a1a1a",borderRadius:4,color:"#cf6f6f",fontSize:12,cursor:"pointer"}}>×</button>
                        </div>
                      </div>
                    ))}
                    <button onClick={()=>setEditBuf(p=>({...p,items:[...(p.items||[]),{...BLANK_ITEM}]}))} style={{width:"100%",padding:"8px",background:"#0d0d0d",border:"1px dashed #222",borderRadius:6,color:"#555",fontSize:11,cursor:"pointer",marginBottom:10}}>+ Add compound</button>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={saveEdit} style={{flex:2,padding:"10px",background:"#1a2f1a",border:"1px solid #2d5a2d",borderRadius:6,color:"#6fcf6f",fontSize:12,fontWeight:700,cursor:"pointer"}}>✓ Save</button>
                      <button onClick={()=>{setEditing(null);setEditBuf({});}} style={{flex:1,padding:"10px",background:"#1a1a1a",border:"1px solid #222",borderRadius:6,color:"#666",fontSize:12,cursor:"pointer"}}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MAIN ───
export default function DailyProtocol(){
  const[page,setPage]=useState("schedule");
  const[phase,setPhase]=useState("reset");
  const[dayType,setDayType]=useState("lift");

  const today=todayStr();
  const checkKey=`${today}_${phase}_${dayType}`;
  const todayChecksRaw=useQuery(api.protocol.getChecks,{checkKey})??{};
  const cvxToggleCheck=useMutation(api.protocol.toggleCheck);
  const todayChecks:Record<string,boolean>=todayChecksRaw as Record<string,boolean>;
  const toggleCheck=(k:string)=>cvxToggleCheck({checkKey,itemKey:k,done:!todayChecks[k]});

  // For schedule active stacks banner
  const stacksRaw=useQuery(api.protocol.getStacks)??[];
  const activeStacksToday=stacksRaw.filter(s=>s.mode==="daily"||(s.mode==="once"&&s.activeDate===today));

  const sched:Record<string,Record<string,Block[]>>={reset:{lift:RESET_LIFT as Block[],ruck:RESET_RUCK as Block[]},post:{lift:POST_LIFT as Block[],ruck:POST_RUCK as Block[]}};
  const schedule=sched[phase][dayType];
  const rules=phase==="reset"?RESET_RULES:POST_RULES;
  const totals=dayType==="lift"?{cal:"2,219",p:"172g",c:"246g",f:"50g"}:{cal:"1,896",p:"170g",c:"168g",f:"50g"};
  const totalItems=schedule.reduce((a,b)=>a+b.items.length,0);
  const doneItems=schedule.reduce((a,b)=>a+b.items.filter(item=>todayChecks[`${b.label}__${item}`]).length,0);
  const pctDone=totalItems?Math.round((doneItems/totalItems)*100):0;

  const TABS=[{id:"schedule",label:"SCHED"},{id:"track",label:"LOG"},{id:"cycles",label:"CYCLES"},{id:"supply",label:"SUPPLY"},{id:"supps",label:"STACKS"}];

  return(
    <div style={{minHeight:"100vh",background:"#0d0d0d",color:"#e0e0e0",fontFamily:"-apple-system, BlinkMacSystemFont, sans-serif"}}>
      {/* Nav */}
      <div style={{display:"flex",borderBottom:"1px solid #1f1f1f",position:"sticky",top:0,zIndex:20,background:"#0d0d0d"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setPage(t.id)} style={{flex:1,padding:"12px 0",background:"none",border:"none",borderBottom:page===t.id?"2px solid #fff":"2px solid transparent",color:page===t.id?"#fff":"#555",cursor:"pointer",fontSize:9,fontWeight:800,letterSpacing:"0.07em"}}>
            {t.label}
            {t.id==="schedule"&&doneItems>0&&<div style={{fontSize:7,color:pctDone===100?"#6fcf6f":"#666",marginTop:1}}>{pctDone}%</div>}
          </button>
        ))}
      </div>

      {/* ─── SCHEDULE ─── */}
      {page==="schedule"&&(
        <>
          <div style={{background:"linear-gradient(180deg,#141414 0%,#0d0d0d 100%)",borderBottom:"1px solid #1f1f1f",padding:"16px 16px 0"}}>
            {/* Phase */}
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {[{id:"reset",label:"DOPAMINE RESET",sub:"Weeks 1–4",bg:"#1a1a2f",bd:"#3a3a6f"},{id:"post",label:"MAINTENANCE",sub:"Week 5+",bg:"#1a2f1a",bd:"#2d5a2d"}].map(p=>(
                <button key={p.id} onClick={()=>setPhase(p.id)} style={{flex:1,padding:"10px 8px",borderRadius:8,cursor:"pointer",background:phase===p.id?p.bg:"#111",border:`1px solid ${phase===p.id?p.bd:"#1f1f1f"}`,color:phase===p.id?"#fff":"#555"}}>
                  <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.08em"}}>{p.label}</div>
                  <div style={{fontSize:9,color:phase===p.id?"#888":"#3a3a3a",marginTop:2}}>{p.sub}</div>
                </button>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:12}}>
              <div>
                <div style={{fontSize:9,color:"#555",letterSpacing:"0.15em",marginBottom:3}}>{phase==="reset"?"WEEKS 1–4":"WEEK 5+"}</div>
                <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>{dayType==="lift"?"LIFT + RUCK":"RUCK ONLY"}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em"}}>WAKE</div>
                <div style={{fontSize:18,fontWeight:700,fontFamily:"monospace",color:"#fff"}}>{dayType==="lift"?"5:15":"6:00"}</div>
              </div>
            </div>
            <div style={{display:"flex"}}>
              {[{id:"lift",label:"LIFT DAY",sub:"Mon Tue Thu Fri"},{id:"ruck",label:"RUCK DAY",sub:"Wed Sat Sun"}].map(t=>(
                <button key={t.id} onClick={()=>setDayType(t.id)} style={{flex:1,padding:"10px 0 12px",background:"none",border:"none",borderBottom:dayType===t.id?"2px solid #e0e0e0":"2px solid transparent",color:dayType===t.id?"#fff":"#555",cursor:"pointer"}}>
                  <div style={{fontSize:12,fontWeight:700,letterSpacing:"0.05em"}}>{t.label}</div>
                  <div style={{fontSize:9,color:dayType===t.id?"#888":"#3a3a3a",marginTop:2}}>{t.sub}</div>
                </button>
              ))}
            </div>
          </div>
          {/* Progress + Macros */}
          <div style={{background:"#111",borderBottom:"1px solid #1a1a1a"}}>
            <div style={{height:3,background:"#1a1a1a"}}>
              <div style={{height:"100%",width:`${pctDone}%`,background:pctDone===100?"#6fcf6f":"#3a5a3a",transition:"width 0.3s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-around",padding:"10px 16px"}}>
              {[{l:"CAL",v:totals.cal,c:"#fff"},{l:"PRO",v:totals.p,c:"#6fcf6f"},{l:"CARB",v:totals.c,c:"#cfb86f"},{l:"FAT",v:totals.f,c:"#cf6f6f"}].map(m=>(
                <div key={m.l} style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:"#555",letterSpacing:"0.15em",marginBottom:2}}>{m.l}</div>
                  <div style={{fontSize:15,fontWeight:800,color:m.c,fontFamily:"monospace"}}>{m.v}</div>
                </div>
              ))}
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:9,color:"#555",letterSpacing:"0.15em",marginBottom:2}}>DONE</div>
                <div style={{fontSize:15,fontWeight:800,color:pctDone===100?"#6fcf6f":"#888",fontFamily:"monospace"}}>{pctDone}%</div>
              </div>
            </div>
          </div>
          {/* Active stacks banner */}
          {(()=>{
            const activeToday=activeStacksToday;
            if(!activeToday.length)return null;
            return(
              <div style={{margin:"12px 16px 0",background:"#141a14",border:"1px solid #2a3a2a",borderRadius:8,padding:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontSize:9,color:"#6fcf6f",letterSpacing:"0.12em",fontWeight:700}}>ACTIVE STACKS TODAY</div>
                  <button onClick={()=>setPage("supps")} style={{background:"none",border:"none",color:"#555",fontSize:10,cursor:"pointer",padding:0}}>manage →</button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {activeToday.map(s=>(
                    <div key={(s as {stackId:string}).stackId} style={{background:"#0d0d0d",border:`1px solid ${s.color}30`,borderRadius:6,padding:"8px 10px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:(s.items as StackItem[]).length?4:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:s.color}}/>
                          <span style={{fontSize:12,fontWeight:700,color:"#e0e0e0"}}>{s.name}</span>
                        </div>
                        <span style={{fontSize:8,color:s.mode==="daily"?"#6fcf6f":"#cfb86f",fontWeight:700,letterSpacing:"0.1em"}}>{s.mode==="daily"?"DAILY":"TODAY"}</span>
                      </div>
                      {(s.items as StackItem[]).length>0&&(
                        <div style={{display:"flex",flexWrap:"wrap",gap:"2px 8px",marginLeft:12}}>
                          {(s.items as StackItem[]).filter(i=>i.name).map((it,ii)=>(
                            <span key={ii} style={{fontSize:10,color:"#888"}}>{it.name}{it.dose?` ${it.dose}`:""}</span>
                          ))}
                        </div>
                      )}
                      {s.notes&&<div style={{fontSize:10,color:"#555",marginTop:4,marginLeft:12,fontStyle:"italic"}}>{s.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          {/* Schedule blocks */}
          <div style={{padding:"20px 16px"}}>
            {schedule.map((b,i)=><ScheduleBlock key={`${phase}-${dayType}-${i}`} block={b} checks={todayChecks} onToggle={toggleCheck}/>)}
          </div>
          {/* Weekly */}
          <div style={{padding:"0 16px 16px"}}>
            <div style={{fontSize:10,color:"#555",letterSpacing:"0.15em",marginBottom:10}}>WEEKLY OVERVIEW</div>
            <div style={{display:"flex",gap:4}}>
              {WEEKLY.map(d=>(
                <div key={d.day} style={{flex:1,borderRadius:6,padding:"8px 4px",textAlign:"center",background:d.type==="lift"?"#111828":"#0d1a0d",border:`1px solid ${d.type==="lift"?"#1e2d4a":"#1a2f1a"}`}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#ccc",marginBottom:4}}>{d.day}</div>
                  <div style={{fontSize:8,color:d.type==="lift"?"#6f8fcf":"#6fcf6f",textTransform:"uppercase",letterSpacing:"0.1em"}}>{d.type}</div>
                  {d.reta&&<div style={{fontSize:7,color:"#cf6f6f",fontWeight:700,marginTop:3,letterSpacing:"0.1em"}}>RETA</div>}
                  {d.ghk&&<div style={{fontSize:7,color:"#8f8fcf",fontWeight:700,marginTop:2,letterSpacing:"0.1em"}}>GHK</div>}
                </div>
              ))}
            </div>
          </div>
          {/* Info cards */}
          {[{bg:"#1a1215",border:"#3a1a1a",tc:"#cf6f6f",title:"RETATRUTIDE — Mon / Wed / Fri Evening",text:"4mg/week split into ~1.33mg SubQ x3 evening injections. Appetite suppressed — hit protein first."},{bg:"#1a1520",border:"#2a1a3a",tc:"#8f8fcf",title:"GH & GHK-Cu",text:"GH 2 IU SubQ daily before bed. GHK-Cu 2mg SubQ Mon–Fri before bed (skip weekends)."},{bg:"#14140d",border:"#2a2a1a",tc:"#cfb86f",title:"SEMAX & SELANK — Nasal Spray",text:"Reconstitute 5mg vial + 2.5ml bac water = 2mg/ml. Each 0.1ml spray = 200mcg. Store in fridge. Use within 30 days."},{bg:"#14140d",border:"#2a2a1a",tc:"#cfb86f",title:"BROMANTANE — 5g Supply",text:"100mg/day = 50 days. Weigh with Gemini-20 milligram scale."}].map((c,i)=>(
            <div key={i} style={{margin:"0 16px 12px",background:c.bg,border:`1px solid ${c.border}`,borderRadius:8,padding:14}}>
              <div style={{fontSize:11,fontWeight:700,color:c.tc,marginBottom:6,letterSpacing:"0.05em"}}>{c.title}</div>
              <div style={{fontSize:12,color:"#999",lineHeight:1.6}}>{c.text}</div>
            </div>
          ))}
          {phase==="reset"&&<div style={{margin:"0 16px 12px",background:"#0d1414",border:"1px solid #1a2a2a",borderRadius:8,padding:14}}><div style={{fontSize:11,fontWeight:700,color:"#6fcfcf",marginBottom:6,letterSpacing:"0.05em"}}>WEDNESDAY FAST (OPTIONAL)</div><div style={{fontSize:12,color:"#999",lineHeight:1.6}}>Last meal Tue 6PM → Break fast Wed 6PM with steak & potato. Water, black coffee, electrolytes only.</div></div>}
          {phase==="post"&&<div style={{margin:"0 16px 12px",background:"#0d140d",border:"1px solid #1a2f1a",borderRadius:8,padding:14}}><div style={{fontSize:11,fontWeight:700,color:"#6fcf6f",marginBottom:8,letterSpacing:"0.05em"}}>WHAT CHANGED FROM RESET</div>{[{t:"DROPPED: 9-me-BC — cycle complete",c:"#cf6f6f"},{t:"DROPPED: BPC-157 every 4 hrs",c:"#cf6f6f"},{t:"KEPT: Bromantane, Semax, Selank, Thiamine, Mag, Creatine, GH, GHK-Cu",c:"#999"},{t:"KEPT: Cordyceps, Polygala, Agmatine (cycle 8on/2off)",c:"#999"},{t:"ADDED: Sabroxy + Dynamine as-needed",c:"#cf6fcf"}].map((item,i)=><div key={i} style={{fontSize:11,color:item.c,lineHeight:1.7}}>{item.t}</div>)}</div>}
          {/* Rules */}
          <div style={{padding:"8px 16px 40px"}}>
            <div style={{fontSize:10,color:"#555",letterSpacing:"0.15em",marginBottom:10}}>RULES — {phase==="reset"?"RESET PHASE":"MAINTENANCE PHASE"}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {rules.map((rule,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{fontSize:10,fontWeight:800,color:"#333",fontFamily:"monospace",minWidth:18,paddingTop:2}}>{String(i+1).padStart(2,"0")}</span>
                  <span style={{fontSize:12,color:"#999",lineHeight:1.5}}>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {page==="track"&&<TrackPage/>}
      {page==="cycles"&&<CyclesPage/>}
      {page==="supply"&&<SupplyPage/>}
      {page==="supps"&&<StacksPage/>}
    </div>
  );
}