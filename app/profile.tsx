import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useUserAuth } from "@/context/UserAuthContext";

const C = {
  bg: "#F7F3ED", card: "#FFFFFF", pink: "#E8186D",
  pinkBg: "#FDEEF5", pinkBorder: "#F0C8DC",
  text: "#1A1A1A", sub: "#9CA3AF", border: "#E8E3DB",
  darkCard: "#1A1A1A", darkText: "#FFFFFF",
};

function XpBar({ current, needed }: { current: number; needed: number }) {
  const pct = Math.min((current / needed) * 100, 100);
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "rgba(0,0,0,0.25)", marginTop: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>nv. {Math.floor(current / needed) + 1}</Text>
        <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          {current.toLocaleString("pt-BR")} / {needed.toLocaleString("pt-BR")}
        </Text>
        <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>nv. {Math.floor(current / needed) + 2}</Text>
      </View>
      <View style={{ height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
        <View style={{ width: `${pct}%`, height: "100%", backgroundColor: C.pink, borderRadius: 3 }} />
      </View>
      <Text style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4, letterSpacing: 2 }}>XP</Text>
    </View>
  );
}

function GuestView() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center", padding: 32 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>👤</Text>
      <Text style={{ fontSize: 24, fontWeight: "900", fontStyle: "italic", color: C.text, marginBottom: 8 }}>
        Sem conta
      </Text>
      <Text style={{ fontSize: 14, color: C.sub, textAlign: "center", marginBottom: 28, lineHeight: 22 }}>
        Crie uma conta para acompanhar seus mangás, ganhar XP e desbloquear badges.
      </Text>
      <Pressable
        onPress={() => router.push("/login")}
        style={{ backgroundColor: C.pink, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 16, width: "100%" }}
      >
        <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16, textAlign: "center" }}>Entrar / Cadastrar</Text>
      </Pressable>
      <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} style={{ marginTop: 16 }}>
        <Text style={{ color: C.sub, fontSize: 13 }}>← Voltar</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default function ProfileScreen() {
  const { user, isLoggedIn, logout } = useUserAuth();

  if (!isLoggedIn || !user) return <GuestView />;

  const stats = {
    favoritos:      0,
    concluidos:     0,
    concluidosMes:  0,
    paginas:        0,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Cabeçalho */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 11, color: C.sub, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>perfil</Text>
            <Text style={{ fontSize: 28, fontWeight: "900", fontStyle: "italic", color: C.text, textDecorationLine: "underline" }}>
              minha conta
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 16 }}>
            <Pressable
              onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Text style={{ fontSize: 14, color: C.sub }}>←</Text>
              <Text style={{ fontSize: 13, color: C.sub }}>voltar</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/plans")} style={{ alignItems: "center", gap: 2 }}>
              <Text style={{ fontSize: 20 }}>⚙️</Text>
              <Text style={{ fontSize: 10, color: C.sub }}>ajustes</Text>
            </Pressable>
          </View>
        </View>

        {/* Card do usuário */}
        <View style={{ marginHorizontal: 16, borderRadius: 16, backgroundColor: C.darkCard, overflow: "hidden", marginBottom: 24 }}>
          <View style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={{ position: "absolute", top: -100 + i * 20, left: -200, right: -200, height: 10, backgroundColor: "#fff", transform: [{ rotate: "-45deg" }] }} />
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 14, padding: 16, alignItems: "flex-start" }}>
            {/* Avatar */}
            <View style={{ position: "relative" }}>
              <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: user.avatar_color + "33", borderWidth: 2, borderColor: user.avatar_color + "66", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 32, fontWeight: "900", color: user.avatar_color }}>{user.initials}</Text>
              </View>
              {user.vip && (
                <View style={{ position: "absolute", inset: -5, borderRadius: 44, borderWidth: 2, borderColor: C.pink, borderStyle: "dashed" }} />
              )}
              {user.vip && (
                <View style={{ position: "absolute", top: -10, left: "50%", transform: [{ translateX: -20 }], backgroundColor: C.pink, borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2, flexDirection: "row", alignItems: "center", gap: 3 }}>
                  <Text style={{ fontSize: 9, color: "#fff" }}>👑</Text>
                  <Text style={{ fontSize: 9, color: "#fff", fontWeight: "800", letterSpacing: 1 }}>VIP</Text>
                </View>
              )}
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>{user.username}</Text>
              <Text style={{ fontSize: 22, fontWeight: "900", color: C.darkText, letterSpacing: 0.5, marginBottom: 2 }}>{user.name}</Text>
              {user.vip && (
                <Text style={{ fontSize: 11, color: C.pink, fontStyle: "italic", marginBottom: 10 }}>
                  membro VIP · desde {user.member_since}
                </Text>
              )}
              {!user.vip && (
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
                  membro desde {user.member_since}
                </Text>
              )}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignItems: "center" }}>
                  <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>nível</Text>
                  <Text style={{ fontSize: 16, fontWeight: "900", color: C.darkText }}>{user.level}</Text>
                </View>
                <View style={{ borderWidth: 1, borderColor: user.avatar_color, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 12, color: user.avatar_color }}>★</Text>
                  <Text style={{ fontSize: 12, color: user.avatar_color, fontWeight: "700" }}>
                    {user.level < 5 ? "iniciante" : user.level < 10 ? "leitor" : "collector"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <XpBar current={user.xp} needed={user.xp_needed} />
        </View>

        {/* Estatísticas */}
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 22 }}>📊</Text>
              <Text style={{ fontSize: 20, fontWeight: "900", fontStyle: "italic", color: C.text }}>estatísticas</Text>
            </View>
            <Pressable>
              <Text style={{ fontSize: 12, color: C.sub }}>histórico completo</Text>
            </Pressable>
          </View>
          <Text style={{ fontSize: 12, color: C.sub, marginBottom: 16 }}>continue avançando esses indicadores</Text>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            {/* Favoritos */}
            <View style={{ flex: 1, backgroundColor: C.pinkBg, borderWidth: 1, borderColor: C.pinkBorder, borderRadius: 14, padding: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
                <Text style={{ fontSize: 11, color: C.pink }}>♡</Text>
                <Text style={{ fontSize: 10, fontWeight: "700", letterSpacing: 1, color: C.sub, flex: 1 }}>FAVORITOS</Text>
                <Text style={{ fontSize: 14, color: "rgba(232,24,109,0.3)" }}>♡</Text>
              </View>
              <Text style={{ fontSize: 46, fontWeight: "900", color: C.pink, lineHeight: 50 }}>{stats.favoritos}</Text>
              <Text style={{ fontSize: 11, color: C.sub }}>mangás na sua lista</Text>
            </View>

            {/* Concluídos */}
            <View style={{ flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
                <Text style={{ fontSize: 11, color: C.sub }}>✓</Text>
                <Text style={{ fontSize: 10, fontWeight: "700", letterSpacing: 1, color: C.sub }}>CONCLUÍDOS</Text>
              </View>
              <Text style={{ fontSize: 46, fontWeight: "900", color: C.text, lineHeight: 50 }}>{stats.concluidos}</Text>
              <Text style={{ fontSize: 11, color: C.sub }}>séries terminadas</Text>
            </View>
          </View>

          {/* Páginas */}
          <View style={{ backgroundColor: C.darkCard, borderRadius: 14, padding: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
              <Text style={{ fontSize: 12 }}>📖</Text>
              <Text style={{ fontSize: 10, fontWeight: "700", letterSpacing: 1, color: "rgba(255,255,255,0.4)" }}>PÁGINAS</Text>
            </View>
            <Text style={{ fontSize: 46, fontWeight: "900", color: C.darkText, lineHeight: 50 }}>
              {stats.paginas.toLocaleString("pt-BR")}
            </Text>
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>lidas no total</Text>
            <Text style={{ fontSize: 11, color: C.pink, fontStyle: "italic" }}>
              ≈ {Math.round(stats.paginas / 450)} vols. físicos
            </Text>
          </View>
        </View>

        {/* CTA VIP */}
        {!user.vip && (
          <View style={{ margin: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.border }}>
            <Pressable
              onPress={() => router.push("/plans")}
              style={{ backgroundColor: C.pink, borderRadius: 12, padding: 16, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>👑 Seja VIP</Text>
            </Pressable>
          </View>
        )}

        {/* Logout */}
        <View style={{ marginHorizontal: 16, marginBottom: 32 }}>
          <Pressable
            onPress={logout}
            style={{ borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, alignItems: "center" }}
          >
            <Text style={{ color: C.sub, fontSize: 14 }}>Sair da conta</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
