import { useEffect, useState } from "react";
import { Platform } from "react-native";
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
        </AuthProvider>
      </UserAuthProvider>
    </QueryClientProvider>
  );
}
