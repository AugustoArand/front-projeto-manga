import { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getChapter, getMdexChapter, getMdexManga } from "@/services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Page {
  id?: number;
  number: number;
  image_url?: string | null;
  filename?: string;
}

const MAX_PAGE_ATTEMPTS = 2;

/** Uma página do leitor. Tenta recarregar a imagem antes de mostrar erro,
 * já que o servidor MD@Home atribuído pode estar temporariamente instável. */
function PageImage({ page, onPersistentFailure }: { page: Page; onPersistentFailure: () => void }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [page.image_url]);

  if (!page.image_url || failed) {
    return (
      <View
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_WIDTH * 1.5,
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Text style={{ color: "#6B7280", fontSize: 13 }}>Falha ao carregar a página {page.number}</Text>
        <Pressable
          onPress={() => {
            setAttempt(0);
            setFailed(false);
          }}
        >
          <Text style={{ color: "#E040FB", fontSize: 13 }}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  const uri = attempt === 0 ? page.image_url : `${page.image_url}${page.image_url.includes("?") ? "&" : "?"}retry=${attempt}`;

  return (
    <Image
      source={{ uri }}
      style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.5 }}
      contentFit="contain"
      transition={150}
      onError={() => {
        if (attempt + 1 >= MAX_PAGE_ATTEMPTS) {
          setFailed(true);
          onPersistentFailure();
        } else {
          setAttempt((a) => a + 1);
        }
      }}
    />
  );
}

function normalizePages(data: any, source: string): Page[] {
  if (source === "mdex") {
    return (data?.pages ?? []).map((p: any) => ({
      number:    p.number,
      image_url: p.image_url,
    }));
  }
  return data?.pages ?? [];
}

export default function ChapterReaderScreen() {
  const { id, mangaId, source } = useLocalSearchParams<{
    id: string;
    mangaId: string;
    source?: string;
  }>();

  const isMdex = source === "mdex";

  // Se as imagens de várias páginas falharem, o nó MD@Home atribuído pelo
  // backend provavelmente está indisponível — força uma nova atribuição.
  const [forceRefresh, setForceRefresh] = useState(false);
  const refreshTriggeredRef = useRef(false);

  useEffect(() => {
    refreshTriggeredRef.current = false;
  }, [id]);

  const { data: chapter, isLoading, isError, refetch } = useQuery({
    queryKey: ["chapter", id, source],
    queryFn:  () => isMdex ? getMdexChapter(id!, false, forceRefresh) : getChapter(mangaId!, id!),
    enabled:  !!id,
  });

  useEffect(() => {
    if (forceRefresh) {
      refetch().finally(() => setForceRefresh(false));
    }
  }, [forceRefresh]);

  function handlePersistentPageFailure() {
    if (isMdex && !refreshTriggeredRef.current) {
      refreshTriggeredRef.current = true;
      setForceRefresh(true);
    }
  }

  // Busca a lista de capítulos do mangá para derivar prev/next.
  // Normalmente é cache hit pois o usuário veio da tela de detalhe.
  const { data: mangaData } = useQuery({
    queryKey: ["manga", mangaId],
    queryFn:  () => getMdexManga(mangaId!),
    enabled:  isMdex && !!mangaId,
    staleTime: 15 * 60 * 1000,
  });

  const mdexChapters: any[] = mangaData?.chapters ?? [];
  const currentIndex = mdexChapters.findIndex((ch: any) => String(ch.id) === String(id));
  const prevMdexChapter = currentIndex > 0 ? mdexChapters[currentIndex - 1] : null;
  const nextMdexChapter = currentIndex >= 0 && currentIndex < mdexChapters.length - 1
    ? mdexChapters[currentIndex + 1]
    : null;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#E040FB" />
      </View>
    );
  }

  if (isError || !chapter) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center", gap: 12 }}>
        <Text style={{ color: "#6B7280", fontSize: 15 }}>Capítulo não encontrado</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: "#E040FB", fontSize: 14 }}>← Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const pages: Page[] = normalizePages(chapter, source ?? "local");

  const currentMdexChapter = currentIndex >= 0 ? mdexChapters[currentIndex] : null;
  const chapterLabel = isMdex
    ? `Cap. ${currentMdexChapter?.chapter ?? id}`
    : `Cap. ${chapter.number}`;

  const mangaTitle = isMdex ? "" : (chapter.manga_title ?? "");

  const hasPrev = isMdex ? !!prevMdexChapter : !!chapter.prev_chapter_id;
  const hasNext = isMdex ? !!nextMdexChapter : !!chapter.next_chapter_id;

  function goToPrev() {
    if (isMdex && prevMdexChapter) {
      router.replace({
        pathname: "/chapter/[id]",
        params: { id: String(prevMdexChapter.id), mangaId: String(mangaId), source: "mdex" },
      });
    } else if (!isMdex && chapter.prev_chapter_id) {
      router.replace({
        pathname: "/chapter/[id]",
        params: { id: String(chapter.prev_chapter_id), mangaId: String(chapter.manga_id), source: "local" },
      });
    }
  }

  function goToNext() {
    if (isMdex && nextMdexChapter) {
      router.replace({
        pathname: "/chapter/[id]",
        params: { id: String(nextMdexChapter.id), mangaId: String(mangaId), source: "mdex" },
      });
    } else if (!isMdex && chapter.next_chapter_id) {
      router.replace({
        pathname: "/chapter/[id]",
        params: { id: String(chapter.next_chapter_id), mangaId: String(chapter.manga_id), source: "local" },
      });
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Top bar */}
      <SafeAreaView>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: "rgba(0,0,0,0.85)",
          }}
        >
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: "#E040FB", fontSize: 14 }}>← Voltar</Text>
          </Pressable>
          <Text style={{ color: "#9CA3AF", fontSize: 12 }} numberOfLines={1}>
            {mangaTitle ? `${mangaTitle} · ` : ""}{chapterLabel}
          </Text>
          <View style={{ width: 60 }} />
        </View>
      </SafeAreaView>

      {/* Pages */}
      {pages.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
          <Text style={{ color: "#6B7280", fontSize: 15 }}>Nenhuma página disponível</Text>
          <Text style={{ color: "#4B5563", fontSize: 12, textAlign: "center", paddingHorizontal: 32 }}>
            Este capítulo pode estar em processamento ou indisponível no seu idioma.
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: "#E040FB", fontSize: 14 }}>← Voltar</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={pages}
          keyExtractor={(p, i) => String(p.id ?? p.number ?? i)}
          renderItem={({ item }) => (
            <PageImage page={item} onPersistentFailure={handlePersistentPageFailure} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Navegação prev/next — funciona para local e MangaDex */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 16,
          backgroundColor: "rgba(0,0,0,0.85)",
        }}
      >
        <Pressable disabled={!hasPrev} onPress={goToPrev} style={{ opacity: hasPrev ? 1 : 0.3 }}>
          <Text style={{ color: "#E040FB", fontSize: 14 }}>← Anterior</Text>
        </Pressable>
        <Pressable disabled={!hasNext} onPress={goToNext} style={{ opacity: hasNext ? 1 : 0.3 }}>
          <Text style={{ color: "#E040FB", fontSize: 14 }}>Próximo →</Text>
        </Pressable>
      </View>
    </View>
  );
}
