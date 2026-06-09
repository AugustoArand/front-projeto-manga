import { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FEATURES = [
  { icon: "🔍", title: "Busca global",     desc: "Mais de 50 mil títulos disponíveis via MangaDex" },
  { icon: "📖", title: "Leitura fluida",   desc: "Leitor otimizado com navegação entre capítulos" },
  { icon: "📚", title: "Histórico",        desc: "Continue de onde parou a qualquer momento" },
  { icon: "🏷️", title: "Categorias",      desc: "Explore por gênero: ação, romance, fantasia e mais" },
];

const IOS_STEPS = [
  'Toque no ícone de compartilhar (quadrado com seta ↑) na barra inferior do Safari',
  'Selecione "Adicionar à Tela de Início"',
  'Toque em "Adicionar" e abra o MangaVerse na tela inicial',
];

const ANDROID_STEPS = [
  'Toque nos três pontos ⋮ no canto superior direito do Chrome',
  'Selecione "Adicionar à tela inicial"',
  'Confirme e abra o MangaVerse na sua tela inicial',
];

function detectIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

export default function WebLandingPage() {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled]   = useState(false);
  const deferredPrompt              = useRef<any>(null);
  const isIOS                       = detectIOS();
  const steps                       = isIOS ? IOS_STEPS : ANDROID_STEPS;
  const { width }                   = Dimensions.get("window");
  const cardWidth                   = Math.min((width - 52) / 2, 200);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setCanInstall(true);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      deferredPrompt.current = null;
      setCanInstall(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0D0D0F" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>

        {/* ── Navbar ── */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 20,
          borderBottomWidth: 1,
          borderBottomColor: "#1A1A24",
        }}>
          <Text style={{ color: "#E040FB", fontSize: 22, fontWeight: "900", letterSpacing: 1 }}>
            MangaVerse
          </Text>
          <View style={{
            backgroundColor: "#E040FB22",
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: "#E040FB55",
          }}>
            <Text style={{ color: "#E040FB", fontSize: 11, fontWeight: "700" }}>BETA</Text>
          </View>
        </View>

        {/* ── Hero ── */}
        <View style={{ alignItems: "center", paddingHorizontal: 24, paddingTop: 56, paddingBottom: 48 }}>
          <View style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: "#E040FB18",
            borderWidth: 1,
            borderColor: "#E040FB44",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}>
            <Text style={{ fontSize: 44 }}>📚</Text>
          </View>

          <Text style={{
            color: "#E8E8F0",
            fontSize: 30,
            fontWeight: "900",
            textAlign: "center",
            lineHeight: 38,
            marginBottom: 16,
          }}>
            Leia qualquer mangá{"\n"}onde quiser
          </Text>

          <Text style={{
            color: "#9CA3AF",
            fontSize: 15,
            textAlign: "center",
            lineHeight: 24,
            marginBottom: 40,
            maxWidth: 300,
          }}>
            Busque, leia e acompanhe seus títulos favoritos.
            Para a melhor experiência, instale o app na sua tela inicial.
          </Text>

          {installed ? (
            <View style={{
              backgroundColor: "#E040FB22",
              paddingVertical: 16,
              paddingHorizontal: 40,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#E040FB",
            }}>
              <Text style={{ color: "#E040FB", fontSize: 16, fontWeight: "800" }}>✓ App instalado!</Text>
            </View>
          ) : canInstall ? (
            <Pressable
              onPress={handleInstall}
              style={({ pressed }) => ({
                backgroundColor: "#E040FB",
                paddingVertical: 16,
                paddingHorizontal: 40,
                borderRadius: 14,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>⬇ Instalar MangaVerse</Text>
            </Pressable>
          ) : null}
        </View>

        {/* ── Como instalar ── */}
        <View style={{
          marginHorizontal: 20,
          marginBottom: 32,
          backgroundColor: "#14141A",
          borderRadius: 16,
          padding: 24,
          borderWidth: 1,
          borderColor: "#1A1A24",
        }}>
          <Text style={{
            color: "#E040FB",
            fontSize: 12,
            fontWeight: "800",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 24,
          }}>
            {isIOS ? "Como instalar no iPhone / iPad" : "Como instalar no Android"}
          </Text>

          {steps.map((text, i) => (
            <View key={i} style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 16,
              marginBottom: i < steps.length - 1 ? 20 : 0,
            }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#E040FB22",
                borderWidth: 1,
                borderColor: "#E040FB55",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <Text style={{ color: "#E040FB", fontWeight: "900", fontSize: 13 }}>{i + 1}</Text>
              </View>
              <Text style={{ color: "#D1D5DB", fontSize: 14, lineHeight: 22, flex: 1, paddingTop: 5 }}>
                {text}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Recursos ── */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{
            color: "#E040FB",
            fontSize: 12,
            fontWeight: "800",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 16,
          }}>
            O que você vai encontrar
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {FEATURES.map((f, i) => (
              <View key={i} style={{
                width: cardWidth,
                backgroundColor: "#14141A",
                borderRadius: 14,
                padding: 16,
                borderWidth: 1,
                borderColor: "#1A1A24",
                gap: 8,
              }}>
                <Text style={{ fontSize: 26 }}>{f.icon}</Text>
                <Text style={{ color: "#E8E8F0", fontSize: 14, fontWeight: "700" }}>{f.title}</Text>
                <Text style={{ color: "#6B7280", fontSize: 12, lineHeight: 17 }}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Footer ── */}
        <Text style={{
          color: "#374151",
          fontSize: 12,
          textAlign: "center",
          marginTop: 48,
          paddingHorizontal: 24,
        }}>
          MangaVerse · Conteúdo fornecido via MangaDex
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}
