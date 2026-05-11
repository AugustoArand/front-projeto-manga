import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { getExplore } from "@/services/api";

const { width: W } = Dimensions.get("window");
const PAD = 16;
const GAP = 12;
const HERO_LEFT_W = (W - PAD * 2) * 0.56;
const HERO_RIGHT_W = W - PAD * 2 - HERO_LEFT_W - GAP;
const HERO_H = HERO_LEFT_W * 1.48;
const LATEST_CARD_W = (W - PAD * 2) * 0.38;

const C = {
  bg: "#F7F3ED",
  card: "#FFFFFF",
  pink: "#E8186D",
  pinkBg: "#FDEEF5",
  pinkBar: "#F0D0E0",
  text: "#1A1A1A",
  sub: "#9CA3AF",
  border: "#E8E3DB",
  darkCard: "#22201E",
};

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "bom dia";
  if (h < 18) return "boa tarde";
  return "boa noite";
}

// ── Header ────────────────────────────────────────────────────────────────────

function Header() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: PAD,
        paddingTop: 6,
        paddingBottom: 14,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 42,
            height: 42,
            backgroundColor: C.pink,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: C.text,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "900" }}>M</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: "800", fontStyle: "italic", color: C.text }}>
          Mangaverse
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pressable
          onPress={() => router.push("/profile")}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: C.border,
            backgroundColor: C.card,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 17 }}>👤</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/plans")}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: C.pink,
            backgroundColor: C.pinkBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 17 }}>👑</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(tabs)/search")}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: C.border,
            backgroundColor: C.card,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 17 }}>🔍</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Saudação ──────────────────────────────────────────────────────────────────

function Greeting({ count }: { count: number }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 4,
        paddingHorizontal: PAD,
        marginBottom: 20,
      }}
    >
      <Text style={{ color: C.sub, fontSize: 14 }}>{timeGreeting()}, kira —</Text>
      <Text style={{ color: C.pink, fontSize: 14, fontWeight: "600" }}>
        {count} capítulos novos
      </Text>
      <Text style={{ color: C.pink, fontSize: 12 }}>♦</Text>
    </View>
  );
}

// ── Seção hero (2 colunas) ────────────────────────────────────────────────────

function HeroSection({
  popular,
  history,
  latest,
}: {
  popular: any[];
  history: any[];
  latest: any[];
}) {
  const featured = popular[0];
  const continueItem = history[0];
  const newToday = latest[0];

  return (
    <View style={{ paddingHorizontal: PAD, marginBottom: 28 }}>
      <View style={{ flexDirection: "row", gap: GAP }}>
        {/* ── Destaque principal ── */}
        <Pressable
          onPress={() =>
            featured &&
            router.push({ pathname: "/manga/[id]", params: { id: featured.id } })
          }
          style={{
            width: HERO_LEFT_W,
            height: HERO_H,
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: C.darkCard,
          }}
        >
          <Image
            source={{ uri: featured?.cover_url ?? undefined }}
            style={{ position: "absolute", width: "100%", height: "100%" }}
            contentFit="cover"
            transition={400}
          />
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.42)",
            }}
          />
          <View style={{ flex: 1, padding: 14, justifyContent: "space-between" }}>
            <Text
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 10,
                fontWeight: "800",
                letterSpacing: 1.5,
              }}
            >
              EM ALTA #1
            </Text>
            <View>
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 21,
                  fontWeight: "900",
                  fontStyle: "italic",
                  lineHeight: 25,
                  marginBottom: 10,
                }}
                numberOfLines={3}
              >
                {featured?.title ?? "—"}
              </Text>
              {featured?.tags && featured.tags.length > 0 && (
                <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
                  {featured.tags.slice(0, 2).map((tag: string) => (
                    <View
                      key={tag}
                      style={{
                        backgroundColor: "rgba(0,0,0,0.72)",
                        paddingHorizontal: 9,
                        paddingVertical: 3,
                        borderRadius: 20,
                      }}
                    >
                      <Text style={{ color: "#FFF", fontSize: 10 }}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={{ color: "rgba(255,255,255,0.72)", fontSize: 11 }}>
                ↑ 2.8k esta semana
              </Text>
            </View>
          </View>
        </Pressable>

        {/* ── Coluna direita ── */}
        <View style={{ width: HERO_RIGHT_W, gap: GAP }}>
          {/* Continue lendo */}
          <Pressable
            onPress={() =>
              continueItem &&
              router.push({
                pathname: "/manga/[id]",
                params: { id: continueItem.mangadex_id ?? String(continueItem.manga_id) },
              })
            }
            style={{
              flex: 1,
              backgroundColor: C.pinkBg,
              borderRadius: 14,
              padding: 13,
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: C.pink,
                fontSize: 9,
                fontWeight: "900",
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              Continue
            </Text>
            <View>
              <Text
                numberOfLines={2}
                style={{
                  color: C.text,
                  fontSize: 14,
                  fontWeight: "800",
                  lineHeight: 18,
                  marginBottom: 5,
                }}
              >
                {continueItem?.title ?? "Nenhuma leitura"}
              </Text>
              <Text style={{ color: C.sub, fontSize: 10, marginBottom: 8 }}>
                cap. — · —%
              </Text>
              <View
                style={{ height: 4, backgroundColor: C.pinkBar, borderRadius: 2 }}
              >
                <View
                  style={{
                    height: 4,
                    backgroundColor: C.pink,
                    borderRadius: 2,
                    width: "62%",
                  }}
                />
              </View>
            </View>
          </Pressable>

          {/* Novo hoje */}
          <Pressable
            onPress={() =>
              newToday?.manga_id &&
              router.push({ pathname: "/manga/[id]", params: { id: newToday.manga_id } })
            }
            style={{
              flex: 1,
              backgroundColor: C.card,
              borderRadius: 14,
              padding: 13,
              borderWidth: 1,
              borderColor: C.border,
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: C.sub,
                fontSize: 9,
                fontWeight: "800",
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              Novo hoje
            </Text>
            <View>
              <Text
                numberOfLines={1}
                style={{ color: C.text, fontSize: 14, fontWeight: "800", marginBottom: 4 }}
              >
                {newToday?.manga_title ?? "—"}
              </Text>
              <Text numberOfLines={2} style={{ color: C.sub, fontSize: 11, marginBottom: 8 }}>
                cap. {newToday?.chapter ?? "—"}
                {newToday?.title ? ` - ${newToday.title}` : ""}
              </Text>
              <Text style={{ color: C.pink, fontSize: 12, fontWeight: "600" }}>
                ler agora →
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({
  emoji,
  title,
  onSeeAll,
}: {
  emoji: string;
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingHorizontal: PAD,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6, flex: 1 }}>
        <Text style={{ fontSize: 22, lineHeight: 28 }}>{emoji}</Text>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "900",
            fontStyle: "italic",
            color: C.text,
            lineHeight: 30,
            flex: 1,
          }}
        >
          {title}
        </Text>
      </View>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} style={{ alignItems: "flex-end" }}>
          <Text style={{ color: C.sub, fontSize: 12, lineHeight: 16 }}>ver tudo</Text>
          <Text style={{ color: C.sub, fontSize: 12 }}>→</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Card de lançamento ─────────────────────────────────────────────────────────

function LatestCard({ item, index }: { item: any; index: number }) {
  return (
    <Pressable
      onPress={() =>
        item.manga_id &&
        router.push({ pathname: "/manga/[id]", params: { id: item.manga_id } })
      }
      style={{ width: LATEST_CARD_W, marginRight: GAP }}
    >
      <View
        style={{
          width: LATEST_CARD_W,
          height: LATEST_CARD_W * 1.42,
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: "#E8E3DB",
          borderWidth: 1,
          borderColor: C.border,
          marginBottom: 8,
        }}
      >
        <Image
          source={{ uri: item.cover_url ?? undefined }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={200}
        />
        <View
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            backgroundColor: "rgba(0,0,0,0.55)",
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "800" }}>
            #{index + 1}
          </Text>
        </View>
      </View>
      <Text
        numberOfLines={1}
        style={{ color: C.text, fontSize: 13, fontWeight: "700" }}
      >
        {item.manga_title ?? "—"}
      </Text>
      <Text style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>
        cap. {item.chapter ?? "—"}
      </Text>
    </Pressable>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["explore"],
    queryFn: getExplore,
  });

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={C.pink} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ color: C.sub }}>Erro ao conectar com a API</Text>
      </SafeAreaView>
    );
  }

  const popular: any[] = data?.popular ?? [];
  const latest: any[] = data?.latest ?? [];
  const history: any[] = data?.history ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Header />
        <Greeting count={latest.length} />

        <HeroSection popular={popular} history={history} latest={latest} />

        {/* Últimos Lançamentos */}
        <View style={{ marginBottom: 28 }}>
          <SectionHeader
            emoji="🔥"
            title={"Últimos\nlançamentos"}
            onSeeAll={() => {}}
          />
          <FlatList
            horizontal
            data={latest.slice(0, 10)}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <LatestCard item={item} index={index} />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: PAD }}
          />
        </View>

        {/* Categorias teaser */}
        <View style={{ marginBottom: 8 }}>
          <SectionHeader
            emoji="📁"
            title="Categorias"
            onSeeAll={() => router.push("/(tabs)/categories")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
