const { JSDOM } = require("jsdom");
const fs = require("fs");
const html = "<!doctype html><html><head></head><body>" + fs.readFileSync(process.argv[2], "utf8") + "</body></html>";
const errors = [];
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: "https://example.test/app#vagt",
  beforeParse(w) {
    w.matchMedia = () => ({ matches: false });
    w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: () => () => {} });
    w.addEventListener("error", e => errors.push(e.message));
    w.scrollTo = () => {};
  }});
const w = dom.window, d = w.document, $ = id => d.getElementById(id);
setTimeout(() => {
  try {
    console.log("deep link opened vagt sheet:", !$("sheet-vagt").hidden, "| hash now:", JSON.stringify(w.location.hash));
    d.querySelector('#sheet-vagt [data-close]').click();
    setTimeout(() => {
      console.log("welcome shown:", !$("sheet-welcome").hidden, "| prefilled wage:", $("ob-wage").value, "payday:", $("ob-payday").value);
      $("ob-payday").value = "1"; $("ob-go").click();
      const st = JSON.parse(w.localStorage.getItem("plan2028:app:v3"));
      console.log("onboarded:", st.onboarded, "| payday saved:", st.inputs.payday, "| payBox:", $("payBox").textContent);
      // swipe-free delete path + repeat-week
      d.querySelector('[data-sheet="vagt"]').click(); $("sv-hours").value = "6"; $("sv-save").click();
      d.querySelector('[data-go="vagter"]').click();
      const del = d.querySelector("[data-del-shift]"); del.click();
      setTimeout(() => {
        console.log("shift deleted:", JSON.parse(w.localStorage.getItem("plan2028:app:v3")).shifts.length === 0);
        console.log("errors:", errors.length ? errors : "none"); process.exit(0);
      }, 600);
    }, 1200);
  } catch (e) { console.log("TEST ERR", e.stack); process.exit(1); }
}, 400);
