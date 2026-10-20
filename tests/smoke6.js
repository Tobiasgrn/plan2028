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
    d.querySelector('.tb[data-go="startup"]').click(); await tick(60);
    const g = () => $("gStep").textContent + " | " + ($("gBody").querySelector("h3")||{}).textContent;
    console.log("guide:", $("gSprint").textContent, "|", g(), "| dots:", $("gDots").children.length, "| started:", st().startup.started);
    console.log("tools:", [...d.querySelectorAll(".tool")].map(b => b.textContent.trim()).join(","), "| icons ok:", [...d.querySelectorAll(".tool .ic")].every(i => i.innerHTML.includes("svg")));
    d.querySelector('[data-gact="ideas"]').click(); d.querySelector('[data-idea="web"]').click(); await tick(60);
    console.log("after idea:", g());
    // profile
    d.querySelector('.tool[data-sheet="profile"]').click(); await tick(50);
    $("pf-name").value = "Tobias"; $("pf-phone").value = "12345678"; $("pf-city").value = "Aarhus"; $("pf-cvr").value = "123"; $("pf-save").click(); await tick(50);
    console.log("bad cvr kept sheet:", !$("sheet-profile").hidden);
    $("pf-cvr").value = ""; $("pf-bank").value = "1234 5678901234"; $("pf-addr").value = "Testvej 1, 8000 Aarhus C"; $("pf-save").click(); await tick(500);
    console.log("profile:", JSON.stringify(st().startup.profile), "|", g());
    // demo done manually
    d.querySelector(`[data-gdone="demo"]`).click(); await tick(60); d.querySelector(`[data-gdone="own"]`).click(); await tick(60); console.log("after demo:", g());
    // price
    d.querySelector('[data-gact="price"]').click(); await tick(50);
    $("prR").value = "400"; $("prR").dispatchEvent(new w.Event("input")); $("prH").value = "12"; $("prH").dispatchEvent(new w.Event("input"));
    console.log("price:", $("prNorm").textContent, $("prIntro").textContent, $("prFee").textContent, "|", $("prNote").textContent.slice(0, 70));
    $("pr-use").click(); await tick(500); console.log("calc P:", st().startup.calc && st().startup.calc.P, "|", g());
    // find
    d.querySelector('[data-gact="find"]').click(); await tick(50);
    console.log("find city:", $("fk-city").value, "| links:", [...$("fk-links").querySelectorAll("a")].map(a => a.href).slice(0,2).join(" "), "| look:", $("fk-look").children.length);
    $("fk-batch").value = Array.from({length: 21}, (_, i) => "Firma " + (i + 1)).join("\n") + "\nFirma 1"; $("fk-add").click(); await tick(500);
    console.log("leads:", st().startup.leads.length, "|", g());
    // advance 10
    for (let i = 0; i < 10; i++) { $("leadList").querySelector("[data-adv]") && [...$("leadList").querySelectorAll("[data-adv]")].find(b => b.closest(".cell").textContent.includes("Ny")).click(); await tick(20); }
    console.log("contacted:", st().startup.leads.filter(l => l.contacted).length, "| out:", $("outTxt").textContent, "| next set:", st().startup.leads.filter(l=>l.next).length, "|", g());
    d.querySelector('[data-gdone="follow"]').click(); await tick(50);
    // meeting guide
    d.querySelector('[data-gact="meet"]').click(); await tick(50);
    console.log("meet steps:", $("mg-script").children.length, "| obj:", $("mg-obj").children.length, "|", $("mg-script").textContent.slice(0, 0));
    d.querySelector("#sheet-meet [data-close]").click(); await tick(450);
    // advance one lead to tilbud then vundet
    const adv = name => [...$("leadList").querySelectorAll(".sw")].find(r => r.textContent.includes(name)).querySelector("[data-adv]").click();
    adv("Firma 1 "); await tick(20); console.log("after meet stage:", g());
    adv("Firma 1 "); await tick(20); console.log("after offer:", g());
    adv("Firma 1 "); await tick(80); console.log("won snack:", $("snackTxt").textContent, "/", $("snackBtn").textContent, "|", g());
    // CVR step via profile
    d.querySelector('.tool[data-sheet="profile"]').click(); await tick(50); $("pf-cvr").value = "12 34 56 78"; $("pf-save").click(); await tick(450);
    console.log("cvr:", st().startup.profile.cvr, "|", g());
    // invoice from snack
    d.querySelector(`[data-gdone="deliver"]`).click(); await tick(60);
    $("snackBtn") && d.querySelector('[data-gact="inv"]').click(); await tick(60);
    $("iv-cust").value = "Firma 1"; $("iv-a1").value = "4000"; $("iv-d2").value = "Domæne"; $("iv-a2").value = "150"; $("iv-a1").dispatchEvent(new w.Event("input"));
    d.querySelector('[data-terms="14"]').click();
    console.log("preview:", $("iv-prev").textContent.replace(/\s+/g, " ").slice(0, 220), "| warn hidden:", $("iv-warn").hidden);
    $("iv-copy").click(); await tick(50); console.log("copied:", (w.__copied || "").split("\n").slice(0, 3).join(" / "));
    let printed = null; w.Plan2028.printHtml = (h, n) => { printed = [h.length, n]; };
    $("iv-pdf").click(); await tick(50); console.log("printHtml:", JSON.stringify(printed));
    console.log("invoices:", JSON.stringify(st().startup.invoices.map(v => [v.no, v.cust, v.status, v.due, v.lines.length])), "|", g());
    $("iv-paid").click(); await tick(500);
    console.log("after paid:", JSON.stringify(st().startup.tx.map(x => [x.k, x.amt, x.desc])), "| inv list:", $("invList").textContent.replace(/\s+/g, " ").slice(0, 80), "|", g());
    await tick(900);
    console.log("su notifs:", (sched || []).filter(x => /startup|Faktura/.test(x.title)).length, "| prefs nSu:", $("nSu").checked);
    // edit invoice row opens sheet
    $("invList").querySelector(".cell").click(); await tick(60); console.log("edit opens:", $("iv-h").textContent, "| paid btn hidden:", $("iv-paid").hidden);
    d.querySelector("#sheet-inv [data-close]").click(); await tick(450);
    // templates filled
    d.querySelector('.tool[data-tpl="0"]').click(); await tick(50); console.log("tpl filled:", /Tobias/.test($("tp-text").value), /12345678/.test($("tp-text").value));
    d.querySelector("#sheet-tpl [data-close]").click(); await tick(450);
    d.querySelector('.tb[data-go="hjem"]').click(); await tick(60);
    console.log("home insights:", [...d.querySelectorAll(".in b")].map(b => b.textContent).join(" / "));
    console.log("badges:", Object.keys(st().badges).join(","), "| guide pct:", $("planPct").textContent);
  } catch (e) { errors.push("TEST: " + e.stack); }
  console.log("errors:", errors.length ? errors : "none"); process.exit(0);
})();
