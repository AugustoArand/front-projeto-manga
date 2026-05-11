import { useState } from "react";
import {
  View, Text, TextInput, Pressable,
  KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useUserAuth } from "@/context/UserAuthContext";

const C = {
  bg: "#F7F3ED", card: "#FFFFFF", pink: "#E8186D",
  pinkBg: "#FDEEF5", pinkBorder: "#F0C8DC",
  text: "#1A1A1A", sub: "#9CA3AF", border: "#E8E3DB",
};

type Tab = "login" | "register";

const AVATAR_COLORS = [
  "#E8186D", "#7C3AED", "#2563EB", "#059669",
  "#D97706", "#DC2626", "#0891B2", "#65A30D",
];

function Field({
  label, value, onChangeText, placeholder, secure = false,
  autoCapitalize = "none", keyboardType = "default" as any,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; secure?: boolean;
  autoCapitalize?: "none" | "sentences" | "words";
  keyboardType?: any;
}) {
  return (
    <View>
      <Text style={{ fontSize: 11, fontWeight: "700", color: C.sub, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.sub}
        secureTextEntry={secure}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        autoCorrect={false}
        style={{
          backgroundColor: C.card,
          borderWidth: 1.5, borderColor: C.border,
          borderRadius: 12,
          paddingHorizontal: 16, paddingVertical: 13,
          fontSize: 15, color: C.text,
        }}
      />
    </View>
  );
}

export default function LoginScreen() {
  const { login, register } = useUserAuth();
  const [tab, setTab] = useState<Tab>("login");

  // Login fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");

  // Register fields
  const [name, setName]               = useState("");
  const [username, setUsername]       = useState("");
  const [email, setEmail]             = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm]   = useState("");
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<string[]>([]);

  function clearErrors() { setErrors([]); }

  async function handleLogin() {
    clearErrors();
    if (!identifier.trim() || !password) {
      setErrors(["Preencha e-mail/usuário e senha."]); return;
    }
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? e.message ?? "Erro ao entrar.";
      setErrors([msg]);
    } finally { setLoading(false); }
  }

  async function handleRegister() {
    clearErrors();
    const errs: string[] = [];
    if (!name.trim())       errs.push("Nome é obrigatório.");
    if (!username.trim())   errs.push("Usuário é obrigatório.");
    if (!email.trim())      errs.push("E-mail é obrigatório.");
    if (regPassword.length < 6) errs.push("Senha deve ter pelo menos 6 caracteres.");
    if (regPassword !== regConfirm) errs.push("As senhas não coincidem.");
    if (errs.length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register(name.trim(), username.trim(), email.trim(), regPassword, regConfirm);
      router.replace("/(tabs)");
    } catch (e: any) {
      const msgs = e?.response?.data?.errors ?? [e?.response?.data?.error ?? e.message ?? "Erro ao cadastrar."];
      setErrors(Array.isArray(msgs) ? msgs : [msgs]);
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={{ alignItems: "center", paddingTop: 40, paddingBottom: 28 }}>
            <View style={{
              width: 68, height: 68, backgroundColor: C.pink,
              borderRadius: 20, borderWidth: 3, borderColor: C.text,
              alignItems: "center", justifyContent: "center", marginBottom: 14,
            }}>
              <Text style={{ color: "#fff", fontSize: 32, fontWeight: "900" }}>M</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: "900", fontStyle: "italic", color: C.text }}>MangaVerse</Text>
            <Text style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>Sua plataforma de mangás</Text>
          </View>

          {/* Abas */}
          <View style={{ flexDirection: "row", marginHorizontal: 24, marginBottom: 28, backgroundColor: C.card, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: C.border }}>
            {(["login", "register"] as Tab[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => { setTab(t); clearErrors(); }}
                style={{
                  flex: 1, paddingVertical: 11, borderRadius: 11,
                  alignItems: "center",
                  backgroundColor: tab === t ? C.pink : "transparent",
                }}
              >
                <Text style={{ fontWeight: "800", fontSize: 14, color: tab === t ? "#fff" : C.sub }}>
                  {t === "login" ? "Entrar" : "Cadastrar"}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ paddingHorizontal: 24, gap: 14 }}>

            {/* ── Formulário de Login ── */}
            {tab === "login" && (
              <>
                <Field
                  label="E-mail ou usuário"
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="seu@email.com ou usuario"
                />
                <Field
                  label="Senha"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secure
                />
              </>
            )}

            {/* ── Formulário de Cadastro ── */}
            {tab === "register" && (
              <>
                <Field
                  label="Nome completo"
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu Nome"
                  autoCapitalize="words"
                />
                <Field
                  label="Nome de usuário"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="seu_usuario"
                />
                <Field
                  label="E-mail"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                />
                <Field
                  label="Senha"
                  value={regPassword}
                  onChangeText={setRegPassword}
                  placeholder="Mínimo 6 caracteres"
                  secure
                />
                <Field
                  label="Confirmar senha"
                  value={regConfirm}
                  onChangeText={setRegConfirm}
                  placeholder="Repita a senha"
                  secure
                />

                {/* Cor do avatar */}
                <View>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: C.sub, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                    Cor do avatar
                  </Text>
                  <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                    {AVATAR_COLORS.map((color) => (
                      <Pressable
                        key={color}
                        onPress={() => setAvatarColor(color)}
                        style={{
                          width: 36, height: 36, borderRadius: 18,
                          backgroundColor: color,
                          borderWidth: avatarColor === color ? 3 : 0,
                          borderColor: C.text,
                          alignItems: "center", justifyContent: "center",
                        }}
                      >
                        {avatarColor === color && (
                          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>✓</Text>
                        )}
                      </Pressable>
                    ))}
                  </View>
                  {/* Preview */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 }}>
                    <View style={{
                      width: 48, height: 48, borderRadius: 24,
                      backgroundColor: avatarColor,
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900" }}>
                        {name ? name.charAt(0).toUpperCase() : "?"}
                      </Text>
                    </View>
                    <Text style={{ color: C.sub, fontSize: 13 }}>
                      {name || "Seu nome aparece aqui"}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Erros */}
            {errors.length > 0 && (
              <View style={{ backgroundColor: "#FEE2E2", borderRadius: 10, padding: 12, gap: 4 }}>
                {errors.map((e, i) => (
                  <Text key={i} style={{ color: "#DC2626", fontSize: 13 }}>• {e}</Text>
                ))}
              </View>
            )}

            {/* Botão principal */}
            <Pressable
              onPress={tab === "login" ? handleLogin : handleRegister}
              disabled={loading}
              style={{
                backgroundColor: loading ? C.pinkBorder : C.pink,
                borderRadius: 14, padding: 18,
                alignItems: "center", marginTop: 4,
              }}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
                    {tab === "login" ? "Entrar" : "Criar conta"}
                  </Text>
              }
            </Pressable>

            {/* Voltar */}
            <Pressable
              onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
              style={{ alignItems: "center", paddingVertical: 8 }}
            >
              <Text style={{ color: C.sub, fontSize: 13 }}>← Continuar sem conta</Text>
            </Pressable>

            <View style={{ height: 24 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
