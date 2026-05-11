import { View, Text, FlatList, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getChapter, getMdexChapter } from "@/services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Page {
  id?: number;
  number: number;
  image_url?: string | null;  // local
  filename?: string;          // MangaDex
  image_url_mdex?: string;    // normalizado abaixo
}

function normalizePages(data: any, source: string): Page[] {
  if (source === "mdex") {
    return (data?.pages ?? []).map((p: any) => ({
      number:    p.number,
      image_url: p.image_url,   // já montado pelo Rails: baseUrl/data/hash/filename
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

  const chapterLabel = isMdex
    ? `Cap. ${chapter.chapter_id ?? id}`
    : `Cap. ${chapter.number}`;

  const mangaTitle = isMdex ? "" : (chapter.manga_title ?? "");

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

      {/* Bottom navigation (só para catálogo local — MangaDex não retorna prev/next) */}
      {!isMdex && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 16,
            backgroundColor: "rgba(0,0,0,0.85)",
          }}
        >
          <Pressable
            disabled={!chapter.prev_chapter_id}
            onPress={() =>
              router.replace({
                pathname: "/chapter/[id]",
                params: { id: String(chapter.prev_chapter_id), mangaId: String(chapter.manga_id), source: "local" },
              })
            }
            style={{ opacity: chapter.prev_chapter_id ? 1 : 0.3 }}
          >
            <Text style={{ color: "#E040FB", fontSize: 14 }}>← Anterior</Text>
          </Pressable>
          <Pressable
            disabled={!chapter.next_chapter_id}
            onPress={() =>
              router.replace({
                pathname: "/chapter/[id]",
                params: { id: String(chapter.next_chapter_id), mangaId: String(chapter.manga_id), source: "local" },
              })
            }
            style={{ opacity: chapter.next_chapter_id ? 1 : 0.3 }}
          >
            <Text style={{ color: "#E040FB", fontSize: 14 }}>Próximo →</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
