import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { UserAuthProvider } from "@/context/UserAuthContext";
import WebLandingPage from "@/components/WebLandingPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 2 },
  },
});

/** Registra o service worker (ver public/service-worker.js) e expõe quando
 * uma versão nova já está pronta esperando confirmação do usuário. */
function useServiceWorkerUpdate() {
  const [updateReady, setUpdateReady] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || !("serviceWorker" in navigator)) return;

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker.register("/service-worker.js").then((registration) => {
      registrationRef.current = registration;

      // Já existe uma versão esperando (ex.: aba ficou aberta desde antes
      // do deploy) — oferece a atualização imediatamente.
      if (registration.waiting) setUpdateReady(true);

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateReady(true);
          }
        });
      });
    }).catch(() => {
      // Registro falhou (ex.: navegador sem suporte) — sem service worker
      // o app continua funcionando normalmente, só sem o aviso de update.
    });
  }, []);

  function applyUpdate() {
    registrationRef.current?.waiting?.postMessage({ type: "SKIP_WAITING" });
  }

  return { updateReady, applyUpdate };
}

function UpdateBanner({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: "fixed" as any,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        backgroundColor: "#E040FB",
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#0D0D0F", fontWeight: "700", fontSize: 13 }}>
        Nova versão disponível — toque para atualizar
      </Text>
    </Pressable>
  );
}

function useIsStandalone() {
  // null = ainda detectando, true = PWA instalado, false = browser comum
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    setIsStandalone(standalone);
  }, []);

  return isStandalone;
}

export default function RootLayout() {
  const isStandalone = useIsStandalone();
  const { updateReady, applyUpdate } = useServiceWorkerUpdate();

  if (Platform.OS === "web") {
    if (isStandalone === null) return null; // detectando modo (um frame)
    if (!isStandalone) return <WebLandingPage />;
    // standalone: cai no app normal abaixo
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UserAuthProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0D0D0F" } }}>
            <Stack.Screen name="(tabs)"        options={{ headerShown: false }} />
            <Stack.Screen name="manga/[id]"    options={{ headerShown: false }} />
            <Stack.Screen name="chapter/[id]"  options={{ headerShown: false }} />
            <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="profile"       options={{ headerShown: false }} />
            <Stack.Screen name="plans"         options={{ headerShown: false }} />
            <Stack.Screen name="login"         options={{ headerShown: false }} />
            <Stack.Screen name="upload"        options={{ headerShown: false }} />
          </Stack>
          {updateReady && <UpdateBanner onPress={applyUpdate} />}
        </AuthProvider>
      </UserAuthProvider>
    </QueryClientProvider>
  );
}
