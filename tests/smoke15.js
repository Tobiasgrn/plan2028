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
    w.localStorage.setItem("plan2028:app:v3", JSON.stringify({ onboarded: true, inputs: {}, shifts: [], wardrobe: [["tee","white"],["tee","black"],["shirt","lblue"],["knit","navy"],["turtleneck","black"],["hoodie","grey"],["overshirt","olive"],["leather","black"],["blazer","navy"],["puffer","black"],["jeans","ddenim"],["chinos","sand"],["cargo","olive"],["trousers","grey"],["sneakers","white"],["chelsea","brown"],["loafers","brown"],["watch","silver"],["scarf","grey"],["beanie","charcoal"],["chain","silver"]].map((x, i) => ({ id: "w" + i, t: x[0], c: x[1] })), outfits: { saved: [], worn: [] } }));
    w.__sampleCalls = 0;
    const sampleFn = async () => ({ text: "" });
    sampleFn.limits = async () => ({ images: { maxCount: 4 } });
    sampleFn.json = async (input, opts) => { w.__sampleCalls++; w.__sampleImgs = opts && opts.images ? opts.images.length : 0; w.__prompt = input; return w.__aiReply; };
    w.claude = { use: async n => n === "sample" ? sampleFn : null };
    w.Plan2028 = { vibrate(p){ w.__vib = (w.__vib||0)+1; }, keepAwake(on){ w.__awake = on; },   saveFile(n,m,c){ w.__saved = [n,m,c.length,c]; },  schedule(j){ sched = JSON.parse(j); }, haptic(){}, share(){}, widget(){}, takePending: () => "[]", notifyState: () => "granted", requestNotify(){}, copy(t){ w.__copied = t; }, healthState: () => "unsupported" };
  }});
const st = () => JSON.parse(w.localStorage.getItem("plan2028:app:v3"));
const w = dom.window, d = w.document, $ = id => d.getElementById(id), tick = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  try {
    await tick(500);
    const P = w.__plan2028photo, IMG = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==";
    d.querySelector('.tb[data-go="dig"]').click(); await tick(60); $("dgO").click(); await tick(200);
    console.log("photo card:", !!d.querySelector('#digOutfit [data-photo="cam"]'), !!d.querySelector('#digOutfit [data-photo="lib"]'), "| inputs:", ["phCam", "phLib", "phOne"].map(k => $(k) && $(k).type + ":" + ($(k).getAttribute("capture") || "") + ":" + $(k).multiple).join(" "));
    let clicked = ""; ["phCam", "phLib", "phOne"].forEach(k => { $(k).click = () => { clicked += k + " "; }; });
    d.querySelector('[data-photo="cam"]').click(); d.querySelector('[data-photo="lib"]').click(); console.log("pick opens:", clicked.trim());
    console.log("aiClean:", JSON.stringify(P.aiClean({ t: "shirt", c: "lblue", p: "stripe", n: "Oxford <b>" })), JSON.stringify(P.aiClean({ t: "rocket", c: "navy" })), JSON.stringify(P.aiClean({ t: "sneakers", c: "white", p: "check", n: "Sneakers" })));
    // queue of two local guesses, no blob (ingen Claude)
    const e1 = { thumb: IMG, g: { t: "tee", c: "navy", p: "", n: "", types: ["tee", "polo", "knit"], colors: ["navy", "ddenim", "black"], hex: "#223355", src: "app" } };
    const e2 = { thumb: IMG, g: { t: "jeans", c: "ddenim", p: "", n: "", types: ["jeans", "chinos"], colors: ["ddenim", "navy"], hex: "#2d3d5a", src: "app" } };
    const e3 = { thumb: IMG, g: { t: "sneakers", c: "white", p: "", n: "", types: ["sneakers", "boots"], colors: ["white", "cream"], hex: "#eeeeee", src: "app" } };
    P.queue([e1, e2, e3]); await tick(450);
    console.log("sheet:", $("gm-h").textContent, "| img shown:", !$("gm-ph").hidden, "| guess chips:", $("gm-gtypes").children.length, $("gm-gcolors").children.length, "| info:", $("gm-ai").textContent, "| save:", $("gm-save").textContent, "| skip shown:", !$("gm-skip").hidden);
    console.log("prefill:", $("gm-prev").textContent);
    d.querySelector('#gm-gtypes [data-gt="polo"]').click(); await tick(20); console.log("pick polo:", $("gm-prev").textContent);
    $("gm-save").click(); await tick(100);
    console.log("after 1:", $("gm-prev").textContent, "| info:", $("gm-ai").textContent, "| open:", !$("sheet-garment").hidden);
    $("gm-skip").click(); await tick(100); console.log("skipped → ", $("gm-prev").textContent, "| save:", $("gm-save").textContent);
    $("gm-save").click(); await tick(500);
    const wd = st().wardrobe, ph = JSON.parse(w.localStorage.getItem("plan2028:img") || "{}");
    console.log("wardrobe:", wd.map(x => x.t + "/" + x.c).join(", "), "| photos:", Object.keys(ph).length, "| in state:", JSON.stringify(st()).includes("base64"), "| sheet closed:", $("sheet-garment").hidden);
    console.log("row photo:", $("wdList").querySelectorAll(".swdot.hasph").length);
    // need a bottom with photo for collage
    P.queue([{ thumb: IMG, g: { t: "chinos", c: "sand", p: "", n: "", types: ["chinos"], colors: ["sand"], hex: "#d2bc98", src: "app" } }]); await tick(450); $("gm-save").click(); await tick(500);
    [...$("wdList").querySelectorAll(".cell")].find(c => c.textContent.includes("Polo")).querySelector("[data-lockg]").click(); await tick(150);
    const cc = [...$("ofCards").querySelectorAll(".ofcard")], want = cc.filter(c => /Chinos i beige|Sneakers i hvid/.test(c.querySelector(".ofitems").textContent)).length;
    console.log("collage cards:", $("ofCards").querySelectorAll(".ofph").length, "expected:", want, "|", "cards", cc.length, "| chip photos:", $("ofCards").querySelectorAll("i.hasph").length);
    $("ofUnlock").click(); await tick(60);
    // edit existing: photo shown, remove photo
    [...$("wdList").querySelectorAll(".sw .cell")].find(c => c.textContent.includes("Polo")).click(); await tick(450);
    console.log("edit:", $("gm-h").textContent, "| img:", !$("gm-ph").hidden, "| phx:", !$("gm-phx").hidden, "| guess hidden:", $("gm-guess").hidden);
    $("gm-phx").click(); await tick(20); console.log("removed in sheet:", $("gm-ph").hidden, "| add btn:", !$("gm-addph").hidden);
    $("gm-save").click(); await tick(500); console.log("photos after remove:", Object.keys(JSON.parse(w.localStorage.getItem("plan2028:img"))).length);
    // Claude: mirror selfie with 3 items
    w.__aiReply = { items: [{ t: "overshirt", c: "olive", p: "", n: "Overshirt i twill" }, { t: "cargo", c: "black", p: "" }, { t: "retro", c: "white", p: "stripe" }, { t: "spaceship", c: "x" }] };
    const blob = new w.Blob(["x"], { type: "image/jpeg" });
    P.queue([{ thumb: IMG, blob, g: { t: "tee", c: "olive", p: "", n: "", types: ["tee"], colors: ["olive"], hex: "#5b6336", src: "app" } }]); await tick(500);
    console.log("ai calls:", w.__sampleCalls, "imgs:", w.__sampleImgs, "| prompt has keys:", /overshirt \(Overshirt\)/.test(w.__prompt) && /ddenim #2D3D5A/.test(w.__prompt));
    console.log("ai sheet:", $("gm-prev").textContent, "| name:", $("gm-name").value, "| info:", $("gm-ai").textContent, "| save:", $("gm-save").textContent);
    $("gm-save").click(); await tick(100); console.log("ai 2:", $("gm-prev").textContent, "| info:", $("gm-ai").textContent);
    $("gm-save").click(); await tick(100); console.log("ai 3:", $("gm-prev").textContent, "(shoes, pattern dropped) | save:", $("gm-save").textContent);
    $("gm-save").click(); await tick(500);
    console.log("after ai:", st().wardrobe.slice(-3).map(x => x.t + "/" + x.c + (x.p ? "/" + x.p : "") + (x.n ? " '" + x.n + "'" : "")).join(", "), "| calls:", w.__sampleCalls, "| photos:", Object.keys(JSON.parse(w.localStorage.getItem("plan2028:img"))).length);
    // user override wins over late AI answer
    let release; w.__aiReply = new Promise(r => { release = r; });
    P.queue([{ thumb: IMG, blob, g: { t: "tee", c: "white", p: "", n: "", types: ["tee", "shirt"], colors: ["white"], hex: "#fff", src: "app" } }]); await tick(450);
    console.log("busy:", $("gm-ai").textContent);
    d.querySelector('#gm-gtypes [data-gt="shirt"]').click(); release({ items: [{ t: "knit", c: "grey", p: "" }] }); await tick(60);
    console.log("override kept:", $("gm-prev").textContent, "| info:", $("gm-ai").textContent);
    d.querySelector("#sheet-garment [data-close]").click(); await tick(450);
    console.log("cancel: no new item:", st().wardrobe.length, "| queue cleared, normal add:", (d.querySelector('#digOutfit [data-sheet="garment"]').click(), await tick(450), $("gm-h").textContent + " / img " + !$("gm-ph").hidden + " / guess " + !$("gm-guess").hidden));
    d.querySelector("#sheet-garment [data-close]").click(); await tick(450);
    // AI declined
    w.claude = null;
    // self test row
    d.querySelector('[data-go="tjek"]') ? d.querySelector('[data-go="tjek"]').click() : null; await tick(100);
    console.log("self-test row:", !!$("ckList") && $("ckList").textContent.includes("Kamera og billeder"));
    // garbage in photo store is ignored on load
    console.log("okImg guard:", typeof P.photos(), Object.values(P.photos()).every(v => v.startsWith("data:image/")));
  } catch (e) { errors.push("TEST: " + e.stack); }
  console.log("errors:", errors.length ? errors : "none"); process.exit(0);
})();
