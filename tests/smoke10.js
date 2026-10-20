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
    w.localStorage.setItem("plan2028:app:v3", JSON.stringify({ onboarded: true, inputs: {}, prefs: { days: [0, 2, 4] }, weights: [{ id: "a", d: dd(14), kg: 70 }, { id: "b", d: dd(10), kg: 70.0 }, { id: "c", d: dd(5), kg: 70.05 }, { id: "d", d: dd(1), kg: 70.1 }], meas: [{ id: "m1", d: dd(40), arm: 31, chest: 92, waist: 76 }] }));
    w.Plan2028 = {  saveFile(n,m,c){ w.__saved = [n,m,c.length,c]; },  schedule(j){ sched = JSON.parse(j); }, haptic(){}, share(){}, widget(){}, takePending: () => "[]", notifyState: () => "granted", requestNotify(){}, copy(t){ w.__copied = t; }, healthState: () => "unsupported" };
  }});
const w = dom.window, d = w.document, $ = id => d.getElementById(id), tick = ms => new Promise(r => setTimeout(r, ms));
const st = () => JSON.parse(w.localStorage.getItem("plan2028:app:v3"));
(async () => {
  try {
    await tick(500);
    const items = () => [...$("dpList").querySelectorAll(".cell")].map(c => (c.querySelector(".ck2.on") ? "✓" : "·") + c.querySelector("b").textContent);
    console.log("dayplan:", $("dpScore").textContent, "|", items().join(" / "));
    console.log("streak sub:", $("wStreakSub").textContent);
    d.querySelector('.tb[data-go="traening"]').click(); await tick(80);
    console.log("goal:", $("tGoalN").textContent, "| seg:", [...$("segW").querySelectorAll("button")].map(b => b.textContent).join(","), "| tPhase:", $("tPhase").textContent);
    console.log("body:", $("bdMode").textContent, $("bdKcal").textContent, $("bdProt").textContent, $("bdKg").textContent, "| phase:", $("bdPhase").textContent);
    console.log("first row cue:", $("wList").querySelector(".t span").textContent.slice(0, 60));
    for (const k of ["B", "C", "D"]) { $("w" + k).click(); await tick(20); console.log("pas", k, ":", [...$("wList").querySelectorAll(".exrow")].map(r => r.querySelector("b").textContent + " " + r.querySelector(".v").textContent).join(", ")); }
    // protein
    d.querySelector('#pfChips [data-pf="35"]').click(); await tick(40);
    console.log("protein:", $("pfTxt").textContent, "| snack:", $("snackTxt").textContent);
    for (let i = 0; i < 5; i++) { d.querySelector('#pfChips [data-pf="21"]').click(); await tick(20); }
    console.log("protein after:", $("pfTxt").textContent, "| state:", JSON.stringify(st().food));
    console.log("migrated days:", JSON.stringify(st().prefs.days), "| rate:", $("wtRate").textContent, "| advice:", $("wtAdvice").textContent.slice(0, 160));
    const kcal0 = $("bdKcal").textContent; $("wtAdvice").querySelector("[data-adj]").click(); await tick(40);
    console.log("adjust:", kcal0, "->", $("bdKcal").textContent, "| adj:", st().body.adj);
    console.log("meas:", $("msTxt").textContent);
    // weigh in today
    d.querySelector('[data-sheet="vej"]').click(); await tick(60); console.log("vej prefill:", $("vj-kg").value, "| list:", $("vj-list").children.length);
    $("vj-kg").value = "70.6"; $("vj-save").click(); await tick(450); console.log("weights:", st().weights.length, "| kg:", $("bdKg").textContent, "| chart pts:", ($("wtChart").innerHTML.match(/points="([^"]+)"/) || ["",""])[1].split(" ").length);
    // measure
    d.querySelector('[data-sheet="maal"]').click(); await tick(60); $("ml-arm").value = "32.5"; $("ml-waist").value = "78.5"; $("ml-save").click(); await tick(450); console.log("meas2:", $("msTxt").textContent);
    // mode switch
    d.querySelector('[data-sheet="body"]').click(); await tick(60); console.log("body form:", $("bd-h").value, $("bd-w").value, $("bd-age").value, "| why:", $("bd-why").textContent.slice(0, 60));
    d.querySelector('[data-bmode="cut"]').click(); $("bd-save").click(); await tick(450);
    console.log("cut:", $("bdMode").textContent, $("bdKcal").textContent, $("bdProt").textContent, "| phase:", $("bdPhase").textContent, "| adj reset:", st().body.adj);
    console.log("food:", $("fdDay").textContent, $("fdMonth").textContent);
    // workout rotation: D has 4 sets of lateral raises
    $("trainNow").click(); await tick(80); console.log("session:", $("wo-h").textContent, "| sets:", $("wo-list").querySelectorAll(".set").length, "| cue shown:", !!$("wo-list").querySelector(".cue"));
    $("woD").click(); await tick(40); console.log("D lat sets:", $("wo-list").querySelectorAll('[data-row^="lat:"]').length, "| title:", $("wo-h").textContent);
    $("woA").click(); await tick(40);
    ["bench:0", "row:0"].forEach(k => d.querySelector('[data-chk="' + k + '"]').click()); await tick(30); $("restSkip").click();
    $("wo-finish").click(); await tick(500); $("mdOk").click(); await tick(400);
    console.log("after finish lastPas:", st().lastPas, "| next suggested:", $("tnSub").textContent, "| seg pressed:", d.querySelector('#segW [aria-pressed="true"]').textContent);
    // home day plan
    d.querySelector('.tb[data-go="hjem"]').click(); await tick(80);
    console.log("dayplan:", $("dpScore").textContent, "|", items().join(" / "));
    d.querySelector('[data-hab="sleep"]').click(); await tick(40); d.querySelector('[data-hab="su"]').click(); await tick(40);
    console.log("dayplan after:", $("dpScore").textContent, "| habits:", JSON.stringify(st().habits));
    console.log("home ring/insights:", [...d.querySelectorAll(".in b")].map(b => b.textContent).filter(t => /pas|Vej|protein/i.test(t)).join(" / "));
  } catch (e) { errors.push("TEST: " + e.stack); }
  console.log("errors:", errors.length ? errors : "none"); process.exit(0);
})();
