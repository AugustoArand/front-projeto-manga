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

  const { data: chapter, isLoading, isError } = useQuery({
    queryKey: ["chapter", id, source],
    queryFn:  () => isMdex ? getMdexChapter(id!) : getChapter(mangaId!, id!),
    enabled:  !!id,
  });

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
            <Image
              source={{ uri: item.image_url ?? undefined }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.5 }}
              contentFit="contain"
              transition={150}
            />
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
