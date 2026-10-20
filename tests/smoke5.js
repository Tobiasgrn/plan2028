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
    w.localStorage.setItem("plan2028:app:v3", JSON.stringify({ onboarded: true, inputs: {} }));
    w.Plan2028 = { schedule(j){ sched = JSON.parse(j); }, haptic(){}, share(){}, widget(){}, takePending: () => "[]", notifyState: () => "granted", requestNotify(){}, copy(t){ w.__copied = t; }, healthState: () => "unsupported" };
  }});
const w = dom.window, d = w.document, $ = id => d.getElementById(id), tick = ms => new Promise(r => setTimeout(r, ms));
const st = () => JSON.parse(w.localStorage.getItem("plan2028:app:v3"));
(async () => {
  try {
    await tick(500);
    console.log("tabs:", [...d.querySelectorAll(".tb")].map(b => b.textContent.trim()).join(","), "| home widget:", $("wsSub").textContent);
    d.querySelector('.tb[data-go="startup"]').click(); await tick(60);
    console.log("startup visible:", !$("s-startup").hidden, "| ideas:", $("ideas").children.length, "| calc:", $("scProfit").dataset.v, "|", $("scGap").textContent, "|", $("scNeed").textContent);
    console.log("rules:", [...d.querySelectorAll("#rulesList b")].map(b => b.textContent).join(" / "));
    d.querySelector('[data-idea="video"]').click(); await tick(60);
    console.log("idea now:", st().startup.idea, "| plan s1:", st().startup.plan.s1, "| calc:", $("scIdea").textContent, $("scProfit").dataset.v, $("scNeed").textContent.slice(0, 80));
    $("scRn").value = "3"; $("scRn").dispatchEvent(new w.Event("input")); await tick(30);
    console.log("after slider:", $("scGap").textContent, "|", $("scNeed").textContent);
    // lead
    d.querySelector('[data-sheet="lead"]').click(); await tick(50);
    $("ld-name").value = "Café Mokka"; d.querySelector('[data-stage="kontakt"]').click();
    const nd = new Date(Date.now() + 2 * 864e5); $("ld-next").value = nd.toISOString().slice(0, 10);
    $("ld-save").click(); await tick(500);
    console.log("leads:", JSON.stringify(st().startup.leads.map(l => [l.name, l.stage, l.val])), "| stages:", $("stages").textContent.replace(/\s+/g, ""));
    await tick(900);
    console.log("lead notif:", (sched || []).filter(x => x.kind === "lead").map(x => x.title).join(","));
    // win lead
    $("leadList").querySelector(".cell").click(); await tick(50);
    d.querySelector('[data-stage="vundet"]').click(); $("ld-save").click(); await tick(500);
    console.log("snack:", $("snackTxt").textContent, "/", $("snackBtn").textContent, "| plan s6:", st().startup.plan.s6);
    $("snackBtn").click(); await tick(80);
    console.log("stx sheet opened:", !$("sheet-stx").hidden, "| desc:", $("sx-desc").value, "| amt:", $("sx-amt").value);
    $("sx-amt").value = "2500"; $("sx-hours").value = "8"; $("sx-rec").checked = true; $("sx-save").click(); await tick(500);
    d.querySelector('[data-sheet="stx"][data-kind="out"]').click(); await tick(50); $("sx-amt").value = "200"; $("sx-desc").value = "Kameraudstyr"; $("sx-save").click(); await tick(500);
    console.log("hero profit:", $("suProfit").dataset.v, "| MRR:", $("suMrr").textContent, "| rate:", $("suRate").textContent, "| ledger rows:", $("stxList").querySelectorAll(".sw").length);
    // template
    d.querySelector('[data-tpl="2"]').click(); await tick(50);
    console.log("tpl:", $("tp-h").textContent, "|", $("tp-text").value.split("\n").slice(4, 6).join(" / "));
    $("tp-copy").click(); console.log("copied chars:", (w.__copied || "").length);
    d.querySelector("#sheet-tpl [data-close]").click(); await tick(450);
    // delete with undo
    $("stxList").querySelector("[data-del]").click(); await tick(500);
    console.log("after delete:", st().startup.tx.length, "|", $("snackTxt").textContent); $("snackBtn").click(); await tick(50); console.log("after undo:", st().startup.tx.length);
    // plan toggle
    d.querySelector('[data-plan="demo"]').click(); console.log("plan pct:", $("planPct").textContent);
    d.querySelector('.tb[data-go="hjem"]').click(); await tick(60);
    console.log("home widget:", $("wsProfit").dataset.v, $("wsSub").textContent, "| insights:", [...d.querySelectorAll(".in b")].map(b => b.textContent).filter(t => /startup|Følg|Byg/i.test(t)).join(" / "));
    d.querySelector('[data-go="tjek"]').click(); await tick(60);
    console.log("tjek visible:", !$("s-tjek").hidden, "| pill opacity:", $("tabpill").style.opacity, "| badges:", Object.keys(st().badges).join(","));
  } catch (e) { errors.push("TEST: " + e.stack); }
  console.log("errors:", errors.length ? errors : "none"); process.exit(0);
})();
