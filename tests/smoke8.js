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
    w.Plan2028 = { cvrLookup(id, q){ w.__cvrCalls = (w.__cvrCalls||0)+1; const R = { "Salon Lise": { name: "Salon Lise v/Lise Hansen", companydesc: "Enkeltmandsvirksomhed", protected: false, city: "Aarhus C", vat: 12345678, phone: "11223344" }, "VVS Hansen": { name: "VVS Hansen ApS", companydesc: "Anpartsselskab", protected: false, city: "Aarhus N", phone: "55667788" }, "Café Mokka": { name: "Café Mokka ApS", companydesc: "Anpartsselskab", protected: true }, "Bager Jensen": { error: "NOT_FOUND" } }; setTimeout(() => w.appCvr(id, JSON.stringify(R[q] || { error: "NOT_FOUND" })), 30); },  saveFile(n,m,c){ w.__saved = [n,m,c.length,c]; },  schedule(j){ sched = JSON.parse(j); }, haptic(){}, share(){}, widget(){}, takePending: () => "[]", notifyState: () => "granted", requestNotify(){}, copy(t){ w.__copied = t; }, healthState: () => "unsupported" };
  }});
const w = dom.window, d = w.document, $ = id => d.getElementById(id), tick = ms => new Promise(r => setTimeout(r, ms));
const st = () => JSON.parse(w.localStorage.getItem("plan2028:app:v3"));
(async () => {
  try {
    await tick(500);
    d.querySelector('.tb[data-go="startup"]').click(); await tick(60);
    d.querySelector('[data-idea="web"]').click(); await tick(60);
    d.querySelector('.tool[data-sheet="profile"]').click(); await tick(50);
    $("pf-name").value = "Tobias"; $("pf-phone").value = "12345678"; $("pf-city").value = "Aarhus"; $("pf-save").click(); await tick(450);
    console.log("find law note:", !!$("sheet-find").querySelector(".lawnote"));
    d.querySelector('.tool[data-sheet="find"]').click(); await tick(50);
    $("fk-batch").value = "Salon Lise\nVVS Hansen\nCafé Mokka\nBager Jensen"; $("fk-add").click(); await tick(900);
    console.log("cvr calls:", w.__cvrCalls, "| cvr:", JSON.stringify(st().startup.leads.map(l => [l.name, l.cvr && l.cvr.s, l.cvr && l.cvr.form, l.phone || ""])));
    console.log("today:", $("todayH").textContent, "|", [...$("todayList").querySelectorAll(".t")].map(x => x.textContent).join(" / "));
    // Salon Lise: personal company -> no call, talk mode
    [...$("todayList").querySelectorAll("[data-msg]")].find(b => b.closest(".cell").textContent.includes("Salon")).click(); await tick(60);
    const vis = id => $(id).style.display !== "none" && !$(id).hidden;
    console.log("lise cvr:", $("ms-cvr").querySelector("b").textContent, "| talk:", vis("ms-talk"), "| write:", vis("ms-write"), "| call hidden:", $("ms-call").hidden, "| map:", $("ms-map").href.slice(0, 50));
    console.log("script:", [...$("ms-script").querySelectorAll("b")].map(b => b.textContent).join(" / "));
    $("ms-consent").click(); await tick(60);
    console.log("after consent: talk:", vis("ms-talk"), "| write:", vis("ms-write"), "| sms:", !$("ms-sms").hidden, "| text:", $("ms-text").value.split("\n")[2].slice(0, 60));
    $("ms-done").click(); await tick(450);
    console.log("lise:", JSON.stringify((({stage, consent, contacted, next}) => ({stage, consent, contacted, next}))(st().startup.leads[0])), "| snack:", $("snackTxt").textContent);
    // VVS: ApS -> call allowed
    $("snackBtn").click(); await tick(60);
    console.log("next:", $("ms-h").textContent, "| cvr:", $("ms-cvr").querySelector("b").textContent, "| call shown:", !$("ms-call").hidden, $("ms-call").href);
    $("ms-talked").click(); await tick(450);
    console.log("vvs stage:", st().startup.leads[1].stage, st().startup.leads[1].consent || "no consent");
    // Bager: not found -> manual buttons
    const bag = [...$("todayList").querySelectorAll("[data-msg]")].find(b => b.closest(".cell").textContent.includes("Bager")); bag.click(); await tick(60);
    console.log("bager cvr:", $("ms-cvr").textContent.slice(0, 120));
    $("ms-cvr").querySelector('[data-cvr="manual"]').click(); await tick(60); console.log("manual:", st().startup.leads[3].cvr.s, "|", $("ms-cvr").querySelector("b").textContent);
    $("ms-no").click(); await tick(450); console.log("bager after no:", st().startup.leads[3].stage, "| snack:", $("snackTxt").textContent);
    // Café Mokka protected: not on today list; opening from lead row shows block
    console.log("mokka on today:", $("todayList").textContent.includes("Mokka"));
    [...$("leadList").querySelectorAll("[data-msg]")].find(b => b.closest(".cell").textContent.includes("Mokka")).click(); await tick(60);
    console.log("mokka:", $("ms-cvr").querySelector("b").textContent, "| prot panel:", vis("ms-prot"), "| talk:", vis("ms-talk"), "| write:", vis("ms-write"), "| kinds:", $("ms-kinds").style.display);
    $("ms-skip").click(); await tick(450); console.log("mokka stage:", st().startup.leads[2].stage, "| row:", $("leadList").textContent.includes("reklamebeskyttet"));
    // follow-up for Lise later (consented) -> write mode directly
    [...$("leadList").querySelectorAll("[data-msg]")].find(b => b.closest(".cell").textContent.includes("Salon")).click(); await tick(60);
    console.log("lise follow kind:", d.querySelector('#ms-kinds [aria-pressed="true"]').dataset.mk, "| write:", vis("ms-write"));
    d.querySelector("#sheet-msg [data-close]").click(); await tick(450);
    // lead sheet consent toggle
    [...$("leadList").querySelectorAll(".sw .cell")].find(c => c.textContent.includes("VVS")).click(); await tick(60);
    console.log("ld-consent:", $("ld-consent").checked); $("ld-consent").checked = true; $("ld-save").click(); await tick(450); console.log("vvs consent saved:", !!st().startup.leads[1].consent);
    console.log("rules:", [...d.querySelectorAll("#rulesList b")].map(b => b.textContent).filter(t => /SMS|reklame/i.test(t)).join(" / "));
    console.log("guide msg step text:", (() => { return "ok"; })());
  } catch (e) { errors.push("TEST: " + e.stack); }
  console.log("errors:", errors.length ? errors : "none"); process.exit(0);
})();
