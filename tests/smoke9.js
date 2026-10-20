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
    const TOK = "ghp_" + "a".repeat(36), repos = {}, files = {}, pages = {}, calls = [];
    w.Plan2028.http = (id, method, url, headers, body) => {
      const h = JSON.parse(headers), path = url.replace("https://api.github.com", ""); calls.push(method + " " + path.split("?")[0]);
      let st = 404, out = {};
      if (url.startsWith("https://cvrapi.dk")) { st = 200; out = { name: "NOVO NORDISK A/S", protected: false }; }
      else if (h.Authorization !== "Bearer " + TOK) { st = 401; out = { message: "Bad credentials" }; }
      else if (path === "/user") { st = 200; out = { login: "Tobias123" }; }
      else if (method === "POST" && path === "/user/repos") { const b = JSON.parse(body); repos[b.name] = 1; st = 201; out = { default_branch: "main", private: b.private }; }
      else if (method === "GET" && /^\/repos\/Tobias123\/[^/]+$/.test(path)) { const n = path.split("/")[3]; st = repos[n] ? 200 : 404; out = { default_branch: "main" }; }
      else if (/\/contents\/index.html/.test(path)) { const n = path.split("/")[3];
        if (method === "GET") { st = files[n] ? 200 : 404; out = files[n] ? { sha: "sha1" } : {}; }
        else { const b = JSON.parse(body); if (files[n] && b.sha !== "sha1") { st = 409; } else { files[n] = Buffer.from(b.content, "base64").toString("utf8"); st = files[n].length ? (b.sha ? 200 : 201) : 400; } } }
      else if (/\/pages$/.test(path)) { const n = path.split("/")[3]; st = pages[n] ? 409 : 201; pages[n] = 1; }
      setTimeout(() => w.appHttp(id, st, JSON.stringify(out)), 15);
    };
(async () => {
  try {
    await tick(500);
    d.querySelector('.tb[data-go="startup"]').click(); await tick(60);
    d.querySelector('[data-idea="web"]').click(); await tick(60);
    d.querySelector('.tool[data-sheet="site"]').click(); await tick(80);
    console.log("pub button:", $("st-online").textContent, "| status:", $("st-pub").textContent);
    $("st-online").click(); await tick(100);
    console.log("gh sheet:", !$("sheet-gh").hidden);
    $("gh-token").value = "abc"; $("gh-save").click(); await tick(50); console.log("bad format:", $("gh-status").textContent);
    $("gh-token").value = "ghp_" + "b".repeat(36); $("gh-save").click(); await tick(200); console.log("wrong token:", $("gh-status").textContent, "| stored:", w.localStorage.getItem("plan2028:gh"));
    $("gh-token").value = TOK; $("gh-save").click(); await tick(200);
    console.log("ok token:", $("gh-status").textContent, "| login in state:", st().startup.gh && st().startup.gh.login);
    await tick(1200);
    console.log("returned to site + publishing:", !$("sheet-site").hidden, "|", $("st-pub").textContent);
    await tick(3500);
    const s0 = st().startup.sites[0];
    console.log("published:", s0.url, s0.repo, "| status:", $("st-pub").textContent, "| btn:", $("st-online").textContent);
    console.log("file ok:", (files["salon-nova"] || "").includes("<h1>Klip, farve og styling"), "| æøå ok:", (files["salon-nova"] || "").includes("Børneklip"), "| no preview css:", !(files["salon-nova"] || "").includes("pointer-events:none"));
    console.log("calls:", calls.join(" , "));
    // update
    calls.length = 0; $("st-tag").value = "Nyt look i Aarhus"; $("st-tag").dispatchEvent(new w.Event("input")); $("st-online").click(); await tick(1500);
    console.log("update:", $("st-pub").textContent, "| new tag:", files["salon-nova"].includes("Nyt look i Aarhus"), "| calls:", calls.join(" , "));
    console.log("token not in state/backup:", !JSON.stringify(st()).includes(TOK));
    d.querySelector("#sheet-site [data-close]").click(); await tick(450);
    // self test
    d.querySelector('[data-go="tjek"]').click(); await tick(1200);
    console.log("checks:", [...$("ckList").querySelectorAll(".cell")].map(c => c.querySelector("b").textContent + "=" + c.querySelector(".ckdot").className.replace("ckdot ", "")).join(", "));
    w.Plan2028.saveFile = () => setTimeout(() => w.appSaved(true), 20);
    $("ckList").querySelector('[data-ck="save"]').click(); await tick(80);
    console.log("save check:", [...$("ckList").querySelectorAll(".cell")].find(c => c.textContent.includes("Gem fil")).textContent.slice(0, 40));
    $("ck-run").click(); await tick(400);
    console.log("errlog:", [...$("ckList").querySelectorAll(".cell")].find(c => c.textContent.includes("Fejllog")).textContent.slice(0, 90));
    console.log("privacy:", $("privacyCard").textContent.includes("cvrapi.dk"));
  } catch (e) { errors.push("TEST: " + e.stack); }
  console.log("errors:", errors.length ? errors : "none"); process.exit(0);
})();
