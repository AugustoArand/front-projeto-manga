// Service worker do MangaVerse (PWA web).
//
// Objetivo único: garantir que o app instalado sempre reflita o último
// deploy, sem depender do usuário fechar/reabrir ou reinstalar manualmente.
//
// Estratégia (de propósito bem conservadora — nada de offline-first):
// - Navegação (HTML): network-first. Sempre tenta buscar a versão nova
//   primeiro; só cai pro cache (se existir) quando a rede falha.
// - Assets estáticos com hash no nome (/_expo/static/...): cache-first.
//   São imutáveis por build — o nome do arquivo muda a cada deploy — então
//   cachear pra sempre é seguro e evita rebaixar performance.
// - Qualquer outra coisa (API do backend, imagens do MangaDex, etc.):
//   não intercepta. Deixa passar direto pro cache HTTP normal do browser.
//
// Atualização: NÃO chama skipWaiting() automaticamente no install — isso
// deixaria o novo SW assumir o controle na hora, recarregando abas abertas
// sem avisar (ex.: usuário no meio da leitura de um capítulo). Em vez
// disso, fica em "waiting" até o app pedir explicitamente via postMessage
// (ver useServiceWorkerUpdate em app/_layout.tsx), que mostra um aviso de
// "nova versão disponível" e só recarrega quando o usuário confirma.

const STATIC_CACHE = "mangaverse-static-v1";

self.addEventListener("install", () => {
  // Não chama skipWaiting aqui de propósito — ver comentário acima.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isImmutableStaticAsset(url) {
  return url.pathname.startsWith("/_expo/static/");
}

async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const fresh = await fetch(request);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(request, fresh.clone());
  return fresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Nunca intercepta cross-origin (API Rails, CDN da MangaDex) — deixa o
  // browser cuidar disso do jeito normal.
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isImmutableStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});
