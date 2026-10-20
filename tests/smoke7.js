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
    w.Plan2028 = { saveFile(n,m,c){ w.__saved = [n,m,c.length,c]; },  schedule(j){ sched = JSON.parse(j); }, haptic(){}, share(){}, widget(){}, takePending: () => "[]", notifyState: () => "granted", requestNotify(){}, copy(t){ w.__copied = t; }, healthState: () => "unsupported" };
  }});
const w = dom.window, d = w.document, $ = id => d.getElementById(id), tick = ms => new Promise(r => setTimeout(r, ms));
const st = () => JSON.parse(w.localStorage.getItem("plan2028:app:v3"));
(async () => {
  try {
    await tick(500);
    d.querySelector('.tb[data-go="startup"]').click(); await tick(60);
    const g = () => ($("gBody").querySelector("h3")||{}).textContent;
    console.log("today empty:", $("todayH").textContent, "|", $("todayList").textContent.trim().slice(0, 60));
    console.log("sites empty:", $("siteList").textContent.trim());
    d.querySelector('[data-idea="web"]').click(); await tick(60);
    d.querySelector('.tool[data-sheet="profile"]').click(); await tick(50);
    $("pf-name").value = "Tobias"; $("pf-phone").value = "12345678"; $("pf-city").value = "Aarhus"; $("pf-save").click(); await tick(450);
    console.log("step:", g(), "| btn:", $("gBody").querySelector("[data-gact]").textContent);
    $("gBody").querySelector("[data-gact]").click(); await tick(80);
    console.log("site sheet open:", !$("sheet-site").hidden, "| name:", $("st-name").value, "| city:", $("st-city").value, "| tag:", $("st-tag").value, "| types:", $("st-types").children.length, "| themes:", $("st-themes").children.length);
    const pv = $("st-prev").srcdoc; console.log("preview len:", pv.length, "| has h1:", /<h1>Klip, farve og styling i Aarhus<\/h1>/.test(pv), "| preview disables links:", pv.includes("a{pointer-events:none}"));
    d.querySelector('[data-stype="handvaerker"]').click(); await tick(30);
    console.log("type switch:", $("st-name").value, "|", $("st-tag").value, "| theme pressed:", d.querySelector('#st-themes [aria-pressed="true"]').dataset.themeK);
    d.querySelector('[data-theme-k="sage"]').click(); $("st-addr").value = "Søndergade 12"; $("st-addr").dispatchEvent(new w.Event("input")); await tick(400);
    const pv2 = $("st-prev").srcdoc; console.log("map:", pv2.includes("output=embed"), "| sage:", pv2.includes("#3A7558"), "| find vej:", pv2.includes("Find vej"), "| credit:", /Hjemmeside af/.test(pv2));
    $("st-file").click(); await tick(100);
    console.log("saved file:", w.__saved && w.__saved.slice(0,3).join(" "), "| no pointer-events:", !w.__saved[3].includes("pointer-events:none"), "| ld+json:", w.__saved[3].includes("LocalBusiness"));
    // validate generated html parses and has key sections
    const { JSDOM: J2 } = require("jsdom"); const sd = new J2(w.__saved[3]).window.document;
    console.log("site doc:", sd.title, "| sections:", sd.querySelectorAll("section").length, "| price rows:", sd.querySelectorAll(".price li").length, "| tel links:", sd.querySelectorAll('a[href^="tel:"]').length, "| hours:", sd.querySelectorAll("dt").length);
    $("st-full").click(); await tick(30); console.log("fullscreen:", !$("siteFull").hidden); w.appBack(); console.log("back closes full:", $("siteFull").hidden, "| sheet still open:", !$("sheet-site").hidden);
    d.querySelector("#sheet-site [data-close]").click(); await tick(450);
    console.log("site list:", $("siteList").textContent.replace(/\s+/g," ").trim().slice(0, 80), "| step:", g());
    // own site
    $("gBody").querySelector("[data-gact]").click(); await tick(80);
    console.log("own:", $("st-name").value, "|", $("st-tag").value, "| sv:", $("st-sv").value.replace(/\n/g, " / "), "| credit:", $("st-credit").checked);
    $("st-url").value = "https://tobias.github.io/web"; $("st-save").click(); await tick(450);
    console.log("sites:", st().startup.sites.map(s => s.f.type).join(","), "| step:", g());
    d.querySelector('[data-gdone="price"]') && d.querySelector('[data-gdone="price"]').click(); await tick(60);
    // batch add with phones
    d.querySelector('.tool[data-sheet="find"]').click(); await tick(50);
    $("fk-batch").value = "Salon Lise, 12 34 56 78\nVVS Hansen; info@vvs.dk\nCafé Mokka 87654321\nBager Jensen"; $("fk-add").click(); await tick(450);
    console.log("leads:", JSON.stringify(st().startup.leads.map(l => [l.name, l.phone || "", l.email || ""])));
    console.log("today:", $("todayH").textContent, "|", [...$("todayList").querySelectorAll(".t span")].map(x => x.textContent).join(" / "));
    // make demo for Salon Lise from msg sheet
    $("todayList").querySelector("[data-msg]").click(); await tick(60);
    console.log("msg:", $("ms-h").textContent, "| kind:", d.querySelector('#ms-kinds [aria-pressed="true"]').dataset.mk, "| sms href:", $("ms-sms").href.slice(0, 40), "| mail hidden:", $("ms-mail").hidden, "| demo btn:", !$("ms-demo").hidden);
    console.log("text:", $("ms-text").value.split("\n").slice(0, 4).join(" / ").slice(0, 260));
    $("ms-demo").click(); await tick(80);
    console.log("demo for lead:", $("st-name").value, "| type:", d.querySelector('#st-types [aria-pressed="true"]').dataset.stype, "| phone:", $("st-phone").value);
    $("st-url").value = "https://tobias.github.io/salon-lise"; $("st-save").click(); await tick(450);
    console.log("lead site linked:", !!st().startup.leads[0].site);
    $("todayList").querySelector("[data-msg]").click(); await tick(60);
    console.log("first msg w/ demo:", /udkast til en ny forside til Salon Lise\. Se det her: https:\/\/tobias.github.io\/salon-lise/.test($("ms-text").value), "| own link:", $("ms-text").value.includes("tobias.github.io/web"), "| signed:", /Tobias\n12345678|Tobias/.test($("ms-text").value));
    $("ms-done").click(); await tick(450);
    const l0 = st().startup.leads[0]; console.log("after sent:", l0.stage, l0.contacted, l0.next, "| snack:", $("snackTxt").textContent);
    $("snackBtn").click(); await tick(60); console.log("next msg opened:", $("ms-h").textContent, "| sms hidden:", $("ms-sms").hidden, "| mail href:", $("ms-mail").href.slice(0, 50));
    d.querySelector('[data-mk="offer"]').click(); console.log("offer text:", $("ms-text").value.split("\n")[2]);
    $("ms-done").click(); await tick(450);
    console.log("vvs stage:", st().startup.leads[1].stage, "| today now:", $("todayH").textContent);
    // lead row buttons
    console.log("lead row msg btns:", $("leadList").querySelectorAll("[data-msg]").length, "| adv:", $("leadList").querySelectorAll("[data-adv]").length);
    // lead without contact info -> warn
    [...$("todayList").querySelectorAll("[data-msg]")].find(b => b.closest(".cell").textContent.includes("Bager")).click(); await tick(60);
    console.log("bager warn:", $("ms-warn").textContent.slice(0, 80), "| sendrow hidden:", $("ms-sendrow").hidden);
    d.querySelector("#sheet-msg [data-close]").click(); await tick(450);
    // delete site with undo
    $("siteList").querySelector("[data-del]").click(); await tick(450); console.log("site deleted:", st().startup.sites.length, $("snackTxt").textContent); $("snackBtn").click(); await tick(60); console.log("restored:", st().startup.sites.length);
    // edit site by row click
    $("siteList").querySelector(".cell").click(); await tick(60); console.log("edit site:", $("st-h").textContent, "| del visible:", !$("st-del").hidden);
    d.querySelector("#sheet-site [data-close]").click(); await tick(450);
    // online sheet
    d.querySelector('.tool[data-sheet="online"]').click(); await tick(50); console.log("online steps:", $("sheet-online").querySelectorAll(".st").length);
  } catch (e) { errors.push("TEST: " + e.stack); }
  console.log("errors:", errors.length ? errors : "none"); process.exit(0);
})();
