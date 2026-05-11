import { useState, useEffect } from "react";
import {
  View, Text, TextInput, FlatList,
  Pressable, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { searchMdex } from "@/services/api";

interface MdexManga {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  status: string | null;
  tags: string[];
}

export default function SearchScreen() {
  const [query, setQuery]       = useState("");
  const [debounced, setDebounced] = useState("");

  // Debounce: só dispara a busca 500ms após o usuário parar de digitar
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 500);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["mdex-search", debounced],
    queryFn:  () => searchMdex(debounced),
    enabled:  debounced.length >= 2,
    staleTime: 1000 * 60 * 2,
  });

  const results: MdexManga[] = data?.mangas ?? [];
  const searching = isLoading || isFetching;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0D0D0F" }}>

      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ color: "#E8E8F0", fontSize: 22, fontWeight: "900", letterSpacing: 1, marginBottom: 14 }}>
          🔍 Buscar
        </Text>

        {/* Campo de busca */}
        <View style={{
          flexDirection: "row", alignItems: "center",
          backgroundColor: "#14141A", borderRadius: 12,
          borderWidth: 1, borderColor: debounced.length >= 2 ? "#E040FB55" : "#1A1A24",
          paddingHorizontal: 14,
        }}>
          <Text style={{ color: "#4B5563", fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Título do mangá..."
            placeholderTextColor="#4B5563"
            returnKeyType="search"
            style={{ flex: 1, color: "#E5E7EB", paddingVertical: 13, fontSize: 15 }}
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(""); setDebounced(""); }}>
              <Text style={{ color: "#6B7280", fontSize: 18, paddingLeft: 8 }}>✕</Text>
            </Pressable>
          )}
        </View>

        {debounced.length === 1 && (
          <Text style={{ color: "#4B5563", fontSize: 12, marginTop: 6 }}>
            Digite mais 1 caractere para buscar…
          </Text>
        )}
      </View>

      {/* Estado vazio */}
      {debounced.length < 2 && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingBottom: 80 }}>
          <Text style={{ fontSize: 48 }}>📚</Text>
          <Text style={{ color: "#6B7280", fontSize: 15, textAlign: "center" }}>
            Busque por título{"\n"}no catálogo do MangaDex
          </Text>
        </View>
      )}

      {/* Carregando */}
      {searching && debounced.length >= 2 && (
        <ActivityIndicator color="#E040FB" style={{ marginTop: 40 }} />
      )}

      {/* Sem resultados */}
      {!searching && debounced.length >= 2 && results.length === 0 && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingBottom: 80 }}>
          <Text style={{ fontSize: 40 }}>🔎</Text>
          <Text style={{ color: "#6B7280", fontSize: 15 }}>
            Nenhum resultado para "{debounced}"
          </Text>
        </View>
      )}

      {/* Resultados */}
      {!searching && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ListHeaderComponent={
            <Text style={{ color: "#6B7280", fontSize: 12, marginBottom: 12 }}>
              {results.length} resultado{results.length !== 1 ? "s" : ""} para "{debounced}"
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: "/manga/[id]", params: { id: item.id } })}
              style={{
                flexDirection: "row", alignItems: "center",
                backgroundColor: "#14141A", borderRadius: 12,
                borderWidth: 1, borderColor: "#1A1A24",
                padding: 12, marginBottom: 10, gap: 14,
              }}
            >
              {/* Capa */}
              <Image
                source={item.cover_url ? { uri: item.cover_url } : undefined}
                style={{ width: 52, height: 74, borderRadius: 6 }}
                contentFit="cover"
              />

              {/* Info */}
              <View style={{ flex: 1, gap: 4 }}>
                <Text numberOfLines={2} style={{ color: "#E5E7EB", fontSize: 14, fontWeight: "700", lineHeight: 20 }}>
                  {item.title}
                </Text>
                {item.author && (
                  <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{item.author}</Text>
                )}
                <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                  {item.status && (
                    <View style={{ backgroundColor: "#1A1A24", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ color: "#6B7280", fontSize: 10 }}>{item.status}</Text>
                    </View>
                  )}
                  {item.tags?.slice(0, 2).map((tag) => (
                    <View key={tag} style={{ backgroundColor: "#E040FB11", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ color: "#E040FB", fontSize: 10 }}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={{ color: "#2A2A35", fontSize: 20 }}>›</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
