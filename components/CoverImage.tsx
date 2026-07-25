import { useEffect, useState } from "react";
import { View, Text, StyleProp, ViewStyle, ImageStyle } from "react-native";
import { Image, ImageContentFit } from "expo-image";

const MAX_ATTEMPTS = 2;

/** Capa de mangá com retry automático em caso de falha de rede/CDN
 * (mesmo padrão usado no leitor de capítulos para páginas — ver
 * PageImage em app/chapter/[id].tsx). Depois de esgotar as tentativas,
 * mostra um fallback visual em vez de deixar o espaço em branco. */
export function CoverImage({
  uri,
  style,
  contentFit = "cover",
}: {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
}) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [uri]);

  if (!uri || failed) {
    return (
      <View
        style={[
          style as StyleProp<ViewStyle>,
          { backgroundColor: "#1A1A24", alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text style={{ fontSize: 22 }}>📖</Text>
      </View>
    );
  }

  const finalUri = attempt === 0 ? uri : `${uri}${uri.includes("?") ? "&" : "?"}retry=${attempt}`;

  return (
    <Image
      source={{ uri: finalUri }}
      style={style}
      contentFit={contentFit}
      transition={200}
      onError={() => {
        if (attempt + 1 >= MAX_ATTEMPTS) {
          setFailed(true);
        } else {
          setAttempt((a) => a + 1);
        }
      }}
    />
  );
}
