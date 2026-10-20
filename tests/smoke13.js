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
    w.localStorage.setItem("plan2028:app:v3", JSON.stringify({ onboarded: true, inputs: {}, shifts: [], wardrobe: [{ id: "w1", t: "tee", c: "white" }], outfits: { saved: [], worn: [] } }));
    w.Plan2028 = { vibrate(p){ w.__vib = (w.__vib||0)+1; }, keepAwake(on){ w.__awake = on; },   saveFile(n,m,c){ w.__saved = [n,m,c.length,c]; },  schedule(j){ sched = JSON.parse(j); }, haptic(){}, share(){}, widget(){}, takePending: () => "[]", notifyState: () => "granted", requestNotify(){}, copy(t){ w.__copied = t; }, healthState: () => "unsupported" };
  }});
const st = () => JSON.parse(w.localStorage.getItem("plan2028:app:v3"));
const w = dom.window, d = w.document, $ = id => d.getElementById(id), tick = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  try {
    await tick(500);
    console.log("tabs:", [...d.querySelectorAll(".tb")].map(b => b.textContent.trim()).join(","), "| wardrobe kept:", st() ? "" : "(not saved yet)");
    console.log("insight:", [...d.querySelectorAll(".in b")].map(b => b.textContent).filter(t => /lektion/i.test(t)).join(""));
    d.querySelector('.tb[data-go="dig"]').click(); await tick(80);
    console.log("dig visible:", !$("s-dig").hidden, "| over:", $("digOver").textContent, "| today:", $("lnToday").querySelector("h3").textContent, "| tracks:", $("lnTracks").children.length, "| kpis:", $("lnXP").textContent, $("lnStreak").textContent, $("lnCount").textContent);
    $("lnToday").querySelector("[data-lesson]").click(); await tick(80);
    console.log("lesson:", $("ls-h").textContent, "|", $("ls-title").textContent, "| points:", $("ls-points").children.length, "| action:", $("ls-action").textContent.slice(0, 50), "| opts:", $("ls-opts").children.length);
    $("ls-opts").querySelectorAll(".qopt")[1].click(); await tick(40);
    console.log("quiz:", $("ls-why").textContent.slice(0, 60), "| ok class:", $("ls-opts").querySelector(".qopt.ok") !== null);
    $("ls-done").click(); await tick(500);
    console.log("after done:", $("lnXP").textContent, $("lnStreak").textContent, $("lnCount").textContent, "| today:", $("lnToday").querySelector(".ey").textContent);
    $("lnTracks").querySelector('[data-track="stil"]').click(); await tick(80);
    console.log("track:", $("tk-h").textContent, "| lessons:", $("tk-list").children.length);
    $("tk-list").querySelector("[data-lesson]").click(); await tick(80); console.log("from track:", $("ls-title").textContent);
    $("ls-done").click(); await tick(500); console.log("count:", $("lnCount").textContent, "| learn state:", JSON.stringify(st().learn.done));
    // outfits
    $("dgO").click(); await tick(80);
    console.log("outfit view:", $("digOutfit").style.display, "| empty:", !!$("ofCards").querySelector(".ofempty"), "| occ:", $("ofOcc").children.length, "| wx pressed:", d.querySelector('#ofWx [aria-pressed="true"]').textContent);
    $("ofCards").querySelector('[data-sheet="capsule"]').click(); await tick(80);
    console.log("capsule rows:", $("cp-list").children.length, "| disabled own:", $("cp-list").querySelectorAll("[disabled]").length);
    [1, 2, 4, 6, 11, 12, 13, 14, 16, 17, 18, 19].forEach(i => $("cp-list").querySelector('[data-cap="' + i + '"]').click()); await tick(30);
    console.log("selected:", $("cp-count").textContent); $("cp-save").click(); await tick(500);
    console.log("wardrobe:", st().wardrobe.length, "| cards:", $("ofCards").querySelectorAll(".ofcard").length);
    [...$("ofCards").querySelectorAll(".ofcard")].forEach((c, i) => console.log("  card", i, c.querySelector(".ofscore").textContent, "|", [...c.querySelectorAll(".ofitems > *")].map(x => x.textContent).join(" + "), "|", [...c.querySelectorAll(".tips li")].map(x => x.textContent).join(" / ").slice(0, 200), "| svg paths:", c.querySelectorAll("svg path").length));
    for (const occ of ["date", "foraeldre", "job"]) { d.querySelector('[data-occ="' + occ + '"]').click(); await tick(40); const c = $("ofCards").querySelector(".ofcard"); console.log("occ", occ, ":", c.querySelector(".ofscore").textContent, "|", [...c.querySelectorAll(".ofitems > *")].map(x => x.textContent).join(" + ")); }
    d.querySelector('[data-wx="varmt"]').click(); d.querySelector('[data-occ="hverdag"]').click(); await tick(40);
    console.log("varmt:", [...$("ofCards").querySelector(".ofcard").querySelectorAll(".ofitems > *")].map(x => x.textContent).join(" + "));
    console.log("gaps:", [...$("ofGaps").querySelectorAll(".cell")].map(c => c.querySelector("b").textContent + " " + c.querySelector(".t span").textContent).join(" / "));
    $("ofCards").querySelector("[data-ofsave]").click(); await tick(60); $("ofCards").querySelector("[data-ofwear]").click(); await tick(60);
    console.log("saved:", st().outfits.saved.length, "| saved thumbs:", $("ofSaved").querySelectorAll(".ofmini").length, "| worn:", st().outfits.worn.length);
    $("ofMore").click(); await tick(40); console.log("more:", $("ofCards").querySelectorAll(".ofcard").length);
    $("ofGaps").querySelector("[data-gadd]").click(); await tick(60); console.log("after gap add:", st().wardrobe.length);
    // garment sheet
    d.querySelector('#digOutfit [data-sheet="garment"]').click(); await tick(60);
    d.querySelector('[data-gt="chinos"]').click(); d.querySelector('[data-gc="navy"]').click(); console.log("garment prev:", $("gm-prev").textContent); $("gm-name").value = "Navy chinos"; $("gm-save").click(); await tick(450);
    console.log("added:", st().wardrobe.filter(w => w.n === "Navy chinos").length);
    $("wdList").querySelector(".sw .cell").click(); await tick(60); console.log("edit:", $("gm-h").textContent, "| del shown:", !$("gm-del").hidden);
    d.querySelector("#sheet-garment [data-close]").click(); await tick(450);
    $("wdList").querySelector("[data-del]").click(); await tick(450); console.log("deleted:", $("snackTxt").textContent);
  } catch (e) { errors.push("TEST: " + e.stack); }
  console.log("errors:", errors.length ? errors : "none"); process.exit(0);
})();
