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
    w.Plan2028 = { vibrate(p){ w.__vib = (w.__vib||0)+1; }, keepAwake(on){ w.__awake = on; },   saveFile(n,m,c){ w.__saved = [n,m,c.length,c]; },  schedule(j){ sched = JSON.parse(j); }, haptic(){}, share(){}, widget(){}, takePending: () => "[]", notifyState: () => "granted", requestNotify(){}, copy(t){ w.__copied = t; }, healthState: () => "unsupported" };
  }});
const st = () => JSON.parse(w.localStorage.getItem("plan2028:app:v3"));
const w = dom.window, d = w.document, $ = id => d.getElementById(id), tick = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  try {
    await tick(500);
    console.log("dayplan train item:", [...$("dpList").querySelectorAll(".cell")][0].querySelector("b").textContent);
    d.querySelector('.tb[data-go="traening"]').click(); await tick(80);
    console.log("run card:", $("rnWeek").textContent, "|", $("rnBtn").textContent, "|", $("rnTxt").textContent.slice(0, 140), "| dots:", $("rnDots").children.length);
    console.log("pas A has intervals:", [...$("wList").querySelectorAll("b")].map(b => b.textContent).pop());
    // drinks
    console.log("chips:", [...$("pfChips").querySelectorAll("button")].slice(0, 2).map(b => b.textContent).join(" / "));
    d.querySelector('#foodCard [data-sheet="drinks"]').click(); await tick(60);
    $("dr-pn").value = "Arla Protein drik"; $("dr-pp").value = "21"; $("dr-pk").value = "270"; $("dr-pr").value = "18";
    $("dr-kn").value = "Proteinkakao"; $("dr-kp").value = "25"; $("dr-kk").value = "220"; $("dr-kr").value = "15"; $("dr-save").click(); await tick(450);
    console.log("chips after:", [...$("pfChips").querySelectorAll("button")].slice(0, 2).map(b => b.textContent).join(" / "));
    [...$("pfChips").querySelectorAll("button")][1].click(); await tick(40); console.log("logged kakao:", JSON.stringify(st().food));
    d.querySelector('#foodCard [data-sheet="recipes"]').click(); await tick(60); d.querySelector('[data-rf="nem"]').click(); await tick(30);
    console.log("nocook has drinks:", [...$("rc-list").querySelectorAll("b")].map(b => b.textContent).filter(t => /Arla|kakao/i.test(t)).join(", "));
    d.querySelector("#sheet-recipes [data-close]").click(); await tick(450);
    // run with fake clock
    let now = Date.now(); w.Date.now = () => now;
    $("rnBtn").click(); await tick(80);
    console.log("run sheet:", $("rn-plan").textContent.slice(0, 120), "| segs:", $("rn-segs").children.length, "| phase:", $("rn-phase").textContent, $("rn-clock").textContent);
    $("rn-go").click(); console.log("awake:", w.__awake);
    now += 301 * 1000; await tick(700); console.log("after warmup:", $("rn-phase").textContent, $("rn-clock").textContent, "| vib:", w.__vib, "| next:", $("rn-next").textContent);
    now += 61 * 1000; await tick(700); console.log("after 1 min:", $("rn-phase").textContent, "| vib:", w.__vib);
    $("rn-go").click(); now += 500 * 1000; await tick(700); console.log("paused stays:", $("rn-phase").textContent, $("rn-clock").textContent);
    $("rn-go").click(); now += 2000 * 1000; await tick(800);
    console.log("finished:", JSON.stringify(st().cardio.map(x => [x.min, x.k])), "| run n:", st().run.n, "| awake:", w.__awake, "| card:", $("rnWeek").textContent, $("rnBtn").textContent);
    $("rnLog").click(); await tick(60); console.log("other logged:", st().cardio.length, $("rnWeek").textContent);
    d.querySelector('.tb[data-go="hjem"]').click(); await tick(80);
    console.log("dayplan:", [...$("dpList").querySelectorAll(".cell")][0].textContent.slice(0, 60));
  } catch (e) { errors.push("TEST: " + e.stack); }
  console.log("errors:", errors.length ? errors : "none"); process.exit(0);
})();
