// Carimba uma versão única em dist/service-worker.js depois do export.
//
// O browser só entende que existe uma versão nova do service worker quando
// os BYTES do arquivo mudam — como service-worker.js é escrito à mão e não
// muda a cada deploy, sem esse carimbo o fluxo de "nova versão disponível"
// (ver useServiceWorkerUpdate em app/_layout.tsx) nunca disparia para uma
// aba que já estava aberta antes do deploy. Usamos o SHA do commit que a
// Vercel expõe em build; localmente cai no timestamp.
const fs = require("fs");
const path = require("path");

const swPath = path.join(__dirname, "..", "dist", "service-worker.js");
const version = process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now());

const contents = fs.readFileSync(swPath, "utf8");
fs.writeFileSync(swPath, `${contents}\n// build: ${version}\n`);

console.log(`[stamp-service-worker] dist/service-worker.js -> build ${version}`);
