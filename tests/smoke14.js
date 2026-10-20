const { JSDOM } = require("jsdom");
const fs = require("fs");
const html = "<!doctype html><html><head></head><body>" + fs.readFileSync(process.argv[2], "utf8") + "</body></html>";
const errors = []; let sched = null;
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: "https://example.test/app", userAgent: "Mozilla/5.0 Plan2028App",
  beforeParse(w) {
    w.matchMedia = () => ({ matches: false });
    w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: () => () => {} });
    w.addEventListener("error", e => errors.push(e.message + " @" + e.lineno));
    w.scrollTo = () => {};
    const dd = n => { const x = new Date(); x.setDate(x.getDate() - n); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
    const mon = (() => { const x = new Date(); const d = (x.getDay() + 6) % 7; x.setDate(x.getDate() - d); return x; })(); const wd = n => { const x = new Date(mon); x.setDate(x.getDate() + n); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
    w.localStorage.setItem("plan2028:app:v3", JSON.stringify({ onboarded: true, inputs: {}, shifts: [], wardrobe: [["tee","white"],["tee","black"],["shirt","lblue"],["knit","navy"],["turtleneck","black"],["hoodie","grey"],["overshirt","olive"],["leather","black"],["blazer","navy"],["puffer","black"],["jeans","ddenim"],["chinos","sand"],["cargo","olive"],["trousers","grey"],["sneakers","white"],["chelsea","brown"],["loafers","brown"],["watch","silver"],["scarf","grey"],["beanie","charcoal"],["chain","silver"]].map((x, i) => ({ id: "w" + i, t: x[0], c: x[1] })), outfits: { saved: [], worn: [] } }));
    w.Plan2028 = { vibrate(p){ w.__vib = (w.__vib||0)+1; }, keepAwake(on){ w.__awake = on; },   saveFile(n,m,c){ w.__saved = [n,m,c.length,c]; },  schedule(j){ sched = JSON.parse(j); }, haptic(){}, share(){}, widget(){}, takePending: () => "[]", notifyState: () => "granted", requestNotify(){}, copy(t){ w.__copied = t; }, healthState: () => "unsupported" };
  }});
const st = () => JSON.parse(w.localStorage.getItem("plan2028:app:v3"));
const w = dom.window, d = w.document, $ = id => d.getElementById(id), tick = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  try {
    await tick(500);
    d.querySelector('.tb[data-go="dig"]').click(); await tick(60);
    $("dgO").click(); await tick(200);
    const cards = () => [...$("ofCards").querySelectorAll(".ofcard")].map(c => c.querySelector(".ofscore").textContent + " | " + [...c.querySelectorAll(".ofitems > *")].map(x => x.textContent.replace("↻", "")).join(" + "));
    console.log("styles:", $("ofStyle").children.length, "| occs:", $("ofOcc").children.length);
    cards().forEach(c => console.log("  hverdag:", c));
    d.querySelector('[data-wx="frost"]').click(); await tick(60); cards().forEach(c => console.log("  frost:", c));
    for (const st of ["oldmoney", "street", "minimal"]) { d.querySelector('[data-ostyle="' + st + '"]').click(); await tick(60); console.log("  style", st, ":", cards()[0]); }
    d.querySelector('[data-ostyle="alle"]').click(); d.querySelector('[data-wx="koldt"]').click();
    d.querySelector('[data-occ="bryllup"]').click(); await tick(60); console.log("  bryllup:", cards()[0]);
    d.querySelector('[data-occ="byen"]').click(); await tick(60); console.log("  byen:", cards()[0]);
    d.querySelector('[data-occ="hverdag"]').click(); await tick(60);
    // swap
    const before = cards()[0]; $("ofCards").querySelector('[data-swap="0:shoes"]').click(); await tick(40); console.log("swap shoes:", before.split("|")[1].trim().split(" + ").pop(), "->", cards()[0].split("|")[1].trim().split(" + ").filter(x => /Sneakers|boots|sko/i.test(x)).join());
    $("ofCards").querySelector('[data-swap="0:top"]').click(); await tick(40); console.log("swap top:", cards()[0]);
    // lock
    [...$("wdList").querySelectorAll(".cell")].find(c => c.textContent.includes("Cargobukser")).querySelector("[data-lockg]").click(); await tick(100);
    console.log("lock:", $("ofLockTxt").textContent, "| bar visible:", !$("ofLock").hidden, "| all cargo:", cards().every(c => c.includes("Cargobukser")), "|", cards()[0]);
    $("ofUnlock").click(); await tick(60); console.log("unlocked:", $("ofLock").hidden);
    // week
    $("ofWeekBtn").click(); await tick(80);
    console.log("week rows:", $("wk-list").children.length, "|", [...$("wk-list").querySelectorAll(".wkt")].map(x => x.querySelector("b").textContent + ": " + x.querySelector("p").textContent.split(" · ").slice(-3, -1).join("/")).join(" || ").slice(0, 400));
    d.querySelector("#sheet-week [data-close]").click(); await tick(450);
    // pattern garment
    d.querySelector('#digOutfit [data-sheet="garment"]').click(); await tick(60);
    d.querySelector('[data-gt="shirt"]').click(); d.querySelector('[data-gc="white"]').click(); d.querySelector('[data-gp="stripe"]').click();
    console.log("prev:", $("gm-prev").textContent, "| slots:", $("gm-types").querySelectorAll(".gslot").length, "| colors:", $("gm-colors").children.length);
    $("gm-save").click(); await tick(450);
    console.log("patterned saved:", JSON.stringify(st().wardrobe.filter(w => w.p)));
    console.log("pattern defs in svgs:", $("ofCards").innerHTML.includes("<pattern") || "none in current cards");
    // Mig
    $("dgM").click(); await tick(80);
    console.log("thought:", $("meThought").textContent.slice(0, 50), "| check card:", $("meCheck").querySelector(".ttl").textContent, "| chal:", $("meChal").querySelector(".chtxt").textContent.slice(0, 50));
    $("meSave").click(); await tick(40); console.log("needs mood:", $("snackTxt") ? "" : "", $("meCheck").textContent.includes("Hvordan"));
    d.querySelector('[data-mood="4"]').click(); await tick(20); d.querySelector('[data-energy="3"]').click(); await tick(20);
    d.querySelector('[data-good="0"]').value = "Trænede bryst"; $("meSave").click(); await tick(450);
    console.log("journal:", JSON.stringify(st().journal), "| summary:", $("meCheck").textContent.slice(0, 80), "| chart rects:", $("meChart").querySelectorAll("rect").length);
    $("meChalBtn").click(); await tick(60); console.log("challenge:", JSON.stringify(st().me.ch), $("meChalBtn").textContent);
    d.querySelector('#digMe [data-sheet="vision"]').click(); await tick(60);
    ["Modig", "Disciplineret", "Venlig", "Rolig"].forEach(v => d.querySelector('[data-val="' + v + '"]').click());
    $("vs-text").value = "Stærk, rolig og med styr på økonomien."; $("vs-save").click(); await tick(450);
    console.log("vision:", JSON.stringify(st().me.values), "|", $("meVision").textContent.slice(0, 80));
    d.querySelector('#digMe [data-sheet="pgoal"]').click(); await tick(60);
    $("pg-t").value = "Løb 5 km"; d.querySelector('[data-parea="krop"]').click(); $("pg-p").value = "40"; $("pg-p").dispatchEvent(new w.Event("input")); $("pg-save").click(); await tick(450);
    console.log("goals:", JSON.stringify(st().me.goals.map(g => [g.t, g.a, g.p])), "|", $("meGoals").textContent.slice(0, 50));
    $("meGoals").querySelector(".sw .cell").click(); await tick(60); console.log("edit goal:", $("pg-h").textContent, $("pg-t").value);
    $("pg-p").value = "100"; $("pg-save").click(); await tick(500); console.log("100%:", st().me.goals[0].p);
    $("dgL").click(); await tick(60); console.log("xp:", $("lnXP").textContent, "| lessons:", $("lnCount").textContent, "| tracks:", [...$("lnTracks").querySelectorAll("b")].map(b => b.textContent).slice(-4).join(", "));
  } catch (e) { errors.push("TEST: " + e.stack); }
  console.log("errors:", errors.length ? errors : "none"); process.exit(0);
})();
