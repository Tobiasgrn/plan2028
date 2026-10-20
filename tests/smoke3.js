const { JSDOM } = require("jsdom");
const fs = require("fs");
const html = "<!doctype html><html><head></head><body>" + fs.readFileSync(process.argv[2], "utf8") + "</body></html>";
const bridge = process.argv[3] === "app";
const errors = [], calls = { schedule: null, haptic: 0, share: null, widget: null };
let pending = JSON.stringify([{ type: "trained", d: new Date().toISOString().slice(0, 10) }]);
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: "https://example.test/app",
  userAgent: bridge ? "Mozilla/5.0 Plan2028App" : "Mozilla/5.0",
  beforeParse(w) {
    w.matchMedia = () => ({ matches: false });
    w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: () => () => {} });
    w.addEventListener("error", e => errors.push(e.message));
    w.scrollTo = () => {};
    w.localStorage.setItem("plan2028:app:v3", JSON.stringify({ onboarded: true, inputs: {} }));
    if (bridge) w.Plan2028 = {
      schedule: j => { calls.schedule = JSON.parse(j); }, haptic: () => calls.haptic++, share: t => { calls.share = t; },
      widget: j => { calls.widget = JSON.parse(j); }, takePending: () => { const p = pending; pending = "[]"; return p; },
      notifyState: () => "granted", requestNotify(){}, openNotifySettings(){}, copy(){}
    };
  }});
const w = dom.window, d = w.document, $ = id => d.getElementById(id);
const tick = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  try {
    await tick(400);
    const st = () => JSON.parse(w.localStorage.getItem("plan2028:app:v3"));
    console.log("[" + (bridge ? "APP" : "WEB") + "] pending applied:", (st().workouts || []).length, "| notif disabled:", $("nPay").disabled, "|", $("notifNote").textContent.slice(0, 50));
    // new shift with times (future)
    d.querySelector('[data-sheet="vagt"]').click();
    const tm = new Date(Date.now() + 2 * 864e5); const fut = tm.toISOString().slice(0, 10);
    $("sv-date").value = fut; $("sv-from").value = "16:00"; $("sv-from").dispatchEvent(new w.Event("input"));
    $("sv-to").value = "22:30"; $("sv-to").dispatchEvent(new w.Event("input"));
    console.log("hours from times:", $("sv-hours").value);
    $("sv-save").click(); await tick(500);
    d.querySelector('[data-go="vagter"]').click(); await tick(50);
    console.log("upcoming shown:", !$("upSect").hidden, "| rows:", $("upList").children.length, "| sub:", $("upList").textContent.replace(/\s+/g, " ").slice(0, 70));
    console.log("insight next shift:", [...d.querySelectorAll(".in b")].map(b => b.textContent).filter(t => t.startsWith("Næste")).join());
    // edit it
    $("upList").querySelector(".cell").click(); await tick(50);
    console.log("edit title:", $("sv-h").textContent, "| del visible:", !$("sv-del").hidden, "| prefilled from:", $("sv-from").value);
    $("sv-hours").value = "5"; $("sv-hours").dispatchEvent(new w.Event("input"));
    console.log("to recomputed:", $("sv-to").value);
    $("sv-save").click(); await tick(500);
    console.log("after edit h:", st().shifts[0].h, st().shifts[0].to, "| count:", st().shifts.length);
    // delete + undo
    $("upList").querySelector("[data-del-shift]").click(); await tick(500);
    console.log("deleted:", st().shifts.length, "| snack on:", $("snack").classList.contains("on"), $("snackTxt").textContent);
    $("snackBtn").click(); await tick(50);
    console.log("undo restored:", st().shifts.length);
    // day chips
    d.querySelector('[data-go="traening"]').click(); await tick(50);
    d.querySelector('[data-pday="1"]').click();
    console.log("plan days:", st().prefs.days.join(","), "| plan markers:", d.querySelectorAll("#tracker .day.plan").length);
    // prefs toggle week + time
    $("nWeek").checked = true; $("nWeek").dispatchEvent(new w.Event("change"));
    $("nTime").value = "18:15"; $("nTime").dispatchEvent(new w.Event("change"));
    await tick(1000);
    if (bridge) console.log("schedule:", calls.schedule.length, "items | kinds:", [...new Set(calls.schedule.map(x => x.kind))].join(","), "| first:", calls.schedule[0].title, "-", new Date(calls.schedule[0].at).toString().slice(0, 21));
    if (bridge) console.log("widget payload:", JSON.stringify({ today: calls.widget.today, todayTrained: calls.widget.todayTrained, week: calls.widget.week, eta: calls.widget.eta, next: calls.widget.next, nextDate: calls.widget.nextDate }));
    // share
    d.querySelector('[data-go="hjem"]').click(); await tick(50);
    $("shareBtn").click(); await tick(100);
    console.log("share:", bridge ? (calls.share || "").slice(0, 80) : $("toast").textContent);
    // deposit edit
    d.querySelector('[data-sheet="spar"]').click(); $("ss-amt").value = "2500"; $("ss-save").click(); await tick(500);
    d.querySelector('[data-go="penge"]').click(); await tick(50);
    $("depList").querySelector(".cell").click(); await tick(50);
    console.log("dep edit title:", $("ss-h").textContent, "| amt:", $("ss-amt").value);
    $("ss-a").click(); $("ss-amt").value = "1000"; $("ss-save").click(); await tick(500);
    console.log("dep after edit:", JSON.stringify(st().deposits.map(x => [x.k, x.amt])));
    console.log("back:", w.appBack(), "| haptics via bridge:", calls.haptic);
  } catch (e) { errors.push("TEST: " + e.stack); }
  console.log("errors:", errors.length ? errors : "none"); process.exit(0);
})();
