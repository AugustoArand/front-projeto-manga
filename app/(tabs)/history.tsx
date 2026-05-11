import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { getHistory } from "@/services/api";

interface HistoryEntry {
  id: number;
  title: string;
  cover_url: string | null;
  genre: string | null;
  manga_id: number | null;
  mangadex_id: string | null;
  updated_at: string;
}

export default function HistoryScreen() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["history"],
    queryFn: getHistory,
  });

  const entries: HistoryEntry[] = data ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0D0D0F" }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text
          style={{
            color: "#E040FB",
            fontSize: 22,
            fontWeight: "900",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          📖 Histórico
        </Text>
        <Text style={{ color: "#6B7280", fontSize: 13, marginTop: 2 }}>
          Continue de onde parou
        </Text>
      </View>

      {isLoading && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#E040FB" />
        </View>
      )}

      {isError && (
        <Pressable
          onPress={() => refetch()}
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#6B7280" }}>Erro ao carregar. Toque para tentar novamente.</Text>
        </Pressable>
      )}

      {!isLoading && !isError && entries.length === 0 && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#4B5563", fontSize: 14 }}>Nenhuma leitura ainda</Text>
        </View>
      )}

      <FlatList
        data={entries}
        keyExtractor={(e) => String(e.id)}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (item.mangadex_id) {
                router.push({ pathname: "/manga/[id]", params: { id: item.mangadex_id } });
              } else if (item.manga_id) {
                router.push({ pathname: "/manga/[id]", params: { id: String(item.manga_id) } });
              }
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#14141A",
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
              gap: 12,
            }}
          >
            <Image
              source={{ uri: item.cover_url ?? undefined }}
              style={{ width: 52, height: 72, borderRadius: 6 }}
              contentFit="cover"
              placeholder={{ color: "#1A1A24" }}
            />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={2} style={{ color: "#E5E7EB", fontSize: 14, fontWeight: "600" }}>
                {item.title}
              </Text>
              {item.genre && (
                <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 2 }}>{item.genre}</Text>
              )}
              <Text style={{ color: "#4B5563", fontSize: 11, marginTop: 4 }}>
                {new Date(item.updated_at).toLocaleDateString("pt-BR")}
              </Text>
            </View>
            <Text style={{ color: "#4B5563", fontSize: 18 }}>›</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
