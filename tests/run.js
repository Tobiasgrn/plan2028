// Kører alle røgtests mod web/index.html. Bruges af GitHub Actions før APK'en bygges.
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const dir = __dirname, page = path.join(dir, "..", "web", "index.html");
let bad = 0;
for (const f of fs.readdirSync(dir).filter(f => /^smoke\d*\.js$/.test(f)).sort()) {
  let out = "";
  try { out = execFileSync("node", [path.join(dir, f), page], { encoding: "utf8", timeout: 120000 }); }
  catch (e) { out = (e.stdout || "") + (e.stderr || ""); }
  const ok = /errors: none/.test(out);
  console.log((ok ? "OK    " : "FEJL  ") + f);
  if (!ok) { bad++; console.log(out.split("\n").slice(-20).join("\n")); }
}
console.log(bad ? bad + " test(s) fejlede" : "Alle tests bestået");
process.exit(bad ? 1 : 0);
