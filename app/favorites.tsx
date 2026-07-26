import { View, Text, FlatList, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getFavorites } from "@/services/api";
import { CoverImage } from "@/components/CoverImage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface Favorite {
  id: number;
  title: string;
  cover_url: string | null;
  genre: string | null;
  manga_id: number | null;
  mangadex_id: string | null;
}

export default function FavoritesScreen() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
  });

  const favorites: Favorite[] = data ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0D0D0F" }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: "#E040FB", fontSize: 20 }}>←</Text>
        </Pressable>
        <Text style={{ color: "#E040FB", fontSize: 20, fontWeight: "900", letterSpacing: 2, textTransform: "uppercase" }}>
          Favoritos
        </Text>
      </View>

      {isLoading && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#E040FB" />
        </View>
      )}

      {isError && (
        <Pressable onPress={() => refetch()} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#6B7280" }}>Erro ao carregar. Toque para tentar novamente.</Text>
        </Pressable>
      )}

      {!isLoading && !isError && favorites.length === 0 && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 8, paddingBottom: 80 }}>
          <Text style={{ fontSize: 40 }}>🤍</Text>
          <Text style={{ color: "#6B7280", fontSize: 14 }}>Você ainda não favoritou nenhum mangá</Text>
        </View>
      )}

      <FlatList
        data={favorites}
        keyExtractor={(f) => String(f.id)}
        numColumns={2}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/manga/[id]", params: { id: item.mangadex_id ?? String(item.manga_id) } })}
            style={{ width: CARD_WIDTH }}
          >
            <CoverImage uri={item.cover_url} style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.42, borderRadius: 8 }} />
            <Text numberOfLines={2} style={{ color: "#E5E7EB", fontSize: 12, fontWeight: "600", marginTop: 6 }}>
              {item.title}
            </Text>
            {item.genre && (
              <Text numberOfLines={1} style={{ color: "#6B7280", fontSize: 11, marginTop: 2 }}>
                {item.genre}
              </Text>
            )}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
