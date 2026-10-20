const { JSDOM } = require("jsdom");
const fs = require("fs");
const html = "<!doctype html><html><head></head><body>" + fs.readFileSync(process.argv[2], "utf8") + "</body></html>";
const errors = [];
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: "https://example.test/",
  beforeParse(w) {
    w.matchMedia = () => ({ matches: false, addEventListener(){}, removeEventListener(){} });
    w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: () => () => {} });
    w.addEventListener("error", e => errors.push(e.message));
    w.scrollTo = () => {};
  }});
const w = dom.window, d = w.document, $ = id => d.getElementById(id);
setTimeout(() => {
  try {
    console.log("days:", $("hDays").textContent, "| status:", $("hStatusTxt").textContent);
    console.log("insights:", $("insCount").textContent, "|", [...d.querySelectorAll(".in b")].map(b => b.textContent).join(" / "));
    console.log("move widget:", $("wMove").textContent, $("wMoveSub").textContent, "| next badge:", $("nbName").textContent, $("nbSub").textContent);
    console.log("money:", $("rMove").textContent, "| eta:", $("etaBox").textContent, "| payday:", $("payBox").textContent);
    // simulate actions
    $("qaTrain").click();
    d.querySelector('[data-sheet="vagt"]').click(); $("sv-hours").value = "7.5"; $("sv-save").click();
    d.querySelector('[data-sheet="spar"]').click(); $("ss-amt").value = "3000"; $("ss-save").click();
    $("simH").value = "3"; $("simH").dispatchEvent(new w.Event("input"));
    console.log("sim:", $("simEnd").textContent, $("simEndD").textContent, $("simEta").textContent, $("simEtaD").textContent);
    d.querySelector('[data-check="c1"]').click();
    d.querySelector('[data-go="vagter"]').click();
    console.log("vagter:", $("vHours").dataset.v, "h |", $("mchart").children.length, "bars | repeat disabled:", $("vRepeat").disabled);
    d.querySelector('[data-go="traening"]').click();
    console.log("training:", $("tScore").textContent, "| heat cells:", $("heat").children.length);
    d.querySelector('[data-go="tjek"]').click();
    console.log("badges:", $("bdCount").textContent, "| modal hidden:", $("modal").hidden);
    const st = JSON.parse(w.localStorage.getItem("plan2028:app:v3"));
    console.log("state:", st.shifts.length, "shifts,", st.deposits.length, "deps,", st.workouts.length, "workouts, badges:", Object.keys(st.badges).join(","));
    console.log("back:", w.appBack(), "tab after back ->", d.querySelector('.tb[aria-current="page"]').dataset.go);
  } catch (e) { errors.push("TEST: " + e.stack); }
  setTimeout(() => { console.log("errors:", errors.length ? errors : "none"); process.exit(0); }, 900);
}, 300);
