import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { getExplore } from "@/services/api";
import { GENRE_MAP, type GenreStyle } from "@/constants/genres";

interface Category {
  id: string;
  name: string;
}

function CategoryCard({ category, onPress }: { category: Category; onPress: () => void }) {
  const style: GenreStyle = GENRE_MAP[category.name] ?? GENRE_MAP["default"];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: "48%",
        backgroundColor: style.backgroundColor,
        borderColor: pressed ? style.accentColor : style.borderColor,
        borderWidth: 1.5,
        borderRadius: 10,
        paddingVertical: 22,
        paddingHorizontal: 12,
        alignItems: "center",
        gap: 10,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ fontSize: 38 }}>{style.emoji}</Text>
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        {category.name}
      </Text>
    </Pressable>
  );
}

export default function CategoriesScreen() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["explore"],
    queryFn: getExplore,
  });

  const categories: Category[] = data?.categories ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0D0D0F" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Header */}
        <View style={{ marginBottom: 4 }}>
          <Text
            style={{
              color: "#E040FB",
              fontSize: 26,
              fontWeight: "900",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            📁 Categorias
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 13, marginTop: 2 }}>
            Explore por gênero
          </Text>
        </View>

        <View style={{ height: 20 }} />

        {/* Loading */}
        {isLoading && (
          <View style={{ paddingTop: 60, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#E040FB" />
          </View>
        )}

        {/* Error */}
        {isError && (
          <Pressable onPress={() => refetch()} style={{ alignItems: "center", paddingTop: 40 }}>
            <Text style={{ color: "#6B7280", fontSize: 14 }}>
              Erro ao carregar. Toque para tentar novamente.
            </Text>
          </Pressable>
        )}

        {/* Grid */}
        {!isLoading && !isError && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onPress={() =>
                  router.push({
                    pathname: "/category/[id]",
                    params: { id: cat.id, name: cat.name },
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
