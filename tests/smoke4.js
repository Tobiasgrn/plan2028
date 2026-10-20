const { JSDOM } = require("jsdom");
const fs = require("fs");
const html = "<!doctype html><html><head></head><body>" + fs.readFileSync(process.argv[2], "utf8") + "</body></html>";
const errors = [], calls = { sync: 0 };
const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const now = new Date(), y1 = new Date(now - 864e5), y3 = new Date(now - 3 * 864e5);
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: "https://example.test/app", userAgent: "Mozilla/5.0 Plan2028App",
  beforeParse(w) {
    w.matchMedia = () => ({ matches: false });
    w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: () => () => {} });
    w.addEventListener("error", e => errors.push(e.message + " @" + e.lineno));
    w.scrollTo = () => {};
    w.localStorage.setItem("plan2028:app:v3", JSON.stringify({ onboarded: true, inputs: {} }));
    w.Plan2028 = { schedule(){}, haptic(){}, share(){}, widget(){}, takePending: () => "[]", notifyState: () => "granted", requestNotify(){}, copy(){},
      healthState: () => "granted", healthConnect(){},
      healthSync(){ calls.sync++; setTimeout(() => w.appHealth(JSON.stringify({ steps: { [iso(now)]: 6420, [iso(y1)]: 9100 }, sessions: [{ d: iso(y3), start: +y3, mins: 42, title: "Styrketræning" }, { d: iso(y1), start: +y1, mins: 8, title: "Gåtur" }] })), 20); } };
  }});
const w = dom.window, d = w.document, $ = id => d.getElementById(id), tick = ms => new Promise(r => setTimeout(r, ms));
const st = () => JSON.parse(w.localStorage.getItem("plan2028:app:v3"));
(async () => {
  try {
    await tick(1300);
    console.log("health sync calls:", calls.sync, "| sessions:", st().health.sessions.length, "| steps today:", st().health.steps[iso(now)]);
    d.querySelector('[data-go="traening"]').click(); await tick(60);
    console.log("step card:", $("stepBody").textContent.replace(/\s+/g, " ").slice(0, 60));
    console.log("week score incl. health (if this week):", $("tScore").textContent, "| hc markers:", d.querySelectorAll("#tracker .day.hc").length);
    // workout
    $("trainNow").click(); await tick(60);
    console.log("workout:", $("wo-h").textContent, "| exercises:", $("wo-list").querySelectorAll(".exc").length, "| sets:", $("wo-list").querySelectorAll(".set").length);
    d.querySelector('[data-st="w+"][data-ex="bench"][data-i="0"]').click();
    console.log("bench w after +:", d.querySelector('[data-f="w"][data-ex="bench"][data-i="0"]').value);
    ["bench:0", "bench:1", "bench:2", "row:0"].forEach(k => d.querySelector('[data-chk="' + k + '"]').click());
    await tick(50);
    console.log("rest timer on:", !$("rest").hidden, $("restTime").textContent);
    $("restSkip").click();
    $("wo-finish").click(); await tick(500);
    const s1 = st();
    console.log("lifts:", s1.lifts.map(l => l.ex + ":" + l.sets.map(x => x.w + "x" + x.r).join(",")).join(" | "), "| trained today:", s1.workouts.includes(iso(now)));
    console.log("modal:", $("mdOver").textContent, "-", $("mdTitle").textContent, "-", $("mdText").textContent.slice(0, 50));
    $("mdOk").click(); await tick(400); if (!$("modal").hidden) $("mdOk").click(); await tick(400);
    console.log("records:", $("recList").textContent.replace(/\s+/g, " ").slice(0, 80));
    console.log("next suggestion row:", d.querySelector("#wList").textContent.replace(/\s+/g, " ").slice(0, 120));
    d.querySelector('[data-exh="bench"]').click(); await tick(50);
    console.log("ex sheet:", $("eh-h").textContent, "| PR:", $("eh-pr").textContent, "| next:", $("eh-next").textContent);
    d.querySelector("#sheet-ex [data-close]").click(); await tick(450);
    // economy
    d.querySelector('[data-go="penge"]').click(); await tick(60);
    d.querySelector('[data-sheet="udgift"]').click(); await tick(50);
    $("ex-amt").value = "250"; $("ex-amt").dispatchEvent(new w.Event("input"));
    d.querySelector('[data-cat="tra"]').click(); $("ex-note").value = "Rejsekort";
    console.log("exp preview:", $("ex-prev").textContent);
    $("ex-save").click(); await tick(450);
    console.log("spend:", $("spSpent").dataset.v, $("spSub").textContent, "| legend:", $("spLegend").textContent);
    d.querySelector('[data-sheet="fordel"]').click(); await tick(50);
    console.log("fordel est:", $("fd-amt").value, "| keep/m/a:", $("fd-keep").textContent, $("fd-m").textContent, $("fd-a").textContent);
    $("fd-go").click(); await tick(450);
    console.log("deposits after fordel:", JSON.stringify(st().deposits.map(x => [x.k, x.amt])));
    console.log("goal next:", $("goalNext").textContent, "| list:", $("goalList").textContent.replace(/\s+/g, " ").slice(0, 70));
    d.querySelector('[data-sheet="goal"]').click(); await tick(50);
    d.querySelector('[data-gi="0"]').value = "15000"; $("gl-rows").dispatchEvent(new w.Event("input"));
    console.log("goal total:", $("gl-total").textContent); $("gl-save").click(); await tick(450);
    console.log("goal now:", st().inputs.goal);
    d.querySelector('[data-sheet="askval"]').click(); await tick(50); $("av-amt").value = "27500"; $("av-save").click(); await tick(450);
    console.log("ask gain:", $("askGain").textContent);
    console.log("insights:", [...d.querySelectorAll(".in b")].map(b => b.textContent).join(" / "));
    console.log("badges:", Object.keys(st().badges).join(","));
  } catch (e) { errors.push("TEST: " + e.stack); }
  console.log("errors:", errors.length ? errors : "none"); process.exit(0);
})();
