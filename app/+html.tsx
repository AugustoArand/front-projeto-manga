import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * Root HTML template para o build web (Expo Router static output).
 * Injeta a referência ao manifest PWA e meta tags necessárias.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* PWA - Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* PWA - iOS / Safari */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MangaVerse" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* Theme color para Android Chrome e navegadores modernos */}
        <meta name="theme-color" content="#E040FB" />
        <meta name="msapplication-TileColor" content="#0D0D0F" />

        {/* SEO */}
        <meta name="description" content="Leia qualquer mangá onde quiser. Busque, leia e acompanhe seus títulos favoritos via MangaDex." />
        <title>MangaVerse</title>

        {/* Reset de scroll para React Native Web */}
        <ScrollViewStyleReset />

        <style
          dangerouslySetInnerHTML={{
            __html: `
              #root, body, html { height: 100%; }
              body { overflow: hidden; }
              #root { display: flex; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
