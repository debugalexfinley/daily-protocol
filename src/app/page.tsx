"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

// ═══════════════════════════════════════════════════════════
// SCHEDULE CONSTANTS
// ═══════════════════════════════════════════════════════════

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

const REF_STACKS=[
  {name:"ADDERALL STACK (FOCUS)",color:"#cf6fcf",items:[
    {compoundName:"Sabroxy (10% Oroxylin A)",dose:"100–500mg",freq:"Up to 2x/day",notes:"Dopamine reuptake inhibitor — natural Ritalin analog"},
    {compoundName:"Polygala Tenuifolia 20:1",dose:"100mg sublingual",freq:"Up to 3x/day",notes:"BDNF enhancer, dopamine potentiator"},
    {compoundName:"4'-DMA-7,8-DHF",dose:"10mg sublingual",freq:"Daily",notes:"TrkB agonist — mimics BDNF signaling"},
    {compoundName:"Cognance (Enhanced Bacopa)",dose:"200mg",freq:"Daily",notes:"Acetylcholine optimization, memory consolidation"},
    {compoundName:"CDP Choline (Citicoline)",dose:"250mg",freq:"Up to 2x/day",notes:"Choline + cytidine for acetylcholine and membrane repair"},
  ]},
  {name:"ANTI-INFLAMMATION STACK",color:"#6fcf6f",items:[
    {compoundName:"NAC (N-Acetyl Cysteine)",dose:"600–1000mg",freq:"2x/day",notes:"Glutathione precursor, liver detox, mucolytic"},
    {compoundName:"R-Lipoic Acid",dose:"240–480mg",freq:"2x/day",notes:"Mitochondrial antioxidant, blood sugar regulation"},
    {compoundName:"Vitamin C",dose:"1000mg",freq:"2x/day",notes:"Immune support, collagen synthesis, antioxidant"},
    {compoundName:"EPA Omega 3 (Fish Oil)",dose:"1–5g",freq:"2x/day",notes:"Anti-inflammatory, cardiovascular, brain health"},
    {compoundName:"TUDCA",dose:"250mg",freq:"2x/day",notes:"Bile acid, liver protection, ER stress reduction"},
    {compoundName:"Black Seed Oil",dose:"1 Tbsp",freq:"2x/day",notes:"Thymoquinone — anti-inflammatory, immune modulator"},
    {compoundName:"Magnesium",dose:"300–500mg",freq:"With each meal",notes:"300+ enzyme reactions, sleep, muscle, nerve function"},
  ]},
  {name:"HEART HEALTH STACK",color:"#cf6f6f",items:[
    {compoundName:"Ubiquinol CoQ10",dose:"Per label",freq:"Daily",notes:"Mitochondrial electron transport, heart energy"},
    {compoundName:"Nattokinase",dose:"8–10k FU/day",freq:"4k AM + 4k PM",notes:"Fibrinolytic enzyme — breaks down blood clots"},
    {compoundName:"Carditone",dose:"Per label",freq:"Daily",notes:"Ayurvedic BP support — rauwolfia + magnesium"},
    {compoundName:"Aged Garlic Extract",dose:"Per label",freq:"Daily",notes:"BP reduction, arterial flexibility"},
    {compoundName:"Magnesium Glycinate",dose:"Per label",freq:"1–2 servings/meal",notes:"Lowers BP significantly, best absorbed form"},
    {compoundName:"Cialis (Tadalafil)",dose:"5mg",freq:"Daily",notes:"PDE5 inhibitor — vascular health, BP support"},
  ]},
  {name:"MEMORY STACK",color:"#cfb86f",items:[
    {compoundName:"Nobiletin",dose:"Per label",freq:"Daily",notes:"Citrus flavonoid — circadian clock modulator, neuroprotective"},
    {compoundName:"Ginkgo Biloba",dose:"120mg",freq:"Daily",notes:"Cerebral blood flow, antioxidant"},
    {compoundName:"Huperzine A",dose:"Per label",freq:"Daily",notes:"Acetylcholinesterase inhibitor — boosts ACh levels"},
    {compoundName:"Lion's Mane Extract",dose:"Per label",freq:"Daily",notes:"NGF stimulation, neurogenesis"},
    {compoundName:"Glycine",dose:"Per label",freq:"Daily",notes:"Inhibitory neurotransmitter, sleep quality, collagen"},
    {compoundName:"Magnesium L-Threonate",dose:"Per label",freq:"Daily",notes:"Crosses BBB — brain magnesium, synaptic density"},
  ]},
  {name:"WEIGHT LOSS STACK",color:"#6fcfcf",items:[
    {compoundName:"Retatrutide",dose:"2mg SubQ",freq:"3x/week",notes:"Triple agonist GLP-1/GIP/glucagon — appetite + metabolic"},
    {compoundName:"Psyllium Husk",dose:"5–10g in 1L water",freq:"15 min before meals",notes:"Soluble fiber — satiety, glucose buffering"},
    {compoundName:"L-Carnitine",dose:"4g",freq:"AM",notes:"Fatty acid transport into mitochondria"},
    {compoundName:"Tongkat Ali",dose:"Per label",freq:"Daily",notes:"Testosterone, cortisol modulation"},
  ]},
  {name:"CHOLINERGIC — Memory & Focus",color:"#6fcfcf",items:[
    {compoundName:"CDP-Choline (Citicoline)",dose:"250–1000mg",freq:"Daily driver",notes:"Choline source — increases choline stores for improved cognition."},
    {compoundName:"Alpha-GPC",dose:"300–1200mg",freq:"1–2x/week (depletes stores)",notes:"Choline source + release. Depletes natural stores — cycle."},
    {compoundName:"Huperzine A",dose:"100–400mcg",freq:"Cycle",notes:"Strongest OTC acetylcholinesterase inhibitor"},
    {compoundName:"Bacopa Monnieri",dose:"Per label",freq:"Daily",notes:"AChE inhibitor — anti-inflammatory in brain"},
    {compoundName:"Nicotine",dose:"1–9mg",freq:"As needed",notes:"Cholinergic + dopaminergic. Acute focus."},
  ]},
  {name:"DOPAMINERGIC — Drive & Motivation",color:"#cf6fcf",items:[
    {compoundName:"Mucuna Pruriens",dose:"100–800mg",freq:"2x/week max",notes:"L-DOPA source — direct dopamine precursor. Tolerance builds fast."},
    {compoundName:"L-Tyrosine",dose:"500–5000mg",freq:"Daily OK",notes:"Building blocks for dopamine. Can use everyday."},
    {compoundName:"Caffeine",dose:"50–400mg",freq:"Daily",notes:"Adenosine antagonist, indirect dopamine boost"},
    {compoundName:"DMAA",dose:"10–100mg",freq:"2x/week MAX",notes:"Extremely potent stimulant — euphoric, focused, unreal energy. Limit use."},
  ]},
  {name:"COMBO: Computer Work / Study",color:"#6f8fcf",items:[
    {compoundName:"Caffeine",dose:"200mg",freq:"Stack",notes:""},
    {compoundName:"L-Theanine",dose:"400mg",freq:"Stack",notes:""},
    {compoundName:"CDP-Choline",dose:"250mg",freq:"Stack",notes:""},
    {compoundName:"Huperzine A",dose:"200mcg",freq:"Stack",notes:""},
    {compoundName:"Rhodiola",dose:"500mg",freq:"Stack",notes:""},
  ]},
  {name:"COMBO: Nuclear Workday (2x/week MAX)",color:"#cf6f6f",items:[
    {compoundName:"CDP-Choline",dose:"500mg",freq:"Stack",notes:""},
    {compoundName:"Alpha-GPC",dose:"600mg",freq:"Stack",notes:""},
    {compoundName:"Caffeine",dose:"400mg",freq:"Stack",notes:""},
    {compoundName:"L-Tyrosine",dose:"5000mg",freq:"Stack",notes:""},
    {compoundName:"L-Theanine",dose:"400–800mg",freq:"Stack",notes:""},
    {compoundName:"Huperzine A",dose:"400mcg",freq:"Stack",notes:""},
    {compoundName:"Methylene Blue",dose:"5–10mg",freq:"Stack",notes:""},
  ]},
  {name:"COMBO: PR Day (1–2x/week)",color:"#cf8f6f",items:[
    {compoundName:"Caffeine",dose:"300mg",freq:"Stack",notes:""},
    {compoundName:"DMAA",dose:"25mg",freq:"Stack",notes:"Limit use"},
    {compoundName:"L-Tyrosine",dose:"5000mg",freq:"Stack",notes:""},
    {compoundName:"Alpha-GPC",dose:"1000mg",freq:"Stack",notes:""},
    {compoundName:"Rhodiola",dose:"1000mg",freq:"Stack",notes:""},
    {compoundName:"Ginkgo Biloba",dose:"240mg",freq:"Stack",notes:""},
  ]},
  {name:"PRE-WORKOUT: Pump / Vasodilators",color:"#cf6f8f",items:[
    {compoundName:"L-Citrulline",dose:"5–10g",freq:"Pre-workout",notes:"Vasodilator — relaxes blood vessels for pumps."},
    {compoundName:"Betaine Anhydrous",dose:"2–5g",freq:"Pre-workout",notes:"Cellular hydration — draws water into muscle"},
    {compoundName:"Glycerol",dose:"2.5–20g",freq:"Pre-workout",notes:"Cellular hydration — hyper-hydrates muscle tissue"},
    {compoundName:"Creatine",dose:"5–15g",freq:"Pre/daily",notes:"Cellular hydration + ATP production"},
  ]},
  {name:"PEPTIDES — Active Protocol",color:"#6fcfcf",items:[
    {compoundName:"BPC-157",dose:"500mcg",freq:"3–4x/day oral (reset phase)",notes:"Gut + systemic repair peptide"},
    {compoundName:"GHK-Cu",dose:"2mg SubQ",freq:"Mon–Fri before bed",notes:"Copper tripeptide — collagen, wound healing"},
    {compoundName:"GH (Growth Hormone)",dose:"2 IU SubQ",freq:"Daily before bed",notes:"IGF-1 stimulation, fat oxidation, tissue repair"},
    {compoundName:"Retatrutide",dose:"~1.33mg SubQ",freq:"Mon/Wed/Fri evening",notes:"Triple agonist GLP-1/GIP/glucagon"},
    {compoundName:"Semax",dose:"300mcg per nostril",freq:"1–2x daily AM",notes:"ACTH analog — BDNF boost, focus"},
    {compoundName:"Selank",dose:"250mcg per nostril",freq:"1–2x daily AM",notes:"Anxiolytic peptide — reduces anxiety without sedation"},
    {compoundName:"Pinealon",dose:"1mg oral",freq:"Daily AM fasted",notes:"Epigenetic peptide — circadian regulation"},
    {compoundName:"MOTS-c",dose:"5–10mg SubQ",freq:"2–3x/week AM fasted",notes:"Mitochondrial-derived peptide — AMPK activation"},
  ]},
  {name:"DIGESTION — Signs & Fixes",color:"#8fcf6f",items:[
    {compoundName:"Betaine HCL",dose:"1 serving",freq:"With final meal",notes:"Acidifies stomach"},
    {compoundName:"L-Glutamine",dose:"15–30g",freq:"AM empty stomach",notes:"Gut lining repair — intestinal barrier integrity"},
    {compoundName:"Digestive Enzymes",dose:"Per label",freq:"With meals",notes:"Break down protein, fats, carbs more efficiently"},
  ]},
];

// ═══════════════════════════════════════════════════════════
// SEED DATA — SUPPLY (70+ items)
// ═══════════════════════════════════════════════════════════

const DEFAULT_SUPPLY: SupplySeed[] = [
  // Original 24
  {compoundId:"pinealon",name:"Pinealon",category:"peptide",color:"#cf6fcf",currentStock:30,stockUnit:"doses",weeklyUsage:7,vendors:[{name:"CosmoPeptide",url:"https://cosmopeptide.com",costPerOrder:45,unitsPerOrder:30}],notes:"1mg per dose, fasted AM"},
  {compoundId:"alpha-gpc",name:"Alpha-GPC",category:"choline",color:"#cfb86f",currentStock:60,stockUnit:"caps",weeklyUsage:4,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:19,unitsPerOrder:60},{name:"Amazon",url:"https://amazon.com",costPerOrder:17,unitsPerOrder:60}],notes:"600mg caps, lift days only"},
  {compoundId:"citicoline",name:"Citicoline (CDP-Choline)",category:"choline",color:"#cfb86f",currentStock:180,stockUnit:"caps",weeklyUsage:3,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:64.99,unitsPerOrder:180}],notes:"500mg caps, ruck/rest days"},
  {compoundId:"bromantane",name:"Bromantane",category:"nootropic",color:"#6f8fcf",currentStock:20,stockUnit:"doses",weeklyUsage:7,vendors:[{name:"Nootropic Source",url:"https://nootropicsource.com",costPerOrder:30,unitsPerOrder:20}],notes:"100mg/dose sublingual. Weigh with Gemini-20."},
  {compoundId:"bpc157",name:"BPC-157",category:"peptide",color:"#6fcf6f",currentStock:0,stockUnit:"doses",weeklyUsage:0,vendors:[{name:"Peptide Sciences",url:"https://peptidesciences.com",costPerOrder:40,unitsPerOrder:20}],notes:"500mcg/dose oral. Reset phase only."},
  {compoundId:"9mebc",name:"9-me-BC",category:"nootropic",color:"#6f8fcf",currentStock:0,stockUnit:"doses",weeklyUsage:0,vendors:[{name:"Nootropic Source",url:"https://nootropicsource.com",costPerOrder:25,unitsPerOrder:25}],notes:"20mg/dose. Reset phase only (4 weeks max)."},
  {compoundId:"semax",name:"Semax",category:"peptide",color:"#6fcf6f",currentStock:16,stockUnit:"doses",weeklyUsage:14,vendors:[{name:"Peptide Sciences",url:"https://peptidesciences.com",costPerOrder:40,unitsPerOrder:16}],notes:"300mcg/dose nasal. 5mg vial = ~16 doses."},
  {compoundId:"selank",name:"Selank",category:"peptide",color:"#6fcf6f",currentStock:20,stockUnit:"doses",weeklyUsage:14,vendors:[{name:"Peptide Sciences",url:"https://peptidesciences.com",costPerOrder:40,unitsPerOrder:20}],notes:"250mcg/dose nasal. 5mg vial = ~20 doses."},
  {compoundId:"thiamine",name:"Thiamine HCL",category:"vitamin",color:"#cf8f6f",currentStock:100,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"NOW Foods (Amazon)",url:"https://amazon.com",costPerOrder:15,unitsPerOrder:100}],notes:"500mg caps. Daily AM."},
  {compoundId:"magglycinate",name:"Magnesium Glycinate",category:"mineral",color:"#8f8fcf",currentStock:120,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Doctor's Best",url:"https://amazon.com",costPerOrder:15,unitsPerOrder:120},{name:"Walmart",url:"https://walmart.com",costPerOrder:12,unitsPerOrder:120}],notes:"400mg caps. Daily AM."},
  {compoundId:"creatine",name:"Creatine Monohydrate",category:"amino",color:"#cfcf6f",currentStock:50,stockUnit:"servings",weeklyUsage:7,vendors:[{name:"Bulk Supplements",url:"https://bulksupplements.com",costPerOrder:25,unitsPerOrder:50}],notes:"10g/serving. Daily AM."},
  {compoundId:"cordyceps",name:"Cordyceps",category:"mushroom",color:"#6fcfcf",currentStock:30,stockUnit:"days",weeklyUsage:7,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:30,unitsPerOrder:30}],notes:"2000mg/day. Cycle 8wks on / 2 off."},
  {compoundId:"polygala",name:"Polygala Tenuifolia",category:"herb",color:"#cf6fcf",currentStock:60,stockUnit:"days",weeklyUsage:7,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:29.99,unitsPerOrder:60}],notes:"300mg/day. Cycle 8wks on / 2 off."},
  {compoundId:"agmatine",name:"Agmatine Sulfate",category:"amino",color:"#cfcf6f",currentStock:167,stockUnit:"doses",weeklyUsage:7,vendors:[{name:"Bulk Supplements",url:"https://bulksupplements.com",costPerOrder:20,unitsPerOrder:167}],notes:"750mg–1500mg/day. 250g powder."},
  {compoundId:"tau",name:"Triacetyluridine",category:"nootropic",color:"#6f8fcf",currentStock:30,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:30,unitsPerOrder:30}],notes:"25mg caps. Daily before bed."},
  {compoundId:"reta",name:"Retatrutide",category:"peptide",color:"#cf6f6f",currentStock:18,stockUnit:"doses",weeklyUsage:3,vendors:[{name:"Limited Life Nootropics",url:"https://limitedlifenootropics.com",costPerOrder:80,unitsPerOrder:7},{name:"Peptide Sciences",url:"https://peptidesciences.com",costPerOrder:75,unitsPerOrder:7}],notes:"~1.33mg SubQ 3x/week. 10mg vial."},
  {compoundId:"gh",name:"GH (Growth Hormone)",category:"peptide",color:"#6fcf6f",currentStock:30,stockUnit:"days",weeklyUsage:7,vendors:[{name:"Rx / Compounding",url:"",costPerOrder:150,unitsPerOrder:30}],notes:"2 IU SubQ daily before bed."},
  {compoundId:"ghkcu",name:"GHK-Cu",category:"peptide",color:"#8f8fcf",currentStock:14,stockUnit:"doses",weeklyUsage:5,vendors:[{name:"Peptide Sciences",url:"https://peptidesciences.com",costPerOrder:50,unitsPerOrder:5},{name:"Limited Life Nootropics",url:"https://limitedlifenootropics.com",costPerOrder:45,unitsPerOrder:5}],notes:"2mg SubQ Mon–Fri before bed."},
  {compoundId:"sabroxy",name:"Sabroxy",category:"focus",color:"#cf6fcf",currentStock:180,stockUnit:"caps",weeklyUsage:2.5,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:39.99,unitsPerOrder:180}],notes:"200mg caps. 2–3x/week deep work only."},
  {compoundId:"dynamine",name:"Dynamine",category:"focus",color:"#cf6fcf",currentStock:60,stockUnit:"caps",weeklyUsage:2.5,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:30,unitsPerOrder:60}],notes:"2–3x/week alongside Sabroxy."},
  {compoundId:"lcarnitine",name:"L-Carnitine",category:"amino",color:"#cfb86f",currentStock:40,stockUnit:"servings",weeklyUsage:7,vendors:[{name:"Bulk Supplements",url:"https://bulksupplements.com",costPerOrder:20,unitsPerOrder:40}],notes:"2–4g fasted AM or pre-cardio."},
  {compoundId:"pump-blend",name:"Pump Blend (Pre-Workout)",category:"blend",color:"#cf6f8f",currentStock:30,stockUnit:"servings",weeklyUsage:4,vendors:[{name:"Custom Mix",url:"",costPerOrder:35,unitsPerOrder:30}],notes:"L-Citrulline + Agmatine + Betaine + Glycerol. Lift days."},
  {compoundId:"5amino1mq",name:"5-Amino-1MQ",category:"metabolic",color:"#6fcf6f",currentStock:0,stockUnit:"caps",weeklyUsage:14,vendors:[{name:"Peptide Sciences",url:"https://peptidesciences.com",costPerOrder:50,unitsPerOrder:60}],notes:"20–50mg 1–2x/day with food. Cycle 8 on / 4 off."},
  {compoundId:"motsc",name:"MOTS-c",category:"peptide",color:"#8f6fcf",currentStock:0,stockUnit:"doses",weeklyUsage:3,vendors:[{name:"Peptide Sciences",url:"https://peptidesciences.com",costPerOrder:60,unitsPerOrder:1},{name:"Limited Life Nootropics",url:"https://limitedlifenootropics.com",costPerOrder:55,unitsPerOrder:1}],notes:"5–10mg SubQ 2–3x/week fasted AM."},
  // 50 new items
  {compoundId:"nac",name:"NAC (N-Acetyl Cysteine)",category:"amino",color:"#6fcf6f",currentStock:250,stockUnit:"caps",weeklyUsage:14,vendors:[{name:"NOW Foods",url:"https://amazon.com",costPerOrder:15,unitsPerOrder:250}],notes:"600mg 2x/day. Glutathione precursor."},
  {compoundId:"r-lipoic-acid",name:"R-Lipoic Acid",category:"antioxidant",color:"#cfb86f",currentStock:90,stockUnit:"caps",weeklyUsage:14,vendors:[{name:"Life Extension",url:"https://lifeextension.com",costPerOrder:52,unitsPerOrder:90}],notes:"240mg 2x/day. Mitochondrial antioxidant."},
  {compoundId:"vitamin-c",name:"Vitamin C",category:"vitamin",color:"#cf8f6f",currentStock:250,stockUnit:"caps",weeklyUsage:14,vendors:[{name:"NOW Foods",url:"https://amazon.com",costPerOrder:20,unitsPerOrder:250}],notes:"1000mg 2x/day."},
  {compoundId:"fish-oil",name:"Fish Oil (EPA/DHA)",category:"fatty-acid",color:"#6f8fcf",currentStock:60,stockUnit:"caps",weeklyUsage:14,vendors:[{name:"Nordic Naturals",url:"https://amazon.com",costPerOrder:22,unitsPerOrder:60}],notes:"1–5g 2x/day. Anti-inflammatory."},
  {compoundId:"tudca",name:"TUDCA",category:"liver",color:"#6fcf6f",currentStock:60,stockUnit:"caps",weeklyUsage:14,vendors:[{name:"Double Wood",url:"https://amazon.com",costPerOrder:28,unitsPerOrder:60}],notes:"250mg 2x/day. Liver protection."},
  {compoundId:"black-seed-oil",name:"Black Seed Oil",category:"herb",color:"#cfcf6f",currentStock:16,stockUnit:"servings",weeklyUsage:14,vendors:[{name:"Grimm's Apothecary",url:"https://grimmsapothecary.com",costPerOrder:30,unitsPerOrder:16}],notes:"1 Tbsp 2x/day. Thymoquinone."},
  {compoundId:"coq10",name:"CoQ10 (Ubiquinol)",category:"heart",color:"#cf6f6f",currentStock:60,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Jarrow Formulas",url:"https://amazon.com",costPerOrder:30,unitsPerOrder:60}],notes:"Per label daily. Mitochondrial heart energy."},
  {compoundId:"nattokinase",name:"Nattokinase",category:"heart",color:"#cf6f6f",currentStock:90,stockUnit:"caps",weeklyUsage:14,vendors:[{name:"Doctor's Best",url:"https://amazon.com",costPerOrder:20,unitsPerOrder:90}],notes:"4k FU AM + 4k PM. Fibrinolytic."},
  {compoundId:"carditone",name:"Carditone",category:"heart",color:"#cf6f6f",currentStock:60,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Ayush Herbs",url:"https://amazon.com",costPerOrder:30,unitsPerOrder:60}],notes:"Ayurvedic BP support."},
  {compoundId:"aged-garlic",name:"Aged Garlic Extract",category:"heart",color:"#cf6f6f",currentStock:100,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Kyolic",url:"https://amazon.com",costPerOrder:15,unitsPerOrder:100}],notes:"BP reduction, arterial flexibility."},
  {compoundId:"tadalafil",name:"Tadalafil (Cialis)",category:"heart",color:"#cf6f6f",currentStock:30,stockUnit:"tabs",weeklyUsage:7,vendors:[{name:"Rx Pharmacy",url:"",costPerOrder:30,unitsPerOrder:30}],notes:"5mg daily. Vascular health."},
  {compoundId:"nobiletin",name:"Nobiletin",category:"nootropic",color:"#cfb86f",currentStock:60,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:20,unitsPerOrder:60}],notes:"Circadian clock modulator."},
  {compoundId:"ginkgo",name:"Ginkgo Biloba",category:"herb",color:"#6fcf6f",currentStock:120,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"NOW Foods",url:"https://amazon.com",costPerOrder:10,unitsPerOrder:120}],notes:"120mg daily. Cerebral blood flow."},
  {compoundId:"huperzine-a",name:"Huperzine A",category:"nootropic",color:"#cf6fcf",currentStock:120,stockUnit:"caps",weeklyUsage:2,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:22,unitsPerOrder:120}],notes:"AChE inhibitor. Cycle."},
  {compoundId:"lions-mane",name:"Lion's Mane",category:"mushroom",color:"#6fcfcf",currentStock:60,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Real Mushrooms",url:"https://realmushrooms.com",costPerOrder:30,unitsPerOrder:60}],notes:"NGF stimulation, neurogenesis."},
  {compoundId:"glycine",name:"Glycine",category:"amino",color:"#8f8fcf",currentStock:100,stockUnit:"servings",weeklyUsage:7,vendors:[{name:"Bulk Supplements",url:"https://bulksupplements.com",costPerOrder:15,unitsPerOrder:100}],notes:"Inhibitory neurotransmitter, sleep."},
  {compoundId:"mag-threonate",name:"Magnesium L-Threonate",category:"mineral",color:"#8f8fcf",currentStock:90,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Life Extension",url:"https://lifeextension.com",costPerOrder:25,unitsPerOrder:90}],notes:"Crosses BBB. Brain magnesium."},
  {compoundId:"psyllium",name:"Psyllium Husk",category:"fiber",color:"#8fcf6f",currentStock:72,stockUnit:"servings",weeklyUsage:21,vendors:[{name:"Walmart",url:"https://walmart.com",costPerOrder:10,unitsPerOrder:72}],notes:"5–10g before meals. Satiety."},
  {compoundId:"tongkat-ali",name:"Tongkat Ali",category:"herb",color:"#cfcf6f",currentStock:60,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:30,unitsPerOrder:60}],notes:"Testosterone, cortisol modulation."},
  {compoundId:"l-theanine",name:"L-Theanine",category:"amino",color:"#6fcfcf",currentStock:100,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"NOW Foods",url:"https://amazon.com",costPerOrder:15,unitsPerOrder:100}],notes:"200mg daily. Calming focus."},
  {compoundId:"mucuna",name:"Mucuna Pruriens",category:"herb",color:"#cf6fcf",currentStock:90,stockUnit:"caps",weeklyUsage:2,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:15,unitsPerOrder:90}],notes:"L-DOPA source. Max 2x/week."},
  {compoundId:"l-tyrosine",name:"L-Tyrosine",category:"amino",color:"#cfb86f",currentStock:120,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"NOW Foods",url:"https://amazon.com",costPerOrder:10,unitsPerOrder:120}],notes:"Dopamine building blocks."},
  {compoundId:"rhodiola",name:"Rhodiola Rosea",category:"herb",color:"#6fcf6f",currentStock:90,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:18,unitsPerOrder:90}],notes:"Adaptogen. Fatigue resistance."},
  {compoundId:"cognance",name:"Cognance (Enhanced Bacopa)",category:"nootropic",color:"#cf6fcf",currentStock:180,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:70,unitsPerOrder:180}],notes:"AChE optimization, memory."},
  {compoundId:"dma-dhf",name:"4'-DMA-7,8-DHF",category:"nootropic",color:"#cf6fcf",currentStock:90,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:75,unitsPerOrder:90}],notes:"TrkB agonist. BDNF signaling."},
  {compoundId:"betaine-anhydrous",name:"Betaine Anhydrous",category:"performance",color:"#cf6f8f",currentStock:100,stockUnit:"servings",weeklyUsage:4,vendors:[{name:"Bulk Supplements",url:"https://bulksupplements.com",costPerOrder:12,unitsPerOrder:100}],notes:"2.5g pre-workout. Cellular hydration."},
  {compoundId:"glycerol",name:"Glycerol Monostearate",category:"performance",color:"#cf6f8f",currentStock:60,stockUnit:"servings",weeklyUsage:4,vendors:[{name:"Bulk Supplements",url:"https://bulksupplements.com",costPerOrder:15,unitsPerOrder:60}],notes:"2–3g pre-workout. Hyperhydration."},
  {compoundId:"l-citrulline",name:"L-Citrulline",category:"performance",color:"#cf6f8f",currentStock:60,stockUnit:"servings",weeklyUsage:4,vendors:[{name:"Bulk Supplements",url:"https://bulksupplements.com",costPerOrder:20,unitsPerOrder:60}],notes:"6–10g pre-workout. NO production."},
  {compoundId:"methylene-blue",name:"Methylene Blue",category:"nootropic",color:"#6f8fcf",currentStock:60,stockUnit:"doses",weeklyUsage:2,vendors:[{name:"Various",url:"",costPerOrder:25,unitsPerOrder:60}],notes:"5–10mg deep work. Mitochondrial."},
  {compoundId:"betaine-hcl",name:"Betaine HCL",category:"digestive",color:"#8fcf6f",currentStock:120,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"NOW Foods",url:"https://amazon.com",costPerOrder:12,unitsPerOrder:120}],notes:"With final meal. Stomach acid."},
  {compoundId:"l-glutamine",name:"L-Glutamine",category:"amino",color:"#8fcf6f",currentStock:100,stockUnit:"servings",weeklyUsage:7,vendors:[{name:"Bulk Supplements",url:"https://bulksupplements.com",costPerOrder:20,unitsPerOrder:100}],notes:"15–30g AM. Gut lining repair."},
  {compoundId:"digestive-enzymes",name:"Digestive Enzymes",category:"digestive",color:"#8fcf6f",currentStock:90,stockUnit:"caps",weeklyUsage:21,vendors:[{name:"NOW Foods",url:"https://amazon.com",costPerOrder:20,unitsPerOrder:90}],notes:"With meals. Protein/fat/carb breakdown."},
  {compoundId:"vitamin-d3",name:"Vitamin D3",category:"vitamin",color:"#cfcf6f",currentStock:240,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"NOW Foods",url:"https://amazon.com",costPerOrder:12,unitsPerOrder:240}],notes:"5000 IU daily. Immune, bone, mood."},
  {compoundId:"vitamin-k2",name:"Vitamin K2 (MK-7)",category:"vitamin",color:"#cfcf6f",currentStock:120,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"NOW Foods",url:"https://amazon.com",costPerOrder:15,unitsPerOrder:120}],notes:"Pair with D3. Calcium routing."},
  {compoundId:"zinc",name:"Zinc Picolinate",category:"mineral",color:"#8f8fcf",currentStock:120,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"NOW Foods",url:"https://amazon.com",costPerOrder:8,unitsPerOrder:120}],notes:"30mg daily. Immune, testosterone."},
  {compoundId:"boron",name:"Boron",category:"mineral",color:"#8f8fcf",currentStock:120,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Double Wood",url:"https://amazon.com",costPerOrder:15,unitsPerOrder:120}],notes:"6mg daily. Testosterone, bones."},
  {compoundId:"ashwagandha",name:"Ashwagandha (KSM-66)",category:"herb",color:"#6fcf6f",currentStock:90,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:25,unitsPerOrder:90}],notes:"Adaptogen. Cortisol, sleep, recovery."},
  {compoundId:"berberine",name:"Berberine",category:"metabolic",color:"#cfb86f",currentStock:60,stockUnit:"caps",weeklyUsage:14,vendors:[{name:"Thorne",url:"https://thorne.com",costPerOrder:40,unitsPerOrder:60}],notes:"500mg 2x/day. Blood sugar, AMPK."},
  {compoundId:"nmn",name:"NMN (Nicotinamide Mononucleotide)",category:"longevity",color:"#6fcfcf",currentStock:60,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Double Wood",url:"https://amazon.com",costPerOrder:40,unitsPerOrder:60}],notes:"250mg daily. NAD+ precursor."},
  {compoundId:"pterostilbene",name:"Pterostilbene",category:"longevity",color:"#cf6fcf",currentStock:60,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Nootropics Depot",url:"https://nootropicsdepot.com",costPerOrder:20,unitsPerOrder:60}],notes:"Better bioavailable resveratrol analog."},
  {compoundId:"resveratrol",name:"Resveratrol",category:"longevity",color:"#cf6fcf",currentStock:120,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"NOW Foods",url:"https://amazon.com",costPerOrder:25,unitsPerOrder:120}],notes:"Sirtuin activator. Anti-aging."},
  {compoundId:"melatonin",name:"Melatonin",category:"sleep",color:"#8f8fcf",currentStock:180,stockUnit:"tabs",weeklyUsage:7,vendors:[{name:"NOW Foods",url:"https://amazon.com",costPerOrder:8,unitsPerOrder:180}],notes:"0.3–1mg before bed. Circadian."},
  {compoundId:"gaba",name:"GABA",category:"sleep",color:"#8f8fcf",currentStock:100,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"NOW Foods",url:"https://amazon.com",costPerOrder:10,unitsPerOrder:100}],notes:"Inhibitory neurotransmitter. Calm."},
  {compoundId:"phosphatidylserine",name:"Phosphatidylserine",category:"nootropic",color:"#6f8fcf",currentStock:120,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"Double Wood",url:"https://amazon.com",costPerOrder:20,unitsPerOrder:120}],notes:"Cortisol modulation, memory."},
  {compoundId:"alcar",name:"Acetyl-L-Carnitine (ALCAR)",category:"amino",color:"#cfb86f",currentStock:100,stockUnit:"caps",weeklyUsage:7,vendors:[{name:"NOW Foods",url:"https://amazon.com",costPerOrder:15,unitsPerOrder:100}],notes:"Crosses BBB. Cognitive + fat ox."},
  {compoundId:"lclt",name:"L-Carnitine L-Tartrate (LCLT)",category:"performance",color:"#cfb86f",currentStock:60,stockUnit:"servings",weeklyUsage:4,vendors:[{name:"Bulk Supplements",url:"https://bulksupplements.com",costPerOrder:18,unitsPerOrder:60}],notes:"2g pre-workout. AR upregulation."},
  {compoundId:"collagen",name:"Collagen Peptides",category:"protein",color:"#cf8f6f",currentStock:28,stockUnit:"servings",weeklyUsage:7,vendors:[{name:"Vital Proteins",url:"https://amazon.com",costPerOrder:25,unitsPerOrder:28}],notes:"10–20g daily. Skin, joints, gut."},
  {compoundId:"electrolyte-mix",name:"Electrolyte Mix (LMNT)",category:"mineral",color:"#cfcf6f",currentStock:30,stockUnit:"packets",weeklyUsage:7,vendors:[{name:"LMNT",url:"https://drinklmnt.com",costPerOrder:45,unitsPerOrder:30}],notes:"1 packet/day. Sodium, potassium, mag."},
  {compoundId:"nicotine",name:"Nicotine (Zyn)",category:"focus",color:"#cf6fcf",currentStock:15,stockUnit:"pouches",weeklyUsage:0,vendors:[{name:"Zyn",url:"",costPerOrder:5,unitsPerOrder:15}],notes:"1–6mg as needed. Acute focus."},
  {compoundId:"dmaa",name:"DMAA",category:"stimulant",color:"#cf6f6f",currentStock:60,stockUnit:"caps",weeklyUsage:1,vendors:[{name:"Various",url:"",costPerOrder:20,unitsPerOrder:60}],notes:"10–25mg MAX 2x/week. Extremely potent."},
];

// ═══════════════════════════════════════════════════════════
// COMPOUND SEEDS
// ═══════════════════════════════════════════════════════════

const DEFAULT_COMPOUNDS: CompoundSeed[] = [
  {compoundId:"pinealon",name:"Pinealon",category:"peptide",tags:["peptide","sleep","cognitive","daily-ok"]},
  {compoundId:"alpha-gpc",name:"Alpha-GPC",category:"choline",tags:["nootropic","cognitive","focus","cycle-required"]},
  {compoundId:"citicoline",name:"Citicoline",category:"choline",tags:["nootropic","cognitive","daily-ok"]},
  {compoundId:"bromantane",name:"Bromantane",category:"nootropic",tags:["nootropic","focus","daily-ok"]},
  {compoundId:"bpc157",name:"BPC-157",category:"peptide",tags:["peptide","recovery","gut-health","cycle-required"]},
  {compoundId:"9mebc",name:"9-me-BC",category:"nootropic",tags:["nootropic","cognitive","cycle-required"]},
  {compoundId:"semax",name:"Semax",category:"peptide",tags:["peptide","focus","cognitive","daily-ok"]},
  {compoundId:"selank",name:"Selank",category:"peptide",tags:["peptide","sleep","recovery","daily-ok"]},
  {compoundId:"thiamine",name:"Thiamine HCL",category:"vitamin",tags:["vitamin","daily-ok","metabolic"]},
  {compoundId:"magglycinate",name:"Magnesium Glycinate",category:"mineral",tags:["mineral","sleep","heart-health","daily-ok"]},
  {compoundId:"creatine",name:"Creatine Monohydrate",category:"amino",tags:["amino-acid","cognitive","daily-ok"]},
  {compoundId:"cordyceps",name:"Cordyceps",category:"mushroom",tags:["mushroom","metabolic","recovery","cycle-required"]},
  {compoundId:"polygala",name:"Polygala Tenuifolia",category:"herb",tags:["herb","cognitive","focus","cycle-required"]},
  {compoundId:"agmatine",name:"Agmatine Sulfate",category:"amino",tags:["amino-acid","focus","recovery","cycle-required"]},
  {compoundId:"tau",name:"Triacetyluridine",category:"nootropic",tags:["nootropic","cognitive","sleep","daily-ok"]},
  {compoundId:"reta",name:"Retatrutide",category:"peptide",tags:["peptide","metabolic","hormonal"]},
  {compoundId:"gh",name:"GH (Growth Hormone)",category:"peptide",tags:["peptide","recovery","hormonal"]},
  {compoundId:"ghkcu",name:"GHK-Cu",category:"peptide",tags:["peptide","recovery","anti-inflammatory"]},
  {compoundId:"sabroxy",name:"Sabroxy",category:"focus",tags:["nootropic","focus","as-needed"]},
  {compoundId:"dynamine",name:"Dynamine",category:"focus",tags:["nootropic","focus","as-needed"]},
  {compoundId:"lcarnitine",name:"L-Carnitine",category:"amino",tags:["amino-acid","metabolic","daily-ok"]},
  {compoundId:"pump-blend",name:"Pump Blend",category:"blend",tags:["amino-acid","as-needed"]},
  {compoundId:"5amino1mq",name:"5-Amino-1MQ",category:"metabolic",tags:["metabolic","cycle-required"]},
  {compoundId:"motsc",name:"MOTS-c",category:"peptide",tags:["peptide","metabolic","recovery"]},
  {compoundId:"nac",name:"NAC",category:"amino",tags:["amino-acid","anti-inflammatory","daily-ok"]},
  {compoundId:"r-lipoic-acid",name:"R-Lipoic Acid",category:"antioxidant",tags:["anti-inflammatory","metabolic","daily-ok"]},
  {compoundId:"vitamin-c",name:"Vitamin C",category:"vitamin",tags:["vitamin","anti-inflammatory","daily-ok"]},
  {compoundId:"fish-oil",name:"Fish Oil",category:"fatty-acid",tags:["anti-inflammatory","heart-health","daily-ok"]},
  {compoundId:"tudca",name:"TUDCA",category:"liver",tags:["gut-health","anti-inflammatory","daily-ok"]},
  {compoundId:"black-seed-oil",name:"Black Seed Oil",category:"herb",tags:["herb","anti-inflammatory","daily-ok"]},
  {compoundId:"coq10",name:"CoQ10",category:"heart",tags:["heart-health","daily-ok"]},
  {compoundId:"nattokinase",name:"Nattokinase",category:"heart",tags:["heart-health","daily-ok"]},
  {compoundId:"carditone",name:"Carditone",category:"heart",tags:["heart-health","herb","daily-ok"]},
  {compoundId:"aged-garlic",name:"Aged Garlic",category:"heart",tags:["heart-health","daily-ok"]},
  {compoundId:"tadalafil",name:"Tadalafil",category:"heart",tags:["heart-health","hormonal","daily-ok"]},
  {compoundId:"nobiletin",name:"Nobiletin",category:"nootropic",tags:["nootropic","cognitive","daily-ok"]},
  {compoundId:"ginkgo",name:"Ginkgo Biloba",category:"herb",tags:["herb","cognitive","daily-ok"]},
  {compoundId:"huperzine-a",name:"Huperzine A",category:"nootropic",tags:["nootropic","focus","cycle-required"]},
  {compoundId:"lions-mane",name:"Lion's Mane",category:"mushroom",tags:["mushroom","cognitive","daily-ok"]},
  {compoundId:"glycine",name:"Glycine",category:"amino",tags:["amino-acid","sleep","daily-ok"]},
  {compoundId:"mag-threonate",name:"Magnesium L-Threonate",category:"mineral",tags:["mineral","cognitive","sleep","daily-ok"]},
  {compoundId:"psyllium",name:"Psyllium Husk",category:"fiber",tags:["gut-health","metabolic","daily-ok"]},
  {compoundId:"tongkat-ali",name:"Tongkat Ali",category:"herb",tags:["herb","hormonal","daily-ok"]},
  {compoundId:"l-theanine",name:"L-Theanine",category:"amino",tags:["amino-acid","sleep","focus","daily-ok"]},
  {compoundId:"mucuna",name:"Mucuna Pruriens",category:"herb",tags:["herb","focus","cycle-required"]},
  {compoundId:"l-tyrosine",name:"L-Tyrosine",category:"amino",tags:["amino-acid","focus","daily-ok"]},
  {compoundId:"rhodiola",name:"Rhodiola Rosea",category:"herb",tags:["herb","recovery","focus","daily-ok"]},
  {compoundId:"cognance",name:"Cognance",category:"nootropic",tags:["nootropic","cognitive","daily-ok"]},
  {compoundId:"dma-dhf",name:"4'-DMA-7,8-DHF",category:"nootropic",tags:["nootropic","cognitive","daily-ok"]},
  {compoundId:"betaine-anhydrous",name:"Betaine Anhydrous",category:"performance",tags:["amino-acid","as-needed"]},
  {compoundId:"glycerol",name:"Glycerol",category:"performance",tags:["as-needed"]},
  {compoundId:"l-citrulline",name:"L-Citrulline",category:"performance",tags:["amino-acid","heart-health","as-needed"]},
  {compoundId:"methylene-blue",name:"Methylene Blue",category:"nootropic",tags:["nootropic","focus","as-needed"]},
  {compoundId:"betaine-hcl",name:"Betaine HCL",category:"digestive",tags:["gut-health","daily-ok"]},
  {compoundId:"l-glutamine",name:"L-Glutamine",category:"amino",tags:["amino-acid","gut-health","recovery","daily-ok"]},
  {compoundId:"digestive-enzymes",name:"Digestive Enzymes",category:"digestive",tags:["gut-health","daily-ok"]},
  {compoundId:"vitamin-d3",name:"Vitamin D3",category:"vitamin",tags:["vitamin","daily-ok"]},
  {compoundId:"vitamin-k2",name:"Vitamin K2",category:"vitamin",tags:["vitamin","heart-health","daily-ok"]},
  {compoundId:"zinc",name:"Zinc",category:"mineral",tags:["mineral","hormonal","daily-ok"]},
  {compoundId:"boron",name:"Boron",category:"mineral",tags:["mineral","hormonal","daily-ok"]},
  {compoundId:"ashwagandha",name:"Ashwagandha",category:"herb",tags:["herb","sleep","recovery","daily-ok"]},
  {compoundId:"berberine",name:"Berberine",category:"metabolic",tags:["metabolic","daily-ok"]},
  {compoundId:"nmn",name:"NMN",category:"longevity",tags:["metabolic","daily-ok"]},
  {compoundId:"pterostilbene",name:"Pterostilbene",category:"longevity",tags:["anti-inflammatory","daily-ok"]},
  {compoundId:"resveratrol",name:"Resveratrol",category:"longevity",tags:["anti-inflammatory","daily-ok"]},
  {compoundId:"melatonin",name:"Melatonin",category:"sleep",tags:["sleep","daily-ok"]},
  {compoundId:"gaba",name:"GABA",category:"sleep",tags:["sleep","daily-ok"]},
  {compoundId:"phosphatidylserine",name:"Phosphatidylserine",category:"nootropic",tags:["nootropic","cognitive","daily-ok"]},
  {compoundId:"alcar",name:"ALCAR",category:"amino",tags:["amino-acid","cognitive","metabolic","daily-ok"]},
  {compoundId:"lclt",name:"LCLT",category:"performance",tags:["amino-acid","recovery","as-needed"]},
  {compoundId:"collagen",name:"Collagen Peptides",category:"protein",tags:["recovery","daily-ok"]},
  {compoundId:"electrolyte-mix",name:"Electrolyte Mix",category:"mineral",tags:["mineral","daily-ok"]},
  {compoundId:"nicotine",name:"Nicotine",category:"focus",tags:["focus","as-needed"]},
  {compoundId:"dmaa",name:"DMAA",category:"stimulant",tags:["focus","as-needed","cycle-required"]},
];

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface Block { time:string;label:string;type:string;items:string[];note?:string;duration?:string;macros?:string; }
interface Vendor { name:string;url:string;costPerOrder:number;unitsPerOrder:number; }
interface SupplySeed { compoundId:string;name:string;category:string;color:string;currentStock:number;stockUnit:string;weeklyUsage:number;vendors:Vendor[];notes:string;mgPerUnit?:number; }
interface CompoundSeed { compoundId:string;name:string;category:string;tags:string[]; }
interface StackSeed { stackId:string;name:string;color:string;items:{compoundName:string;dose:string;freq:string;notes?:string}[];sortOrder?:number; }

// ═══════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════

function todayStr(){return new Date().toISOString().split("T")[0];}
function formatDate(d:string){const dt=new Date(d+"T12:00:00");return dt.toLocaleDateString("en-US",{month:"short",day:"numeric"});}
function daysBetween(a:string,b:string){return Math.floor((new Date(b+"T12:00:00").getTime()-new Date(a+"T12:00:00").getTime())/86400000);}
function fmtCost(n:number){return n<0.01?"<$0.01":`$${n.toFixed(2)}`;}

function checksArrayToRecord(arr: Array<{itemKey:string;done:boolean}>): Record<string,boolean> {
  const rec: Record<string,boolean> = {};
  for (const {itemKey,done} of arr) rec[itemKey] = done;
  return rec;
}

function runwayColor(w:number){if(w<2)return"#cf6f6f";if(w<4)return"#cfb86f";return"#6fcf6f";}

function bestVendorCpu(vendors:Vendor[]):{vendor:Vendor;cpu:number}|null{
  if(!vendors.length)return null;
  let best=vendors[0];let bestCpu=best.unitsPerOrder>0?best.costPerOrder/best.unitsPerOrder:Infinity;
  for(const v of vendors){const cpu=v.unitsPerOrder>0?v.costPerOrder/v.unitsPerOrder:Infinity;if(cpu<bestCpu){best=v;bestCpu=cpu;}}
  return{vendor:best,cpu:bestCpu};
}

// ═══════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════

function TypeBadge({type}:{type:string}){
  const s:Record<string,{bg:string;border:string;text:string}>={supplement:{bg:"#1a2f1a",border:"#2d5a2d",text:"#6fcf6f"},meal:{bg:"#2f2a1a",border:"#5a4d2d",text:"#cfb86f"},training:{bg:"#1a1a2f",border:"#2d2d5a",text:"#6f8fcf"},focus:{bg:"#2f1a2f",border:"#5a2d5a",text:"#cf6fcf"}};
  const c=s[type]||{bg:"#222",border:"#444",text:"#aaa"};
  return<span style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:c.text,background:c.bg,border:`1px solid ${c.border}`,padding:"2px 8px",borderRadius:3}}>{type==="focus"?"optional":type}</span>;
}

function ResearchDisplay({text,accentColor}:{text:string;accentColor:string}){
  return(
    <div style={{fontSize:11,color:"#888",lineHeight:1.75,fontFamily:"inherit"}}>
      {text.split("\n").map((line,i)=>{
        if(line.startsWith("## ")||line.startsWith("# ")){
          const cleaned=line.replace(/^#+\s*/,"").replace(/\*\*(.*?)\*\*/g,"$1");
          return<div key={i} style={{fontSize:10,fontWeight:800,color:accentColor,letterSpacing:"0.08em",marginTop:i>0?12:0,marginBottom:3}}>{cleaned}</div>;
        }
        if(line.startsWith("- ")||line.startsWith("• ")||line.startsWith("* ")){
          const cleaned=line.replace(/^[-•*]\s*/,"").replace(/\*\*(.*?)\*\*/g,"$1");
          return<div key={i} style={{color:"#aaa",paddingLeft:10,display:"flex",gap:4}}><span style={{color:"#444",flexShrink:0}}>›</span><span>{cleaned}</span></div>;
        }
        const urlRegex=/(https?:\/\/[^\s)]+)/g;
        const parts=line.split(urlRegex);
        const cleaned=parts.map((p,pi)=>{const test=/(https?:\/\/[^\s)]+)/.test(p);return test?<a key={pi} href={p} target="_blank" rel="noreferrer" style={{color:"#6f8fcf",wordBreak:"break-all"}}>{p}</a>:<span key={pi}>{p.replace(/\*\*(.*?)\*\*/g,"$1")}</span>;});
        return<div key={i} style={{color:line.trim()?"#777":"transparent",minHeight:line.trim()?undefined:8}}>{cleaned}</div>;
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 1: SCHEDULE
// ═══════════════════════════════════════════════════════════

function ScheduleTab(){
  const templates=useQuery(api.protocol.getTemplates)??[];
  const weeklyPlan=useQuery(api.protocol.getWeeklyPlan)??[];
  const seedTemplates=useMutation(api.protocol.seedTemplates);
  const seedWeeklyPlan=useMutation(api.protocol.seedWeeklyPlan);
  const saveDailyRun=useMutation(api.protocol.saveDailyRun);
  const seededRef=useRef(false);

  const[selectedTemplate,setSelectedTemplate]=useState<string>("reset_lift");
  const[filterType,setFilterType]=useState<string>("all");
  const[weeklyOpen,setWeeklyOpen]=useState(false);
  const upsertWeeklyDay=useMutation(api.protocol.upsertWeeklyDay);

  // Seed templates on first load
  useEffect(()=>{
    if(!seededRef.current&&templates.length===0){
      seededRef.current=true;
      const tpls=[
        {templateId:"reset_lift",name:"Reset — Lift Day",color:"#6f8fcf",phase:"reset",dayType:"lift",blocks:RESET_LIFT.map(b=>({time:b.time,label:b.label,type:b.type,items:b.items,note:b.note,macros:b.macros,duration:b.duration})),sortOrder:1},
        {templateId:"reset_ruck",name:"Reset — Ruck Day",color:"#6fcf6f",phase:"reset",dayType:"ruck",blocks:RESET_RUCK.map(b=>({time:b.time,label:b.label,type:b.type,items:b.items,note:b.note,macros:b.macros,duration:b.duration})),sortOrder:2},
        {templateId:"post_lift",name:"Maintenance — Lift Day",color:"#cfb86f",phase:"maintenance",dayType:"lift",blocks:POST_LIFT.map(b=>({time:b.time,label:b.label,type:b.type,items:b.items,note:b.note,macros:b.macros,duration:b.duration})),sortOrder:3},
        {templateId:"post_ruck",name:"Maintenance — Ruck Day",color:"#cf6fcf",phase:"maintenance",dayType:"ruck",blocks:POST_RUCK.map(b=>({time:b.time,label:b.label,type:b.type,items:b.items,note:b.note,macros:b.macros,duration:b.duration})),sortOrder:4},
      ];
      seedTemplates({templates:tpls});
      seedWeeklyPlan({days:[
        {dayOfWeek:"Mon",templateId:"post_lift",flags:["reta","ghk"]},
        {dayOfWeek:"Tue",templateId:"post_lift",flags:["ghk"]},
        {dayOfWeek:"Wed",templateId:"post_ruck",flags:["reta","ghk"]},
        {dayOfWeek:"Thu",templateId:"post_lift",flags:["ghk"]},
        {dayOfWeek:"Fri",templateId:"post_lift",flags:["reta","ghk"]},
        {dayOfWeek:"Sat",templateId:"post_ruck",flags:[]},
        {dayOfWeek:"Sun",templateId:"post_ruck",flags:[]},
      ]});
    }
  },[templates.length]);

  // Find current template
  const currentTpl=templates.find(t=>(t as {templateId:string}).templateId===selectedTemplate);
  const blocks:Block[]=(currentTpl?.blocks as Block[])??[];
  const filteredBlocks=filterType==="all"?blocks:blocks.filter(b=>b.type===filterType);

  const pushToToday=()=>{
    if(!currentTpl)return;
    const today=todayStr();
    if(!confirm(`Push "${currentTpl.name}" to today (${today})?`))return;
    saveDailyRun({date:today,templateUsed:(currentTpl as {templateId:string}).templateId,dailyRun:blocks.map(b=>({time:b.time,label:b.label,type:b.type,items:b.items,note:b.note,macros:b.macros,duration:b.duration}))});
  };

  // Assign template to a weekly day
  const assignDay=(day:string,templateId:string)=>{
    const existing=weeklyPlan.find(w=>w.dayOfWeek===day);
    upsertWeeklyDay({dayOfWeek:day,templateId,flags:(existing?.flags as string[])??[]});
  };

  return(
    <>
      {/* Template selector */}
      <div style={{background:"linear-gradient(180deg,#141414 0%,#0d0d0d 100%)",borderBottom:"1px solid #1f1f1f",padding:"16px 16px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{fontSize:9,color:"#555",letterSpacing:"0.15em",marginBottom:3}}>SCHEDULE TEMPLATE</div>
            <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>{currentTpl?.name||"Select Template"}</div>
          </div>
          <button onClick={pushToToday} style={{padding:"10px 16px",background:"#1a2f1a",border:"1px solid #2d5a2d",borderRadius:8,color:"#6fcf6f",fontSize:12,fontWeight:700,cursor:"pointer"}}>▶ Push to Today</button>
        </div>

        {/* Template pills */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {templates.map(t=>{
            const tid=(t as {templateId:string}).templateId;
            const active=tid===selectedTemplate;
            return(
              <button key={tid} onClick={()=>setSelectedTemplate(tid)} style={{padding:"8px 14px",borderRadius:20,border:`1px solid ${active?t.color+"80":"#2a2a2a"}`,background:active?t.color+"20":"#111",color:active?t.color:"#666",fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:"0.04em"}}>{t.name}</button>
            );
          })}
        </div>

        {/* Type filter */}
        <div style={{display:"flex",gap:0}}>
          {["all","supplement","meal","training","focus"].map(f=>(
            <button key={f} onClick={()=>setFilterType(f)} style={{flex:1,padding:"10px 0",background:"none",border:"none",borderBottom:filterType===f?"2px solid #fff":"2px solid transparent",color:filterType===f?"#fff":"#555",cursor:"pointer",fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase"}}>{f}</button>
          ))}
        </div>
      </div>

      {/* Blocks */}
      <div style={{padding:"20px 16px"}}>
        {filteredBlocks.map((b,i)=>{
          const bc:Record<string,string>={supplement:"#2d5a2d",meal:"#5a4d2d",training:"#2d2d5a",focus:"#5a2d5a"};
          const borderColor=bc[b.type]||"#333";
          return(
            <div key={i} style={{borderLeft:`3px solid ${borderColor}`,paddingLeft:16,marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <span style={{fontFamily:"monospace",fontSize:12,color:"#8a8a8a",minWidth:72}}>{b.time}</span>
                <TypeBadge type={b.type}/>
                {b.duration&&<span style={{fontSize:10,color:"#666",fontStyle:"italic"}}>{b.duration}</span>}
              </div>
              <div style={{fontWeight:700,fontSize:14,color:"#e0e0e0",marginBottom:6}}>{b.label}</div>
              {b.items.map((item,ii)=>(
                <div key={ii} style={{fontSize:13,color:"#b0b0b0",lineHeight:1.6,paddingLeft:4}}>• {item}</div>
              ))}
              {b.macros&&<div style={{marginTop:6,fontSize:11,fontFamily:"monospace",color:"#cfb86f",background:"#1a1812",display:"inline-block",padding:"3px 10px",borderRadius:3}}>{b.macros}</div>}
              {b.note&&<div style={{marginTop:6,fontSize:11,color:"#cf6f6f",fontWeight:600}}>▸ {b.note}</div>}
            </div>
          );
        })}
      </div>

      {/* Weekly Planner */}
      <div style={{padding:"0 16px 16px"}}>
        <button onClick={()=>setWeeklyOpen(!weeklyOpen)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:"#111",border:"1px solid #1f1f1f",borderRadius:8,cursor:"pointer",color:"#e0e0e0",marginBottom:weeklyOpen?8:0}}>
          <span style={{fontSize:12,fontWeight:700,letterSpacing:"0.06em"}}>WEEKLY PLANNER</span>
          <span style={{color:"#555"}}>{weeklyOpen?"▲":"▼"}</span>
        </button>
        {weeklyOpen&&(
          <div style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:8,padding:14}}>
            <div style={{display:"flex",gap:4}}>
              {WEEKLY.map(d=>{
                const assigned=weeklyPlan.find(w=>w.dayOfWeek===d.day);
                const tplId=assigned?.templateId||"";
                const tpl=templates.find(t=>(t as {templateId:string}).templateId===tplId);
                return(
                  <div key={d.day} style={{flex:1,borderRadius:6,padding:"8px 4px",textAlign:"center",background:d.type==="lift"?"#111828":"#0d1a0d",border:`1px solid ${d.type==="lift"?"#1e2d4a":"#1a2f1a"}`}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#ccc",marginBottom:4}}>{d.day}</div>
                    <select value={tplId} onChange={e=>assignDay(d.day,e.target.value)} style={{width:"100%",background:"#0d0d0d",border:"1px solid #2a2a2a",borderRadius:4,color:"#888",fontSize:8,padding:2,marginBottom:4}}>
                      <option value="">—</option>
                      {templates.map(t=><option key={(t as {templateId:string}).templateId} value={(t as {templateId:string}).templateId}>{t.name}</option>)}
                    </select>
                    {d.reta&&<div style={{fontSize:7,color:"#cf6f6f",fontWeight:700,letterSpacing:"0.1em"}}>RETA</div>}
                    {d.ghk&&<div style={{fontSize:7,color:"#8f8fcf",fontWeight:700,marginTop:2,letterSpacing:"0.1em"}}>GHK</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 2: LOG
// ═══════════════════════════════════════════════════════════

function LogTab(){
  const[date,setDate]=useState(todayStr());
  const today=todayStr();
  const isToday=date===today;
  const dailyLog=useQuery(api.protocol.getDailyLog,{date});
  const allLogs=useQuery(api.protocol.getDailyLogs)??[];
  const checkKey=`${date}_log`;
  const checksRaw=useQuery(api.protocol.getChecks,{checkKey})??[];
  const checks=checksArrayToRecord(checksRaw as Array<{itemKey:string;done:boolean}>);
  const toggleCheck=useMutation(api.protocol.toggleCheck);
  const upsertDailyLog=useMutation(api.protocol.upsertDailyLog);

  const[localWeight,setLocalWeight]=useState<number|undefined>(undefined);
  const[localFeeling,setLocalFeeling]=useState<number|undefined>(undefined);
  const[localNotes,setLocalNotes]=useState("");
  const[localLift,setLocalLift]=useState(false);
  const[localRuck,setLocalRuck]=useState(false);

  useEffect(()=>{
    if(dailyLog){
      setLocalWeight(dailyLog.weight??undefined);
      setLocalFeeling(dailyLog.feeling??undefined);
      setLocalNotes(dailyLog.notes??"");
      setLocalLift(!!dailyLog.liftDone);
      setLocalRuck(!!dailyLog.ruckDone);
    } else {
      setLocalWeight(undefined);setLocalFeeling(undefined);setLocalNotes("");setLocalLift(false);setLocalRuck(false);
    }
  },[date,dailyLog?._id]);

  const saveLog=(updates:Record<string,unknown>)=>{
    const current={weight:localWeight,feeling:localFeeling,notes:localNotes||undefined,liftDone:localLift,ruckDone:localRuck,...updates};
    upsertDailyLog({date,...current} as Parameters<typeof upsertDailyLog>[0]);
  };

  const[logFilter,setLogFilter]=useState<string>("all");
  const blocks:Block[]=(dailyLog?.dailyRun as Block[])??[];
  const filteredLogBlocks=logFilter==="all"?blocks:blocks.filter(b=>b.type===logFilter);
  const totalItems=blocks.reduce((a,b)=>a+b.items.length,0);
  const doneItems=blocks.reduce((a,b)=>a+b.items.filter(item=>checks[`${b.label}__${item}`]).length,0);
  const pctDone=totalItems?Math.round((doneItems/totalItems)*100):0;

  const navDate=(dir:number)=>{const dt=new Date(date+"T12:00:00");dt.setDate(dt.getDate()+dir);const nd=dt.toISOString().split("T")[0];if(nd<=today)setDate(nd);};

  const feelingLabel=(n:number)=>{if(n<=2)return"💀 Rough";if(n<=4)return"😐 Meh";if(n<=6)return"🙂 Decent";if(n<=8)return"😤 Good";return"🔥 Locked in";};
  const feelingColor=(n:number)=>{if(n<=3)return"#cf6f6f";if(n<=5)return"#cfb86f";if(n<=7)return"#6fcf6f";return"#6f8fcf";};

  // History heatmap — last 30 days
  const heatmapDays=Array.from({length:30},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(29-i));return d.toISOString().split("T")[0];});
  const logMap:Record<string,typeof allLogs[number]>={};
  for(const l of allLogs)logMap[l.date]=l;

  return(
    <div style={{padding:"16px 16px 40px"}}>
      {/* Date nav */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <button onClick={()=>navDate(-1)} style={{background:"#111",border:"1px solid #222",color:"#888",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:14}}>←</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>{isToday?"TODAY":formatDate(date)}</div>
          <div style={{fontSize:10,color:"#555",marginTop:2}}>{date}</div>
        </div>
        <button onClick={()=>navDate(1)} disabled={isToday} style={{background:"#111",border:"1px solid #222",color:isToday?"#2a2a2a":"#888",borderRadius:6,padding:"6px 12px",cursor:isToday?"default":"pointer",fontSize:14}}>→</button>
      </div>

      {/* No schedule pushed */}
      {blocks.length===0&&(
        <div style={{textAlign:"center",padding:"40px 20px",color:"#444"}}>
          <div style={{fontSize:32,marginBottom:12}}>📋</div>
          <div style={{fontSize:14,fontWeight:700,color:"#666",marginBottom:4}}>No protocol pushed for {isToday?"today":"this day"}</div>
          <div style={{fontSize:11,color:"#444"}}>Go to SCHEDULE → Push to Today</div>
        </div>
      )}

      {/* Progress bar */}
      {blocks.length>0&&(
        <div style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:8,padding:14,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:10,color:"#555",letterSpacing:"0.1em"}}>PROGRESS</span>
            <span style={{fontSize:14,fontWeight:800,fontFamily:"monospace",color:pctDone===100?"#6fcf6f":"#888"}}>{doneItems}/{totalItems}</span>
          </div>
          <div style={{height:4,background:"#1a1a1a",borderRadius:2}}>
            <div style={{height:"100%",width:`${pctDone}%`,background:pctDone===100?"#6fcf6f":"#3a5a3a",borderRadius:2,transition:"width 0.3s"}}/>
          </div>
        </div>
      )}

      {/* Type filter */}
      {blocks.length>0&&(
        <div style={{display:"flex",gap:0,borderBottom:"1px solid #222",marginBottom:16}}>
          {["all","supplement","meal","training","focus"].map(f=>(
            <button key={f} onClick={()=>setLogFilter(f)} style={{flex:1,padding:"10px 0",background:"none",border:"none",borderBottom:logFilter===f?"2px solid #fff":"2px solid transparent",color:logFilter===f?"#fff":"#555",cursor:"pointer",fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase"}}>{f}</button>
          ))}
        </div>
      )}

      {/* Schedule blocks with checkboxes */}
      {filteredLogBlocks.map((b,i)=>{
        const bc:Record<string,string>={supplement:"#2d5a2d",meal:"#5a4d2d",training:"#2d2d5a",focus:"#5a2d5a"};
        const borderColor=bc[b.type]||"#333";
        const blockDone=b.items.every(item=>checks[`${b.label}__${item}`]);
        return(
          <div key={i} style={{borderLeft:`3px solid ${blockDone?"#2a2a2a":borderColor}`,paddingLeft:16,marginBottom:20,opacity:blockDone?0.55:1,transition:"opacity 0.2s"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <span style={{fontFamily:"monospace",fontSize:12,color:"#8a8a8a",minWidth:72}}>{b.time}</span>
              <TypeBadge type={b.type}/>
              {b.duration&&<span style={{fontSize:10,color:"#666",fontStyle:"italic"}}>{b.duration}</span>}
            </div>
            <div style={{fontWeight:700,fontSize:14,color:blockDone?"#444":"#e0e0e0",marginBottom:6}}>{b.label}</div>
            {b.items.map((item,ii)=>{
              const key=`${b.label}__${item}`;const done=!!checks[key];
              return(
                <button key={ii} onClick={()=>toggleCheck({checkKey,itemKey:key,done:!done})} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer",padding:"4px 0",textAlign:"left",width:"100%"}}>
                  <div style={{width:16,height:16,borderRadius:"50%",flexShrink:0,border:`1.5px solid ${done?"#6fcf6f":"#2d2d2d"}`,background:done?"#6fcf6f":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                    {done&&<span style={{fontSize:9,color:"#0d0d0d",fontWeight:900}}>✓</span>}
                  </div>
                  <span style={{fontSize:13,color:done?"#444":"#b0b0b0",lineHeight:1.4,textDecoration:done?"line-through":"none",transition:"all 0.15s"}}>{item}</span>
                </button>
              );
            })}
            {b.macros&&<div style={{marginTop:6,fontSize:11,fontFamily:"monospace",color:"#cfb86f",background:"#1a1812",display:"inline-block",padding:"3px 10px",borderRadius:3}}>{b.macros}</div>}
            {b.note&&<div style={{marginTop:6,fontSize:11,color:"#cf6f6f",fontWeight:600}}>▸ {b.note}</div>}
          </div>
        );
      })}

      {/* Daily metrics */}
      <div style={{fontSize:10,color:"#555",letterSpacing:"0.15em",marginBottom:10,marginTop:20}}>DAILY METRICS</div>

      {/* Activity toggles */}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {[{key:"lift",label:"LIFT",icon:"🏋️",active:localLift},{key:"ruck",label:"RUCK",icon:"🎒",active:localRuck}].map(t=>(
          <button key={t.key} onClick={()=>{const next=!t.active;if(t.key==="lift"){setLocalLift(next);saveLog({liftDone:next});}else{setLocalRuck(next);saveLog({ruckDone:next});}}} style={{flex:1,padding:"12px 8px",borderRadius:8,border:`1px solid ${t.active?"#2d5a2d":"#1f1f1f"}`,background:t.active?"#1a2f1a":"#111",cursor:"pointer"}}>
            <div style={{fontSize:20,marginBottom:4}}>{t.icon}</div>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:"0.1em",color:t.active?"#6fcf6f":"#444"}}>{t.label}</div>
          </button>
        ))}
      </div>

      {/* Weight */}
      <div style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:8,padding:14,marginBottom:12}}>
        <div style={{fontSize:10,color:"#555",letterSpacing:"0.1em",marginBottom:8}}>BODYWEIGHT (lbs)</div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>{const v=(localWeight||200)-0.5;setLocalWeight(v);saveLog({weight:v});}} style={{background:"#1a1a1a",border:"1px solid #222",color:"#888",borderRadius:6,padding:"6px 14px",cursor:"pointer",fontSize:18}}>−</button>
          <input type="number" step="0.5" value={localWeight||""} onChange={e=>{const v=parseFloat(e.target.value)||undefined;setLocalWeight(v);if(v)saveLog({weight:v});}} placeholder="---" style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:28,fontWeight:800,fontFamily:"monospace",color:"#fff",textAlign:"center"}}/>
          <button onClick={()=>{const v=(localWeight||200)+0.5;setLocalWeight(v);saveLog({weight:v});}} style={{background:"#1a1a1a",border:"1px solid #222",color:"#888",borderRadius:6,padding:"6px 14px",cursor:"pointer",fontSize:18}}>+</button>
        </div>
      </div>

      {/* Feeling */}
      <div style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:8,padding:14,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:10,color:"#555",letterSpacing:"0.1em"}}>FEELING TODAY</div>
          {localFeeling&&<span style={{fontSize:12,color:feelingColor(localFeeling)}}>{feelingLabel(localFeeling)}</span>}
        </div>
        <div style={{display:"flex",gap:4}}>
          {[1,2,3,4,5,6,7,8,9,10].map(n=>(
            <button key={n} onClick={()=>{setLocalFeeling(n);saveLog({feeling:n});}} style={{flex:1,padding:"10px 2px",borderRadius:4,background:localFeeling===n?feelingColor(n):localFeeling&&n<=localFeeling?`${feelingColor(localFeeling)}22`:"#1a1a1a",border:`1px solid ${localFeeling===n?feelingColor(n):"#222"}`,color:localFeeling===n?"#0d0d0d":localFeeling&&n<=localFeeling?feelingColor(localFeeling):"#333",fontSize:11,fontWeight:800,cursor:"pointer"}}>{n}</button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:8,padding:14,marginBottom:20}}>
        <div style={{fontSize:10,color:"#555",letterSpacing:"0.1em",marginBottom:8}}>NOTES</div>
        <textarea value={localNotes} onChange={e=>{setLocalNotes(e.target.value);saveLog({notes:e.target.value||undefined});}} placeholder="PRs, sleep quality, observations..." style={{width:"100%",background:"transparent",border:"none",outline:"none",color:"#b0b0b0",fontSize:13,lineHeight:1.6,resize:"none",minHeight:70,fontFamily:"inherit"}}/>
      </div>

      {/* 30-day heatmap */}
      <div style={{fontSize:10,color:"#555",letterSpacing:"0.15em",marginBottom:10}}>30-DAY HISTORY</div>
      <div style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:8,padding:14}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
          {heatmapDays.map(d=>{
            const log=logMap[d];
            const hasSome=!!log;
            const f=log?.feeling;
            const bg=!hasSome?"#1a1a1a":f&&f>=7?"#2d5a2d":f&&f>=4?"#3a3a1a":"#3a2a1a";
            return(
              <div key={d} onClick={()=>setDate(d)} title={`${d}${f?` — feeling ${f}`:""}`} style={{width:18,height:18,borderRadius:3,background:bg,cursor:"pointer",border:d===date?"1px solid #fff":"1px solid transparent"}}/>
            );
          })}
        </div>
        <div style={{display:"flex",gap:12,marginTop:8}}>
          <span style={{fontSize:9,color:"#555"}}>■ <span style={{color:"#2d5a2d"}}>Good</span></span>
          <span style={{fontSize:9,color:"#555"}}>■ <span style={{color:"#3a3a1a"}}>Meh</span></span>
          <span style={{fontSize:9,color:"#555"}}>■ <span style={{color:"#3a2a1a"}}>Rough</span></span>
          <span style={{fontSize:9,color:"#555"}}>■ <span style={{color:"#1a1a1a"}}>No data</span></span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB 3: SUPPLY
// ═══════════════════════════════════════════════════════════

function SupplyTab(){
  const supplyRaw=useQuery(api.protocol.getSupply)??[];
  const upsertItem=useMutation(api.protocol.upsertSupplyItem);
  const seedSupply=useMutation(api.protocol.seedSupply);
  const seededRef=useRef(false);

  const[editing,setEditing]=useState<string|null>(null);
  const[editBuf,setEditBuf]=useState<Partial<SupplySeed>>({});
  const[sortBy,setSortBy]=useState<"runway"|"cost"|"name">("runway");
  const[expandedId,setExpandedId]=useState<string|null>(null);

  useEffect(()=>{
    if(!seededRef.current&&supplyRaw.length===0){
      seededRef.current=true;
      // Split into batches of 25 to avoid argument limits
      const batch1=DEFAULT_SUPPLY.slice(0,25);
      const batch2=DEFAULT_SUPPLY.slice(25,50);
      const batch3=DEFAULT_SUPPLY.slice(50);
      seedSupply({items:batch1});
      if(batch2.length)setTimeout(()=>seedSupply({items:batch2}),500);
      if(batch3.length)setTimeout(()=>seedSupply({items:batch3}),1000);
    }
  },[supplyRaw.length]);

  type SupplyRow=typeof supplyRaw[number];
  const derive=(item:SupplyRow)=>{
    const vendors=(item.vendors as Vendor[])??[];
    const bv=bestVendorCpu(vendors);
    const cpUnit=bv?.cpu??0;
    const cpWeek=cpUnit*item.weeklyUsage;
    const cpMonth=cpWeek*4.33;
    const weeksLeft=item.weeklyUsage>0?item.currentStock/item.weeklyUsage:Infinity;
    return{cpUnit,cpWeek,cpMonth,weeksLeft,vendors};
  };

  const sorted=[...supplyRaw].sort((a,b)=>{
    if(sortBy==="cost")return derive(b).cpMonth-derive(a).cpMonth;
    if(sortBy==="runway"){const wa=derive(a).weeksLeft;const wb=derive(b).weeksLeft;if(!isFinite(wa)&&!isFinite(wb))return 0;if(!isFinite(wa))return 1;if(!isFinite(wb))return-1;return wa-wb;}
    return a.name.localeCompare(b.name);
  });

  const totalCpWeek=supplyRaw.reduce((a,i)=>a+derive(i).cpWeek,0);
  const totalCpMonth=totalCpWeek*4.33;
  const lowestRunway=supplyRaw.filter(i=>i.weeklyUsage>0).reduce((min,i)=>{const w=derive(i).weeksLeft;return w<min?w:min;},Infinity);

  const startEdit=(item:SupplyRow)=>{
    setEditing((item as {compoundId:string}).compoundId);
    setEditBuf({compoundId:(item as {compoundId:string}).compoundId,name:item.name,category:item.category,color:item.color,currentStock:item.currentStock,stockUnit:item.stockUnit,weeklyUsage:item.weeklyUsage,vendors:(item.vendors as Vendor[]),notes:item.notes});
  };

  const saveEdit=()=>{
    if(!editing||!editBuf.compoundId)return;
    upsertItem({compoundId:editBuf.compoundId,name:editBuf.name??"",category:editBuf.category??"",color:editBuf.color??"#888",currentStock:editBuf.currentStock??0,stockUnit:editBuf.stockUnit??"doses",weeklyUsage:editBuf.weeklyUsage??0,vendors:editBuf.vendors??[],notes:editBuf.notes??""});
    setEditing(null);setEditBuf({});
  };

  return(
    <div style={{padding:"0 0 40px"}}>
      {/* Summary */}
      <div style={{background:"#111",borderBottom:"1px solid #1a1a1a",padding:"16px"}}>
        <div style={{fontSize:9,color:"#555",letterSpacing:"0.15em",marginBottom:8}}>SUPPLY OVERVIEW</div>
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          {[{l:"/ WEEK",v:`$${totalCpWeek.toFixed(2)}`,c:"#cfb86f"},{l:"/ MONTH",v:`$${totalCpMonth.toFixed(2)}`,c:"#6fcf6f"},{l:"ITEMS",v:`${supplyRaw.length}`,c:"#ccc"}].map(m=>(
            <div key={m.l} style={{flex:1,background:"#0d0d0d",border:"1px solid #1f1f1f",borderRadius:8,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>{m.l}</div>
              <div style={{fontSize:15,fontWeight:800,fontFamily:"monospace",color:m.c}}>{m.v}</div>
            </div>
          ))}
        </div>
        {isFinite(lowestRunway)&&(
          <div style={{background:lowestRunway<2?"#2a1a1a":lowestRunway<4?"#2a2a1a":"#1a2a1a",border:`1px solid ${runwayColor(lowestRunway)}40`,borderRadius:6,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:"#888"}}>Lowest runway</span>
            <span style={{fontSize:12,fontWeight:700,color:runwayColor(lowestRunway)}}>{lowestRunway<1?`${Math.round(lowestRunway*7)}d`:`${lowestRunway.toFixed(1)} wks`}</span>
          </div>
        )}
      </div>

      {/* Sort */}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid #1a1a1a",background:"#0d0d0d"}}>
        {[{id:"runway",label:"BY RUNWAY"},{id:"cost",label:"BY COST"},{id:"name",label:"A–Z"}].map(s=>(
          <button key={s.id} onClick={()=>setSortBy(s.id as "runway"|"cost"|"name")} style={{flex:1,padding:"10px 4px",background:"none",border:"none",borderBottom:sortBy===s.id?"2px solid #fff":"2px solid transparent",color:sortBy===s.id?"#fff":"#555",cursor:"pointer",fontSize:10,fontWeight:700,letterSpacing:"0.06em"}}>{s.label}</button>
        ))}
      </div>

      {/* Items */}
      <div style={{padding:"12px 12px 0"}}>
        {sorted.map(item=>{
          const cid=(item as {compoundId:string}).compoundId;
          const d=derive(item);
          const isExp=expandedId===cid;
          const isEdit=editing===cid;
          const runColor=runwayColor(d.weeksLeft);
          const runPct=isFinite(d.weeksLeft)?Math.min(100,(d.weeksLeft/12)*100):100;

          return(
            <div key={cid} style={{marginBottom:8,background:"#111",border:`1px solid ${isEdit?"#333":"#1a1a1a"}`,borderRadius:8,overflow:"hidden"}}>
              <div onClick={()=>!isEdit&&setExpandedId(isExp?null:cid)} style={{padding:"12px 14px",cursor:isEdit?"default":"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:item.color,flexShrink:0}}/>
                      <span style={{fontSize:13,fontWeight:700,color:"#e0e0e0"}}>{item.name}</span>
                    </div>
                    <div style={{fontSize:10,color:"#555",marginLeft:16}}>{item.category} · {item.currentStock} {item.stockUnit}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:12,fontWeight:800,fontFamily:"monospace",color:"#cfb86f"}}>{fmtCost(d.cpMonth)}<span style={{fontSize:9,color:"#555",fontWeight:400}}>/mo</span></div>
                    {item.weeklyUsage>0&&<div style={{fontSize:10,color:runColor,marginTop:2}}>{isFinite(d.weeksLeft)?`${d.weeksLeft.toFixed(1)} wks left`:"∞"}</div>}
                  </div>
                </div>

                {item.weeklyUsage>0&&isFinite(d.weeksLeft)&&(
                  <div style={{height:3,background:"#1a1a1a",borderRadius:2}}>
                    <div style={{height:"100%",width:`${runPct}%`,background:runColor,borderRadius:2,transition:"width 0.3s"}}/>
                  </div>
                )}
              </div>

              {/* Expanded vendor comparison */}
              {isExp&&!isEdit&&(
                <div style={{borderTop:"1px solid #1a1a1a",padding:14}}>
                  <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:8}}>VENDORS</div>
                  {d.vendors.map((v,vi)=>{
                    const cpu=v.unitsPerOrder>0?v.costPerOrder/v.unitsPerOrder:0;
                    const isBest=bestVendorCpu(d.vendors)?.vendor===v;
                    return(
                      <div key={vi} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:vi<d.vendors.length-1?"1px solid #141414":"none"}}>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:isBest?"#6fcf6f":"#ccc"}}>{v.name}{isBest&&" ✓"}</div>
                          {v.url&&<a href={v.url} target="_blank" rel="noreferrer" style={{fontSize:9,color:"#6f8fcf"}}>{v.url.replace(/https?:\/\/(www\.)?/,"").split("/")[0]}</a>}
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:12,fontFamily:"monospace",color:isBest?"#6fcf6f":"#888"}}>{fmtCost(cpu)}<span style={{fontSize:9,color:"#555"}}>/unit</span></div>
                          <div style={{fontSize:9,color:"#555"}}>${v.costPerOrder} / {v.unitsPerOrder} units</div>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{fontSize:10,color:"#666",marginTop:8,lineHeight:1.5}}>{item.notes}</div>
                  <div style={{display:"flex",gap:6,marginTop:10}}>
                    <button onClick={(e)=>{e.stopPropagation();startEdit(item);}} style={{flex:1,padding:"8px",background:"#0d0d0d",border:"1px solid #222",borderRadius:6,color:"#555",fontSize:11,fontWeight:600,cursor:"pointer"}}>✎ Edit</button>
                  </div>
                </div>
              )}

              {/* Edit modal */}
              {isEdit&&(
                <div style={{borderTop:"1px solid #1f1f1f",padding:14,background:"#0d0d0d"}}>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <div style={{display:"flex",gap:8}}>
                      <div style={{flex:2}}>
                        <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>CURRENT STOCK</div>
                        <input type="number" value={editBuf.currentStock??""} onChange={e=>setEditBuf(p=>({...p,currentStock:parseFloat(e.target.value)||0}))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,padding:"8px 10px",color:"#e0e0e0",fontSize:13,outline:"none"}}/>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>UNIT</div>
                        <input value={editBuf.stockUnit??""} onChange={e=>setEditBuf(p=>({...p,stockUnit:e.target.value}))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,padding:"8px 10px",color:"#e0e0e0",fontSize:13,outline:"none"}}/>
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>WEEKLY USAGE</div>
                      <input type="number" step="0.5" value={editBuf.weeklyUsage??""} onChange={e=>setEditBuf(p=>({...p,weeklyUsage:parseFloat(e.target.value)||0}))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,padding:"8px 10px",color:"#e0e0e0",fontSize:13,outline:"none"}}/>
                    </div>
                    {/* Vendor editing */}
                    <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>VENDORS</div>
                    {(editBuf.vendors??[]).map((v,vi)=>(
                      <div key={vi} style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:6,padding:10,marginBottom:4}}>
                        <div style={{display:"flex",gap:6,marginBottom:6}}>
                          <input value={v.name} onChange={e=>setEditBuf(p=>({...p,vendors:p.vendors?.map((vv,i)=>i===vi?{...vv,name:e.target.value}:vv)}))} placeholder="Vendor" style={{flex:1,background:"#0d0d0d",border:"1px solid #222",borderRadius:4,padding:"6px 8px",color:"#fff",fontSize:11,outline:"none"}}/>
                          <input value={v.url} onChange={e=>setEditBuf(p=>({...p,vendors:p.vendors?.map((vv,i)=>i===vi?{...vv,url:e.target.value}:vv)}))} placeholder="URL" style={{flex:2,background:"#0d0d0d",border:"1px solid #222",borderRadius:4,padding:"6px 8px",color:"#6f8fcf",fontSize:11,outline:"none"}}/>
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          <input type="number" step="0.01" value={v.costPerOrder} onChange={e=>setEditBuf(p=>({...p,vendors:p.vendors?.map((vv,i)=>i===vi?{...vv,costPerOrder:parseFloat(e.target.value)||0}:vv)}))} placeholder="$ cost" style={{flex:1,background:"#0d0d0d",border:"1px solid #222",borderRadius:4,padding:"6px 8px",color:"#cfb86f",fontSize:11,outline:"none"}}/>
                          <input type="number" value={v.unitsPerOrder} onChange={e=>setEditBuf(p=>({...p,vendors:p.vendors?.map((vv,i)=>i===vi?{...vv,unitsPerOrder:parseFloat(e.target.value)||0}:vv)}))} placeholder="Units" style={{flex:1,background:"#0d0d0d",border:"1px solid #222",borderRadius:4,padding:"6px 8px",color:"#888",fontSize:11,outline:"none"}}/>
                          <button onClick={()=>setEditBuf(p=>({...p,vendors:p.vendors?.filter((_,i)=>i!==vi)}))} style={{padding:"6px 10px",background:"#1a1010",border:"1px solid #3a1a1a",borderRadius:4,color:"#cf6f6f",fontSize:12,cursor:"pointer"}}>×</button>
                        </div>
                      </div>
                    ))}
                    <button onClick={()=>setEditBuf(p=>({...p,vendors:[...(p.vendors??[]),{name:"",url:"",costPerOrder:0,unitsPerOrder:0}]}))} style={{width:"100%",padding:"6px",background:"#0d0d0d",border:"1px dashed #222",borderRadius:4,color:"#444",fontSize:10,cursor:"pointer"}}>+ Add vendor</button>
                    <div>
                      <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>NOTES</div>
                      <textarea value={editBuf.notes??""} onChange={e=>setEditBuf(p=>({...p,notes:e.target.value}))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,padding:"8px 10px",color:"#b0b0b0",fontSize:12,outline:"none",resize:"none",minHeight:48,fontFamily:"inherit"}}/>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={saveEdit} style={{flex:2,padding:"10px",background:"#1a2f1a",border:"1px solid #2d5a2d",borderRadius:6,color:"#6fcf6f",fontSize:12,fontWeight:700,cursor:"pointer"}}>✓ Save</button>
                      <button onClick={()=>{setEditing(null);setEditBuf({});}} style={{flex:1,padding:"10px",background:"#1a1a1a",border:"1px solid #222",borderRadius:6,color:"#666",fontSize:12,cursor:"pointer"}}>Cancel</button>
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


// ═══════════════════════════════════════════════════════════
// TAB 4: LIBRARY
// ═══════════════════════════════════════════════════════════

function LibraryTab(){
  const[subView,setSubView]=useState<"compounds"|"stacks">("compounds");
  const compounds=useQuery(api.protocol.getCompounds)??[];
  const stacks=useQuery(api.protocol.getStacks)??[];
  const seedCompounds=useMutation(api.protocol.seedCompounds);
  const seedStacks=useMutation(api.protocol.seedStacks);
  const runDeepResearch=useAction(api.protocol.runDeepResearch);
  const setDeepResearchPending=useMutation(api.protocol.setCompoundDeepResearchPending);
  const saveResearchNotes=useMutation(api.protocol.saveCompoundResearch);
  const upsertStack=useMutation(api.protocol.upsertStack);
  const deleteStack=useMutation(api.protocol.deleteStack);
  const seededRef=useRef(false);
  const seededStacksRef=useRef(false);

  const[expanded,setExpanded]=useState<string|null>(null);
  const[tagFilter,setTagFilter]=useState<string|null>(null);
  const[quickResearching,setQuickResearching]=useState<string|null>(null);
  const[searchQuery,setSearchQuery]=useState("");

  // Seed compounds
  useEffect(()=>{
    if(!seededRef.current&&compounds.length===0){
      seededRef.current=true;
      const b1=DEFAULT_COMPOUNDS.slice(0,35);
      const b2=DEFAULT_COMPOUNDS.slice(35);
      seedCompounds({compounds:b1});
      if(b2.length)setTimeout(()=>seedCompounds({compounds:b2}),500);
    }
  },[compounds.length]);

  // Seed stacks
  useEffect(()=>{
    if(!seededStacksRef.current&&stacks.length===0){
      seededStacksRef.current=true;
      const stackSeeds:StackSeed[]=REF_STACKS.map((s,i)=>({
        stackId:`ref_${i}`,name:s.name,color:s.color,
        items:s.items.map(it=>({compoundName:it.compoundName,dose:it.dose,freq:it.freq,notes:it.notes})),
        sortOrder:i,
      }));
      const sb1=stackSeeds.slice(0,6);
      const sb2=stackSeeds.slice(6);
      seedStacks({stacks:sb1});
      if(sb2.length)setTimeout(()=>seedStacks({stacks:sb2}),500);
    }
  },[stacks.length]);

  // Get all unique tags
  const allTags=[...new Set(compounds.flatMap(c=>(c.tags as string[])))].sort();

  // Active compound names from supply
  const supplyRaw=useQuery(api.protocol.getSupply)??[];
  const activeNames=supplyRaw.filter(s=>s.weeklyUsage>0).map(s=>s.name);

  const filtered=compounds.filter(c=>{
    if(tagFilter&&!(c.tags as string[]).includes(tagFilter))return false;
    if(searchQuery&&!c.name.toLowerCase().includes(searchQuery.toLowerCase()))return false;
    return true;
  });

  const runQuickResearch=async(c:typeof compounds[number])=>{
    const cid=(c as {compoundId:string}).compoundId;
    setQuickResearching(cid);
    setExpanded(cid);
    try{
      const res=await fetch("/api/research",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({supplement:c.name,activeStack:activeNames.filter(n=>n!==c.name),currentProtocol:"maintenance"})});
      const data=await res.json();
      if(data.result)saveResearchNotes({compoundId:cid,researchNotes:data.result});
    }catch(e){console.error(e);}
    setQuickResearching(null);
  };

  const startDeep=async(c:typeof compounds[number])=>{
    const cid=(c as {compoundId:string}).compoundId;
    setExpanded(cid);
    await setDeepResearchPending({compoundId:cid});
    runDeepResearch({compoundId:cid,compoundName:c.name,activeStack:activeNames.filter(n=>n!==c.name)}).catch(console.error);
  };

  // Stack editing
  const[editingStack,setEditingStack]=useState<string|null>(null);
  const[stackBuf,setStackBuf]=useState<{name:string;color:string;items:{compoundName:string;dose:string;freq:string;notes?:string}[]}>({name:"",color:"#6f8fcf",items:[]});

  const startEditStack=(s:typeof stacks[number])=>{
    const sid=(s as {stackId:string}).stackId;
    setEditingStack(sid);
    setStackBuf({name:s.name,color:s.color,items:(s.items as {compoundName:string;dose:string;freq:string;notes?:string}[])});
  };

  const saveStack=()=>{
    if(!editingStack)return;
    upsertStack({stackId:editingStack,name:stackBuf.name,color:stackBuf.color,items:stackBuf.items});
    setEditingStack(null);
  };

  const STACK_COLORS=["#6f8fcf","#6fcfcf","#cf6fcf","#cfcf6f","#6fcf6f","#cf6f6f","#cfb86f","#8f8fcf"];

  return(
    <div style={{padding:"0 0 40px"}}>
      {/* Sub-view toggle */}
      <div style={{display:"flex",borderBottom:"1px solid #1f1f1f",background:"#0d0d0d"}}>
        {[{id:"compounds",label:"COMPOUNDS",sub:`${compounds.length}`},{id:"stacks",label:"STACKS",sub:`${stacks.length}`}].map(t=>(
          <button key={t.id} onClick={()=>setSubView(t.id as "compounds"|"stacks")} style={{flex:1,padding:"12px 8px",background:"none",border:"none",borderBottom:subView===t.id?"2px solid #fff":"2px solid transparent",color:subView===t.id?"#fff":"#555",cursor:"pointer"}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:"0.06em"}}>{t.label}</div>
            <div style={{fontSize:9,color:subView===t.id?"#888":"#3a3a3a",marginTop:2}}>{t.sub}</div>
          </button>
        ))}
      </div>

      {/* COMPOUNDS VIEW */}
      {subView==="compounds"&&(
        <div style={{padding:"12px"}}>
          {/* Search */}
          <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search compounds..." style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:8,padding:"10px 14px",color:"#e0e0e0",fontSize:13,outline:"none",marginBottom:10}}/>

          {/* Tag filter */}
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:16}}>
            <button onClick={()=>setTagFilter(null)} style={{padding:"4px 10px",borderRadius:12,background:!tagFilter?"#fff":"#1a1a1a",color:!tagFilter?"#0d0d0d":"#666",border:"1px solid #2a2a2a",fontSize:9,fontWeight:700,cursor:"pointer"}}>ALL</button>
            {allTags.map(tag=>(
              <button key={tag} onClick={()=>setTagFilter(tagFilter===tag?null:tag)} style={{padding:"4px 10px",borderRadius:12,background:tagFilter===tag?"#fff":"#1a1a1a",color:tagFilter===tag?"#0d0d0d":"#666",border:"1px solid #2a2a2a",fontSize:9,fontWeight:700,cursor:"pointer"}}>#{tag}</button>
            ))}
          </div>

          {/* Compound cards */}
          {filtered.map(c=>{
            const cid=(c as {compoundId:string}).compoundId;
            const isExp=expanded===cid;
            const tags=(c.tags as string[]);
            const inStacks=stacks.filter(s=>(s.items as {compoundName:string}[]).some(it=>it.compoundName.toLowerCase().includes(c.name.toLowerCase())));

            return(
              <div key={cid} style={{marginBottom:8,background:"#111",border:"1px solid #1a1a1a",borderRadius:8,overflow:"hidden"}}>
                <div onClick={()=>setExpanded(isExp?null:cid)} style={{padding:"12px 14px",cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:"#e0e0e0"}}>{c.name}</div>
                      <div style={{fontSize:10,color:"#555"}}>{c.category}</div>
                    </div>
                    <span style={{color:"#555",fontSize:12}}>{isExp?"▲":"▼"}</span>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {tags.map(tag=>(
                      <span key={tag} style={{fontSize:8,padding:"2px 6px",borderRadius:8,background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#888"}}>#{tag}</span>
                    ))}
                  </div>
                  {inStacks.length>0&&(
                    <div style={{marginTop:6,fontSize:9,color:"#6f8fcf"}}>In stacks: {inStacks.map(s=>s.name).join(" · ")}</div>
                  )}
                </div>

                {isExp&&(
                  <div style={{borderTop:"1px solid #1a1a1a",padding:14}}>
                    <div style={{display:"flex",gap:6,marginBottom:10}}>
                      <button onClick={(e)=>{e.stopPropagation();runQuickResearch(c);}} disabled={quickResearching===cid} style={{flex:1,padding:"8px",background:"#0d0d0d",border:"1px solid #2a2a1a",borderRadius:6,color:quickResearching===cid?"#555":"#cfb86f",fontSize:11,fontWeight:600,cursor:quickResearching===cid?"default":"pointer"}}>{quickResearching===cid?"⚡ Thinking…":"⚡ Quick Research"}</button>
                      <button onClick={(e)=>{e.stopPropagation();startDeep(c);}} disabled={(c as {deepResearchStatus?:string}).deepResearchStatus==="pending"} style={{flex:1,padding:"8px",background:"#090f09",border:"1px solid #1a3a1a",borderRadius:6,color:(c as {deepResearchStatus?:string}).deepResearchStatus==="pending"?"#4a8f4a":"#6fcf6f",fontSize:11,fontWeight:600,cursor:(c as {deepResearchStatus?:string}).deepResearchStatus==="pending"?"default":"pointer"}}>{(c as {deepResearchStatus?:string}).deepResearchStatus==="pending"?"🔬 Running…":"🔬 Deep Research"}</button>
                    </div>

                    {(c as {deepResearchStatus?:string}).deepResearchStatus==="pending"&&(
                      <div style={{padding:"6px 10px",background:"#090f09",border:"1px solid #1a3a1a",borderRadius:4,marginBottom:10}}>
                        <span style={{fontSize:10,color:"#4a8f4a"}}>🔬 Deep research running… results appear when complete.</span>
                      </div>
                    )}

                    {(c as {deepResearchNotes?:string}).deepResearchNotes&&(c as {deepResearchStatus?:string}).deepResearchStatus==="done"&&(
                      <div style={{marginBottom:10}}>
                        <div style={{fontSize:9,color:"#4a8f4a",letterSpacing:"0.1em",marginBottom:6}}>🔬 DEEP RESEARCH</div>
                        <ResearchDisplay text={(c as {deepResearchNotes:string}).deepResearchNotes} accentColor="#6fcf6f"/>
                      </div>
                    )}

                    {(c as {researchNotes?:string}).researchNotes&&(
                      <div>
                        <div style={{fontSize:9,color:"#7a7a2a",letterSpacing:"0.1em",marginBottom:6}}>⚡ QUICK SUMMARY</div>
                        <ResearchDisplay text={(c as {researchNotes:string}).researchNotes} accentColor="#cfb86f"/>
                      </div>
                    )}

                    {!(c as {researchNotes?:string}).researchNotes&&!(c as {deepResearchNotes?:string}).deepResearchNotes&&(
                      <div style={{fontSize:11,color:"#333",fontStyle:"italic"}}>No research yet. Tap ⚡ Quick or 🔬 Deep to generate.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* STACKS VIEW */}
      {subView==="stacks"&&(
        <div style={{padding:"12px"}}>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
            <button onClick={()=>{const id=`stack_${Date.now()}`;upsertStack({stackId:id,name:"New Stack",color:STACK_COLORS[stacks.length%STACK_COLORS.length],items:[{compoundName:"",dose:"",freq:"",notes:""}]});setEditingStack(id);setStackBuf({name:"New Stack",color:STACK_COLORS[stacks.length%STACK_COLORS.length],items:[{compoundName:"",dose:"",freq:""}]});}} style={{padding:"8px 14px",background:"#1a2f1a",border:"1px solid #2d5a2d",borderRadius:6,color:"#6fcf6f",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ New Stack</button>
          </div>

          {stacks.map(s=>{
            const sid=(s as {stackId:string}).stackId;
            const isEdit=editingStack===sid;
            const isExp=expanded===sid;
            const items=(s.items as {compoundName:string;dose:string;freq:string;notes?:string}[]);

            return(
              <div key={sid} style={{marginBottom:8,background:"#111",border:"1px solid #1a1a1a",borderRadius:8,overflow:"hidden"}}>
                <div onClick={()=>!isEdit&&setExpanded(isExp?null:sid)} style={{padding:"12px 14px",cursor:isEdit?"default":"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:s.color}}/>
                      <span style={{fontSize:13,fontWeight:700,color:"#e0e0e0"}}>{s.name}</span>
                      <span style={{fontSize:9,color:"#555"}}>{items.length} compounds</span>
                    </div>
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={(e)=>{e.stopPropagation();startEditStack(s);}} style={{padding:"4px 8px",background:"#1a1a1a",border:"1px solid #222",borderRadius:4,color:"#555",fontSize:10,cursor:"pointer"}}>✎</button>
                      <button onClick={(e)=>{e.stopPropagation();if(confirm("Delete stack?"))deleteStack({stackId:sid});}} style={{padding:"4px 8px",background:"#1a1a1a",border:"1px solid #222",borderRadius:4,color:"#444",fontSize:10,cursor:"pointer"}}>×</button>
                    </div>
                  </div>
                </div>

                {isExp&&!isEdit&&(
                  <div style={{borderTop:"1px solid #1a1a1a",padding:14}}>
                    {items.filter(it=>it.compoundName).map((it,ii)=>(
                      <div key={ii} style={{padding:"6px 0",borderBottom:ii<items.length-1?"1px solid #141414":"none"}}>
                        <div style={{display:"flex",justifyContent:"space-between"}}>
                          <span style={{fontSize:12,fontWeight:700,color:"#e0e0e0"}}>{it.compoundName}</span>
                          <span style={{fontSize:10,color:s.color}}>{it.dose}</span>
                        </div>
                        {it.freq&&<div style={{fontSize:10,color:"#888"}}>{it.freq}</div>}
                        {it.notes&&<div style={{fontSize:10,color:"#555"}}>{it.notes}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {isEdit&&(
                  <div style={{borderTop:"1px solid #1f1f1f",padding:14,background:"#0d0d0d"}}>
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>NAME</div>
                      <input value={stackBuf.name} onChange={e=>setStackBuf(p=>({...p,name:e.target.value}))} style={{width:"100%",background:"#111",border:"1px solid #222",borderRadius:6,padding:"8px 10px",color:"#fff",fontSize:14,fontWeight:700,outline:"none"}}/>
                    </div>
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:4}}>COLOR</div>
                      <div style={{display:"flex",gap:6}}>
                        {STACK_COLORS.map(c=>(
                          <div key={c} onClick={()=>setStackBuf(p=>({...p,color:c}))} style={{width:24,height:24,borderRadius:"50%",background:c,cursor:"pointer",border:stackBuf.color===c?"2px solid #fff":"2px solid transparent",opacity:stackBuf.color===c?1:0.5}}/>
                        ))}
                      </div>
                    </div>
                    <div style={{fontSize:9,color:"#555",letterSpacing:"0.1em",marginBottom:6}}>COMPOUNDS ({stackBuf.items.length})</div>
                    {stackBuf.items.map((it,ii)=>(
                      <div key={ii} style={{background:"#111",border:"1px solid #1f1f1f",borderRadius:6,padding:8,marginBottom:4}}>
                        <div style={{display:"flex",gap:6,marginBottom:4}}>
                          <input value={it.compoundName} onChange={e=>setStackBuf(p=>({...p,items:p.items.map((x,i)=>i===ii?{...x,compoundName:e.target.value}:x)}))} placeholder="Compound" style={{flex:2,background:"#0d0d0d",border:"1px solid #222",borderRadius:4,padding:"6px 8px",color:"#fff",fontSize:11,outline:"none"}}/>
                          <input value={it.dose} onChange={e=>setStackBuf(p=>({...p,items:p.items.map((x,i)=>i===ii?{...x,dose:e.target.value}:x)}))} placeholder="Dose" style={{flex:1,background:"#0d0d0d",border:"1px solid #222",borderRadius:4,padding:"6px 8px",color:"#cfb86f",fontSize:11,outline:"none"}}/>
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          <input value={it.freq} onChange={e=>setStackBuf(p=>({...p,items:p.items.map((x,i)=>i===ii?{...x,freq:e.target.value}:x)}))} placeholder="Frequency" style={{flex:1,background:"#0d0d0d",border:"1px solid #222",borderRadius:4,padding:"6px 8px",color:"#888",fontSize:11,outline:"none"}}/>
                          <button onClick={()=>setStackBuf(p=>({...p,items:p.items.filter((_,i)=>i!==ii)}))} style={{padding:"6px 10px",background:"#1a1010",border:"1px solid #3a1a1a",borderRadius:4,color:"#cf6f6f",fontSize:12,cursor:"pointer"}}>×</button>
                        </div>
                      </div>
                    ))}
                    <button onClick={()=>setStackBuf(p=>({...p,items:[...p.items,{compoundName:"",dose:"",freq:""}]}))} style={{width:"100%",padding:"6px",background:"#0d0d0d",border:"1px dashed #222",borderRadius:4,color:"#444",fontSize:10,cursor:"pointer",marginBottom:10}}>+ Add compound</button>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={saveStack} style={{flex:2,padding:"10px",background:"#1a2f1a",border:"1px solid #2d5a2d",borderRadius:6,color:"#6fcf6f",fontSize:12,fontWeight:700,cursor:"pointer"}}>✓ Save</button>
                      <button onClick={()=>setEditingStack(null)} style={{flex:1,padding:"10px",background:"#1a1a1a",border:"1px solid #222",borderRadius:6,color:"#666",fontSize:12,cursor:"pointer"}}>Cancel</button>
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

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════

export default function DailyProtocol(){
  const[page,setPage]=useState("schedule");

  const TABS=[{id:"schedule",label:"SCHEDULE"},{id:"log",label:"LOG"},{id:"supply",label:"SUPPLY"},{id:"library",label:"LIBRARY"}];

  return(
    <div style={{minHeight:"100vh",background:"#0d0d0d",color:"#e0e0e0",fontFamily:"-apple-system, BlinkMacSystemFont, sans-serif"}}>
      {/* Nav */}
      <div style={{display:"flex",borderBottom:"1px solid #1f1f1f",position:"sticky",top:0,zIndex:20,background:"#0d0d0d"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setPage(t.id)} style={{flex:1,padding:"14px 0",background:"none",border:"none",borderBottom:page===t.id?"2px solid #fff":"2px solid transparent",color:page===t.id?"#fff":"#555",cursor:"pointer",fontSize:10,fontWeight:800,letterSpacing:"0.08em"}}>
            {t.label}
          </button>
        ))}
      </div>

      {page==="schedule"&&<ScheduleTab/>}
      {page==="log"&&<LogTab/>}
      {page==="supply"&&<SupplyTab/>}
      {page==="library"&&<LibraryTab/>}
    </div>
  );
}
