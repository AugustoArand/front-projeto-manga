import { useState } from "react";
import {
  View, Text, TextInput, Pressable, ScrollView,
  ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import {
  beginUploadSession, commitUpload, abandonUpload,
  getUploadSession, CommitChapterPayload,
} from "@/services/api";

const C = {
  bg: "#F7F3ED", card: "#FFFFFF", pink: "#E8186D",
  pinkBg: "#FDEEF5", pinkBorder: "#F0C8DC",
  text: "#1A1A1A", sub: "#9CA3AF", border: "#E8E3DB",
  darkCard: "#1A1A1A", darkText: "#FFFFFF",
  green: "#16A34A",
};

type Step = "meta" | "pages" | "done";

export default function UploadScreen() {
  const { isAuthenticated } = useAuth();

  const [step, setStep]           = useState<Step>("meta");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pageIds, setPageIds]     = useState<string[]>([]);
  const [chapterId, setChapterId] = useState<string | null>(null);

  // Meta fields
  const [mangaId, setMangaId]   = useState("");
  const [chapter, setChapter]   = useState("");
  const [title, setTitle]       = useState("");
  const [volume, setVolume]     = useState("");
  const [lang, setLang]         = useState("pt-br");

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: "900", fontStyle: "italic", color: C.text, marginBottom: 12 }}>
          Login necessário
        </Text>
        <Text style={{ color: C.sub, fontSize: 14, textAlign: "center", marginBottom: 24 }}>
          Você precisa estar logado para fazer upload de capítulos.
        </Text>
        <Pressable onPress={() => router.push("/login")}
          style={{ backgroundColor: C.pink, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14 }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>Fazer login</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  async function handleBeginSession() {
    if (!mangaId.trim()) { setError("Informe o ID do mangá."); return; }
    if (!chapter.trim()) { setError("Informe o número do capítulo."); return; }
    setLoading(true); setError(null);
    try {
      // Check for existing session
      const existing = await getUploadSession();
      if (existing.active) {
        Alert.alert(
          "Sessão ativa",
          "Já existe uma sessão de upload ativa. Deseja abandoná-la e criar uma nova?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Abandonar e criar nova",
              style: "destructive",
              onPress: async () => {
                await abandonUpload(existing.session.id);
                await startSession();
              },
            },
          ]
        );
      } else {
        await startSession();
      }
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e.message);
    } finally {
      setLoading(false);
    }
  }

  async function startSession() {
    const { session_id } = await beginUploadSession(mangaId.trim());
    setSessionId(session_id);
    setStep("pages");
  }

  async function handleCommit() {
    if (!sessionId) return;
    if (pageIds.length === 0) { setError("Nenhuma página foi adicionada."); return; }
    setLoading(true); setError(null);
    try {
      const payload: CommitChapterPayload = {
        chapter: chapter.trim(),
        title:   title.trim() || undefined,
        volume:  volume.trim() || undefined,
        translated_language: lang,
        page_order: pageIds,
      };
      const { chapter_id } = await commitUpload(sessionId, payload);
      setChapterId(chapter_id);
      setStep("done");
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAbandon() {
    if (!sessionId) return;
    Alert.alert("Abandonar upload", "Tem certeza? As páginas enviadas serão descartadas.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Abandonar", style: "destructive",
        onPress: async () => {
          await abandonUpload(sessionId);
          setSessionId(null); setPageIds([]); setStep("meta");
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 }}>
          <View>
            <Text style={{ fontSize: 11, color: C.sub, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>publicação</Text>
            <Text style={{ fontSize: 28, fontWeight: "900", fontStyle: "italic", color: C.text, textDecorationLine: "underline" }}>
              upload capítulo
            </Text>
          </View>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 14, color: C.sub }}>←</Text>
            <Text style={{ fontSize: 13, color: C.sub }}>voltar</Text>
          </Pressable>
        </View>

        {/* Progress steps */}
        <View style={{ flexDirection: "row", paddingHorizontal: 16, marginBottom: 24, gap: 8 }}>
          {(["meta", "pages", "done"] as Step[]).map((s, i) => (
            <View key={s} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: step === s || (i < ["meta","pages","done"].indexOf(step)) ? C.pink : C.border }} />
          ))}
        </View>

        <View style={{ paddingHorizontal: 16 }}>

          {/* ── Step 1: Metadados ── */}
          {step === "meta" && (
            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: C.text, marginBottom: 4 }}>
                1. Informações do capítulo
              </Text>

              {[
                { label: "ID do mangá (UUID) *", value: mangaId, set: setMangaId, placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", mono: true },
                { label: "Número do capítulo *",  value: chapter,  set: setChapter,  placeholder: "1, 2, 10.5…" },
                { label: "Título do capítulo",    value: title,    set: setTitle,    placeholder: "Opcional" },
                { label: "Volume",                value: volume,   set: setVolume,   placeholder: "Opcional" },
                { label: "Idioma",                value: lang,     set: setLang,     placeholder: "pt-br" },
              ].map(({ label, value, set, placeholder, mono }) => (
                <View key={label}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: C.text, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</Text>
                  <TextInput
                    value={value}
                    onChangeText={set}
                    placeholder={placeholder}
                    placeholderTextColor={C.sub}
                    autoCapitalize="none"
                    style={{
                      backgroundColor: C.card,
                      borderWidth: 1.5, borderColor: C.border,
                      borderRadius: 12,
                      paddingHorizontal: 16, paddingVertical: 13,
                      fontSize: mono ? 12 : 15,
                      fontFamily: mono ? "monospace" : undefined,
                      color: C.text,
                    }}
                  />
                </View>
              ))}

              {error && <Text style={{ color: "#DC2626", fontSize: 13 }}>{error}</Text>}

              <Pressable onPress={handleBeginSession} disabled={loading}
                style={{ backgroundColor: loading ? C.pinkBorder : C.pink, borderRadius: 14, padding: 18, alignItems: "center", marginTop: 4 }}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Iniciar sessão →</Text>
                }
              </Pressable>
            </View>
          )}

          {/* ── Step 2: Páginas ── */}
          {step === "pages" && (
            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: C.text, marginBottom: 4 }}>
                2. Páginas
              </Text>

              <View style={{ backgroundColor: C.darkCard, borderRadius: 14, padding: 16 }}>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 4 }}>sessão ativa</Text>
                <Text style={{ color: C.darkText, fontSize: 12, fontFamily: "monospace" }} numberOfLines={1}>{sessionId}</Text>
              </View>

              <View style={{ backgroundColor: C.pinkBg, borderWidth: 1, borderColor: C.pinkBorder, borderRadius: 14, padding: 16, gap: 10 }}>
                <Text style={{ color: C.pink, fontWeight: "700", fontSize: 14 }}>📋 Limites por sessão</Text>
                {[
                  "Formatos: JPEG, PNG ou GIF",
                  "Máx. por arquivo: 20 MB",
                  "Máx. por request: 10 arquivos",
                  "Máx. por sessão: 500 arquivos / 150 MB",
                  "Resolução: menos de 10.000px",
                ].map((t) => (
                  <Text key={t} style={{ color: C.text, fontSize: 13 }}>• {t}</Text>
                ))}
              </View>

              <View style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 16, alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 28 }}>📁</Text>
                <Text style={{ color: C.sub, fontSize: 14, textAlign: "center" }}>
                  O upload de arquivos via app mobile requer{"\n"}
                  <Text style={{ color: C.pink, fontWeight: "700" }}>expo-image-picker</Text>.{"\n"}
                  Use a API REST diretamente para testes:
                </Text>
                <View style={{ backgroundColor: C.bg, borderRadius: 8, padding: 10, width: "100%" }}>
                  <Text style={{ fontFamily: "monospace", fontSize: 11, color: C.text }}>
                    POST /api/v1/upload/{sessionId?.slice(0, 8)}…/pages{"\n"}
                    Content-Type: multipart/form-data{"\n"}
                    Authorization: Bearer {"{token}"}
                  </Text>
                </View>
              </View>

              <View style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14 }}>
                <Text style={{ color: C.sub, fontSize: 13, marginBottom: 10 }}>
                  IDs de páginas adicionadas ({pageIds.length}):
                </Text>
                {pageIds.length === 0
                  ? <Text style={{ color: C.sub, fontSize: 12, fontStyle: "italic" }}>Nenhuma página ainda</Text>
                  : pageIds.map((id, i) => (
                    <Text key={id} style={{ fontSize: 11, fontFamily: "monospace", color: C.text }}>
                      {i + 1}. {id}
                    </Text>
                  ))
                }
              </View>

              {error && <Text style={{ color: "#DC2626", fontSize: 13 }}>{error}</Text>}

              <View style={{ gap: 10 }}>
                <Pressable onPress={handleCommit} disabled={loading || pageIds.length === 0}
                  style={{ backgroundColor: pageIds.length === 0 ? C.border : C.pink, borderRadius: 14, padding: 18, alignItems: "center" }}>
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Publicar capítulo ✓</Text>
                  }
                </Pressable>
                <Pressable onPress={handleAbandon}
                  style={{ borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, alignItems: "center" }}>
                  <Text style={{ color: C.sub, fontSize: 14 }}>Abandonar sessão</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* ── Step 3: Publicado ── */}
          {step === "done" && (
            <View style={{ alignItems: "center", paddingVertical: 32, gap: 16 }}>
              <Text style={{ fontSize: 56 }}>🎉</Text>
              <Text style={{ fontSize: 24, fontWeight: "900", fontStyle: "italic", color: C.text }}>
                Capítulo enviado!
              </Text>
              <Text style={{ color: C.sub, fontSize: 14, textAlign: "center", lineHeight: 22 }}>
                Seu capítulo está em processamento.{"\n"}
                Primeiro upload entra em revisão manual (até 48h).{"\n"}
                Uploads seguintes aprovam em 1–5 minutos.
              </Text>

              {chapterId && (
                <View style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, width: "100%" }}>
                  <Text style={{ color: C.sub, fontSize: 11, marginBottom: 4 }}>ID do capítulo</Text>
                  <Text style={{ fontFamily: "monospace", fontSize: 12, color: C.text }}>{chapterId}</Text>
                </View>
              )}

              <Pressable
                onPress={() => { setStep("meta"); setSessionId(null); setPageIds([]); setChapterId(null); }}
                style={{ backgroundColor: C.pink, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 }}>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>Novo upload</Text>
              </Pressable>
            </View>
          )}

        </View>
        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
