import { View, Text, ScrollView, Pressable, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";

const C = {
  bg: "#F7F3ED",
  card: "#FFFFFF",
  pink: "#E8186D",
  pinkBg: "#FDEEF5",
  pinkBorder: "#F0C8DC",
  text: "#1A1A1A",
  sub: "#9CA3AF",
  border: "#E8E3DB",
  darkCard: "#1A1A1A",
  darkText: "#FFFFFF",
};

const PLANS = [
  { id: "mensal",    label: "Mensal",    price: "14,90", period: "/mês",  note: null,            tag: null,             popular: false },
  { id: "anual",     label: "Anual",     price: "9,90",  period: "/mês",  note: "economize 33%", tag: "mais escolhido", popular: true  },
  { id: "vitalicio", label: "Vitalício", price: "299",   period: "",      note: "pague uma vez", tag: null,             popular: false },
];

const PIX_KEY = "mangaverse@pix.com.br";

export default function PlansScreen() {
  const [selected, setSelected] = useState("anual");
  const [showPix, setShowPix] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    Share.share({ message: PIX_KEY });
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Cabeçalho */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 }}>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 }}>
              <Text style={{ fontSize: 12, color: C.pink }}>👑</Text>
              <Text style={{ fontSize: 11, color: C.pink, letterSpacing: 2, textTransform: "uppercase" }}>assinatura</Text>
            </View>
            <Text style={{ fontSize: 32, fontWeight: "900", fontStyle: "italic", color: C.pink, textDecorationLine: "underline" }}>
              seja VIP
            </Text>
          </View>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 14, color: C.sub }}>←</Text>
            <Text style={{ fontSize: 13, color: C.sub }}>voltar</Text>
          </Pressable>
        </View>

        {/* Grid de benefícios */}
        <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 28 }}>

          {/* Card principal */}
          <View style={{ flex: 1.1, backgroundColor: C.darkCard, borderRadius: 16, padding: 16, overflow: "hidden" }}>
            <View style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
              {Array.from({ length: 15 }).map((_, i) => (
                <View key={i} style={{ position: "absolute", top: -80 + i * 20, left: -200, right: -200, height: 10, backgroundColor: C.pink, transform: [{ rotate: "-45deg" }] }} />
              ))}
            </View>
            <Text style={{ fontSize: 10, color: C.pink, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
              VIP INCLUI
            </Text>
            <Text style={{ fontSize: 22, fontWeight: "900", color: C.darkText, lineHeight: 28, marginBottom: 14 }}>
              sem anúncios.{"\n"}tudo offline.{"\n"}capítulos antes.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {["HD", "offline", "sem ads", "7 dias antes"].map((tag) => (
                <View key={tag} style={{ borderWidth: 1, borderColor: C.pink, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 10, color: C.pink, fontWeight: "600" }}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Coluna direita */}
          <View style={{ flex: 0.9, gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: C.pinkBg, borderWidth: 1, borderColor: C.pinkBorder, borderRadius: 14, padding: 12 }}>
              <Text style={{ fontSize: 11, color: C.pink, fontWeight: "700", marginBottom: 6 }}>👑 borda VIP</Text>
              <Text style={{ fontSize: 12, color: C.sub, lineHeight: 16 }}>anel rosa exclusivo no seu avatar</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12 }}>
              <Text style={{ fontSize: 11, color: C.text, fontWeight: "700", marginBottom: 6 }}>🏆 +2x xp</Text>
              <Text style={{ fontSize: 12, color: C.sub, lineHeight: 16 }}>desbloqueie badges 2x mais rápido</Text>
            </View>
          </View>

        </View>

        {/* Planos */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: "900", fontStyle: "italic", color: C.text, marginBottom: 4 }}>
            escolha seu plano
          </Text>
          <Text style={{ fontSize: 13, color: C.sub, marginBottom: 16 }}>cancele quando quiser</Text>

          <View style={{ gap: 10, marginBottom: 24 }}>
            {PLANS.map((plan) => {
              const active = selected === plan.id;
              return (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelected(plan.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: active ? C.pink : C.border,
                    backgroundColor: active && plan.popular ? C.pinkBg : C.card,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    {/* Radio */}
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: active ? C.pink : C.border,
                        backgroundColor: active ? C.pink : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {active && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#fff" }} />}
                    </View>

                    <View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <Text style={{ fontSize: 16, fontWeight: "800", color: C.text }}>{plan.label}</Text>
                        {plan.tag && (
                          <View style={{ backgroundColor: C.pink, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 }}>
                            <Text style={{ fontSize: 9, color: "#fff", fontWeight: "700" }}>{plan.tag}</Text>
                          </View>
                        )}
                      </View>
                      {plan.note && (
                        <Text style={{ fontSize: 11, color: plan.popular ? C.pink : C.sub, marginTop: 1 }}>
                          {plan.note}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: active && plan.popular ? C.pink : C.text, paddingTop: 4 }}>R$</Text>
                    <Text style={{ fontSize: 28, fontWeight: "900", color: active && plan.popular ? C.pink : C.text, lineHeight: 32 }}>
                      {plan.price}
                    </Text>
                    {plan.period ? (
                      <Text style={{ fontSize: 11, color: C.sub, alignSelf: "flex-end", paddingBottom: 2 }}>{plan.period}</Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Botão assinar */}
          <Pressable
            onPress={() => setShowPix(true)}
            style={{ backgroundColor: C.pink, borderRadius: 14, padding: 18, alignItems: "center", marginBottom: 8 }}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>👑 Assinar agora</Text>
          </Pressable>
          <Text style={{ textAlign: "center", fontSize: 12, color: C.sub, marginBottom: 32 }}>
            Pagamento via PIX ou QR Code
          </Text>
        </View>

      </ScrollView>

      {/* Modal PIX */}
      {showPix && (
        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 24, width: "100%", maxWidth: 380 }}>
            <Pressable onPress={() => setShowPix(false)} style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28, borderRadius: 14, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 12, color: C.sub, fontWeight: "700" }}>✕</Text>
            </Pressable>

            <Text style={{ fontSize: 22, fontWeight: "900", fontStyle: "italic", color: C.pink, marginBottom: 4 }}>
              pagamento via PIX
            </Text>
            <Text style={{ fontSize: 12, color: C.sub, marginBottom: 20 }}>
              escaneie o QR Code ou copie a chave
            </Text>

            {/* Placeholder QR */}
            <View style={{ borderWidth: 1.5, borderColor: C.border, borderStyle: "dashed", borderRadius: 14, padding: 32, alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 48 }}>▦</Text>
              <Text style={{ fontSize: 11, color: C.sub, marginTop: 8, textAlign: "center" }}>
                QR Code gerado após confirmação
              </Text>
            </View>

            {/* Chave PIX */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 }}>
              <Text style={{ fontSize: 13, color: C.text, fontFamily: "monospace", flex: 1 }}>{PIX_KEY}</Text>
              <Pressable
                onPress={handleCopy}
                style={{ borderWidth: 1, borderColor: C.pink, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}
              >
                <Text style={{ fontSize: 11, color: C.pink, fontWeight: "700" }}>
                  {copied ? "copiado ✓" : "copiar"}
                </Text>
              </Pressable>
            </View>

            <Text style={{ textAlign: "center", fontSize: 11, color: C.sub }}>
              Após o pagamento, seu VIP é ativado em até 5 minutos.
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
