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
    w.localStorage.setItem("plan2028:app:v3", JSON.stringify({ onboarded: true, inputs: {}, shifts: [{ id: "s1", d: wd(1), h: 4, from: "06:00", to: "10:00" }, { id: "s2", d: wd(3), h: 8, from: "14:00", to: "22:00" }, { id: "s3", d: wd(5), h: 5.5, from: "16:00", to: "21:30" }] }));
    w.Plan2028 = {  saveFile(n,m,c){ w.__saved = [n,m,c.length,c]; },  schedule(j){ sched = JSON.parse(j); }, haptic(){}, share(){}, widget(){}, takePending: () => "[]", notifyState: () => "granted", requestNotify(){}, copy(t){ w.__copied = t; }, healthState: () => "unsupported" };
  }});
const st = () => JSON.parse(w.localStorage.getItem("plan2028:app:v3"));
const w = dom.window, d = w.document, $ = id => d.getElementById(id), tick = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  try {
    await tick(500);
    d.querySelector('.tb[data-go="traening"]').click(); await tick(80);
    console.log("food card:", $("fdTag").textContent, "| day:", $("fdDay").textContent, "| month:", $("fdMonth").textContent, "| kcal:", $("fdKcal").textContent);
    console.log("today meals:", [...$("fdToday").querySelectorAll("b")].map(b => b.textContent).join(" / "));
    d.querySelector('#foodCard [data-sheet="mplan"]').click(); await tick(80);
    console.log("plan kpis:", $("mp-kcal").textContent, $("mp-prot").textContent, $("mp-kr").textContent);
    console.log("prep:", [...$("mp-prep").querySelectorAll("b")].map(b => b.textContent).join(" | "));
    const hs = [...$("mp-days").querySelectorAll(".dayh")]; const gs = [...$("mp-days").querySelectorAll(".group")];
    hs.forEach((h, i) => console.log("  ", h.textContent, "=>", [...gs[i].querySelectorAll(".t span")].map(x => x.textContent.split(" · ")[0] + (x.textContent.includes("vagten") ? "*" : "")).join(", "), "|", [...gs[i].querySelectorAll("b")].map(b => b.textContent).join(", ").slice(0, 160)));
    $("mp-home").click(); await tick(60); console.log("home dinner kpis:", $("mp-kcal").textContent, $("mp-kr").textContent, "| day0:", [...$("mp-days").querySelectorAll(".group")[0].querySelectorAll("b")].map(b => b.textContent).join(", "));
    $("mp-home").click(); await tick(60);
    const before = $("mp-days").querySelector("b").textContent + $("mp-days").querySelectorAll(".group")[0].querySelectorAll("b")[2].textContent; $("mp-new").click(); await tick(60);
    console.log("new plan changes:", before !== $("mp-days").querySelector("b").textContent + $("mp-days").querySelectorAll(".group")[0].querySelectorAll("b")[2].textContent);
    // shop
    d.querySelector('#sheet-mplan [data-sheet="shop"]').click(); await tick(80);
    console.log("shop:", $("sh-total").textContent, $("sh-left").textContent, $("sh-used").textContent, "| items:", $("sh-list").querySelectorAll(".cell").length, "| cats:", [...$("sh-list").querySelectorAll(".dayh")].map(x => x.textContent).join(","));
    console.log("rows:", [...$("sh-list").querySelectorAll(".cell")].slice(0, 6).map(c => c.querySelector("b").textContent + " " + c.querySelector(".t span").textContent + " " + c.querySelector(".v").textContent).join(" || "));
    $("sh-list").querySelector("[data-got]").click(); await tick(30); console.log("after got:", $("sh-left").textContent, "| got cls:", $("sh-list").querySelector(".cell.got") !== null);
    $("sh-copy").click(); await tick(30); console.log("copied:", (w.__copied || "").split("\n").slice(0, 3).join(" / "), "| lines:", (w.__copied || "").split("\n").length);
    $("sh-log").click(); await tick(60); console.log("logged:", JSON.stringify(st().expenses.map(e => [e.c, e.amt, e.note])), "|", $("sh-log").textContent);
    // recipes
    d.querySelector('#sheet-shop [data-sheet="prices"]').click(); await tick(60);
    console.log("prices rows:", $("pc-list").children.length, "| disc field gone:", !$("pc-disc"));
    d.querySelector('[data-price="chicken"]').value = "50"; $("pc-save").click(); await tick(450);
    d.querySelector('#foodCard [data-sheet="recipes"]').click(); await tick(60);
    console.log("recipes:", $("rc-list").children.length, "| filters:", $("rc-filter").children.length, "| cheap:", [...$("rc-cheap").querySelectorAll(".cell")].slice(0, 5).map(c => c.textContent).join(" / "));
    d.querySelector('[data-rf="nem"]').click(); await tick(30); console.log("nem:", [...$("rc-list").querySelectorAll("b")].map(b => b.textContent).join(", "));
    d.querySelector('[data-rf="aften"]').click(); await tick(30);
    $("rc-list").querySelector('[data-rid="kyl"]').click(); await tick(80);
    console.log("recipe:", $("rp-h").textContent, $("rp-kcal").textContent, $("rp-prot").textContent, $("rp-kr").textContent, "|", $("rp-ing").textContent.slice(0, 90), "| steps:", $("rp-steps").children.length);
    $("rp-eat").click(); await tick(450);
    console.log("ate:", JSON.stringify(st().food), "| kcal card:", $("fdKcal").textContent, "| prot:", $("pfTxt").textContent);
    $("fdToday").querySelector("[data-eat]").click(); await tick(60); console.log("eat plan meal:", $("fdKcal").textContent, "| btn:", $("fdToday").querySelector("[data-eat]").textContent);
    $("fdToday").querySelector("[data-eat]").click(); await tick(60); console.log("double:", $("toast") ? "" : "", st().food.e.length);
    d.querySelector('#pfChips [data-pf="21"]').click(); await tick(40); console.log("chip kcal:", st().food.k);
  } catch (e) { errors.push("TEST: " + e.stack); }
  console.log("errors:", errors.length ? errors : "none"); process.exit(0);
})();
