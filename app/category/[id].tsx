import { View, Text, FlatList, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getCategory } from "@/services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface Manga {
  id: string;
  title: string;
  cover_url: string | null;
  status?: string;
  author?: string;
}

export default function CategoryScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id!, name ?? ""),
    enabled: !!id,
  });

  const mangas: Manga[] = data?.mangas ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0D0D0F" }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: "#E040FB", fontSize: 20 }}>←</Text>
        </Pressable>
        <Text
          style={{
            color: "#E040FB",
            fontSize: 20,
            fontWeight: "900",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {name}
        </Text>
      </View>

      {isLoading && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#E040FB" />
        </View>
      )}

      {isError && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#6B7280" }}>Erro ao carregar categoria</Text>
        </View>
      )}

      <FlatList
        data={mangas}
        keyExtractor={(m) => m.id}
        numColumns={2}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/manga/[id]", params: { id: item.id } })}
            style={{ width: CARD_WIDTH }}
          >
            <Image
              source={{ uri: item.cover_url ?? undefined }}
              style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.42, borderRadius: 8 }}
              contentFit="cover"
              placeholder={{ color: "#1A1A24" }}
              transition={200}
            />
            <Text
              numberOfLines={2}
              style={{ color: "#E5E7EB", fontSize: 12, fontWeight: "600", marginTop: 6 }}
            >
              {item.title}
            </Text>
            {item.author && (
              <Text numberOfLines={1} style={{ color: "#6B7280", fontSize: 11, marginTop: 2 }}>
                {item.author}
              </Text>
            )}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
