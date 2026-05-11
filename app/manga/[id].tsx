import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getManga,
  getMdexManga,
  isMdexId,
  setReadingStatus,
  followManga,
  ReadingStatus,
  STATUS_LABELS,
} from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface Chapter {
  id: string | number;
  number?: number;
  chapter?: string;       // MangaDex field
  title: string | null;
  published_at?: string;
  published?: string;     // MangaDex field
}

const STATUS_OPTIONS = Object.entries(STATUS_LABELS) as [NonNullable<ReadingStatus>, string][];

export default function MangaDetailScreen() {
  const { id }             = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const queryClient        = useQueryClient();

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [currentStatus, setCurrentStatus]           = useState<ReadingStatus>(null);

  const mdex = isMdexId(id ?? "");

  const { data: manga, isLoading, isError } = useQuery({
    queryKey: ["manga", id],
    queryFn:  () => mdex ? getMdexManga(id!) : getManga(id!),
    enabled:  !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: ReadingStatus) => setReadingStatus(id!, status),
    onSuccess:  (_data, status) => {
      setCurrentStatus(status);
      setStatusModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["reading_histories"] });
    },
  });

  const followMutation = useMutation({
    mutationFn: () => followManga(id!),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0D0D0F", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#E040FB" />
      </SafeAreaView>
    );
  }

  if (isError || !manga) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0D0D0F", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#6B7280" }}>Mangá não encontrado</Text>
      </SafeAreaView>
    );
  }

  const chapters: Chapter[] = manga.chapters ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0D0D0F" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}
        >
          <Text style={{ color: "#E040FB", fontSize: 14 }}>← Voltar</Text>
        </Pressable>

        {/* Cover + Info */}
        <View style={{ flexDirection: "row", padding: 16, gap: 16 }}>
          <Image
            source={manga.cover_url ? { uri: manga.cover_url } : undefined}
            style={{ width: 130, height: 185, borderRadius: 10 }}
            contentFit="cover"
          />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "800", lineHeight: 24 }}>
              {manga.title}
            </Text>
            {manga.author && (
              <Text style={{ color: "#9CA3AF", fontSize: 13 }}>{manga.author}</Text>
            )}
            {manga.genre && (
              <View style={{ alignSelf: "flex-start", backgroundColor: "#1A1A24", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: "#E040FB44" }}>
                <Text style={{ color: "#E040FB", fontSize: 11 }}>{manga.genre}</Text>
              </View>
            )}
            {manga.status && (
              <Text style={{ color: "#6B7280", fontSize: 12 }}>{manga.status}</Text>
            )}
            {manga.rating && (
              <Text style={{ color: "#FCD34D", fontSize: 13 }}>⭐ {manga.rating}</Text>
            )}
          </View>
        </View>

        {/* ── Ações de leitura (só para autenticados) ── */}
        {isAuthenticated && (
          <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 16 }}>
            {/* Botão de status */}
            <Pressable
              onPress={() => setStatusModalVisible(true)}
              style={{
                flex: 1,
                backgroundColor: currentStatus ? "#E040FB22" : "#1A1A24",
                borderWidth: 1,
                borderColor: currentStatus ? "#E040FB" : "#2A2A35",
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: "center",
              }}
            >
              {statusMutation.isPending
                ? <ActivityIndicator size="small" color="#E040FB" />
                : <Text style={{ color: currentStatus ? "#E040FB" : "#9CA3AF", fontWeight: "700", fontSize: 13 }}>
                    {currentStatus ? `📚 ${STATUS_LABELS[currentStatus]}` : "📚 Adicionar à lista"}
                  </Text>
              }
            </Pressable>

            {/* Botão seguir */}
            <Pressable
              onPress={() => followMutation.isPending ? null : followMutation.mutate()}
              style={{
                backgroundColor: "#1A1A24",
                borderWidth: 1,
                borderColor: "#2A2A35",
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 16,
                alignItems: "center",
              }}
            >
              {followMutation.isPending
                ? <ActivityIndicator size="small" color="#E040FB" />
                : <Text style={{ color: "#9CA3AF", fontSize: 13 }}>🔔 Seguir</Text>
              }
            </Pressable>
          </View>
        )}

        {/* Description */}
        {manga.description && (
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <Text style={{ color: "#D1D5DB", fontSize: 13, lineHeight: 20 }}>
              {manga.description}
            </Text>
          </View>
        )}

        {/* Chapters */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ color: "#E040FB", fontSize: 16, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>
            Capítulos ({chapters.length})
          </Text>
          {chapters.map((ch) => (
            <Pressable
              key={ch.id}
              onPress={() => router.push({ pathname: "/chapter/[id]", params: { id: String(ch.id), mangaId: String(manga.id), source: mdex ? "mdex" : "local" } })}
              style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomColor: "#1A1A24", borderBottomWidth: 1 }}
            >
              <View>
                <Text style={{ color: "#E5E7EB", fontSize: 14 }}>
                  {(() => {
                    const n = ch.chapter ?? (ch.number != null ? String(ch.number) : "?");
                    return `Cap. ${n}${ch.title ? ` · ${ch.title}` : ""}`;
                  })()}
                </Text>
                <Text style={{ color: "#6B7280", fontSize: 11, marginTop: 2 }}>
                  {new Date(ch.published_at ?? ch.published ?? 0).toLocaleDateString("pt-BR")}
                </Text>
              </View>
              <Text style={{ color: "#4B5563" }}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* ── Modal de status de leitura ── */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}
          onPress={() => setStatusModalVisible(false)}
        >
          <View style={{ backgroundColor: "#16161A", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <Text style={{ color: "#E8E8F0", fontSize: 18, fontWeight: "800", marginBottom: 16 }}>
              Status de leitura
            </Text>

            {STATUS_OPTIONS.map(([value, label]) => (
              <Pressable
                key={value}
                onPress={() => statusMutation.mutate(value)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: "#2A2A32",
                }}
              >
                <Text style={{ color: currentStatus === value ? "#E040FB" : "#E8E8F0", fontSize: 15, fontWeight: currentStatus === value ? "700" : "400" }}>
                  {label}
                </Text>
                {currentStatus === value && <Text style={{ color: "#E040FB" }}>✓</Text>}
              </Pressable>
            ))}

            {/* Remover status */}
            {currentStatus && (
              <Pressable
                onPress={() => statusMutation.mutate(null)}
                style={{ paddingVertical: 14 }}
              >
                <Text style={{ color: "#6B7280", fontSize: 14, textAlign: "center" }}>
                  Remover da lista
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
