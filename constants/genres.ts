export interface GenreStyle {
  emoji: string;
  backgroundColor: string;
  borderColor: string;
  accentColor: string;
}

/**
 * Mapeamento visual dos gêneros MangaDex → estilo do card.
 * As cores seguem o tema escuro do design (print de referência).
 */
export const GENRE_MAP: Record<string, GenreStyle> = {
  Action: {
    emoji: "⚔️",
    backgroundColor: "#1E0808",
    borderColor: "#5C1A1A",
    accentColor: "#EF4444",
  },
  Adventure: {
    emoji: "🗺️",
    backgroundColor: "#08101E",
    borderColor: "#1A3A6B",
    accentColor: "#3B82F6",
  },
  "Boys' Love": {
    emoji: "💙",
    backgroundColor: "#081A1E",
    borderColor: "#1A5564",
    accentColor: "#06B6D4",
  },
  Comedy: {
    emoji: "😂",
    backgroundColor: "#1E1208",
    borderColor: "#6B3D0A",
    accentColor: "#F59E0B",
  },
  Crime: {
    emoji: "🦹",
    backgroundColor: "#160808",
    borderColor: "#4A1010",
    accentColor: "#DC2626",
  },
  Drama: {
    emoji: "🎭",
    backgroundColor: "#1A0812",
    borderColor: "#5C1A36",
    accentColor: "#EC4899",
  },
  Fantasy: {
    emoji: "🧙",
    backgroundColor: "#100818",
    borderColor: "#3D1A6B",
    accentColor: "#8B5CF6",
  },
  "Girls' Love": {
    emoji: "💜",
    backgroundColor: "#180818",
    borderColor: "#5C1A5C",
    accentColor: "#A855F7",
  },
  Historical: {
    emoji: "📜",
    backgroundColor: "#1A1208",
    borderColor: "#5C3D0A",
    accentColor: "#D97706",
  },
  Horror: {
    emoji: "👻",
    backgroundColor: "#080808",
    borderColor: "#1F1F1F",
    accentColor: "#6B7280",
  },
  Isekai: {
    emoji: "🌀",
    backgroundColor: "#081418",
    borderColor: "#1A4A55",
    accentColor: "#0891B2",
  },
  "Magical Girls": {
    emoji: "✨",
    backgroundColor: "#120818",
    borderColor: "#501A6B",
    accentColor: "#C026D3",
  },
  Mecha: {
    emoji: "🤖",
    backgroundColor: "#080810",
    borderColor: "#1A1A3A",
    accentColor: "#6366F1",
  },
  Medical: {
    emoji: "🏥",
    backgroundColor: "#08180E",
    borderColor: "#1A5528",
    accentColor: "#16A34A",
  },
  Mystery: {
    emoji: "🔍",
    backgroundColor: "#08080E",
    borderColor: "#1A1A3D",
    accentColor: "#4F46E5",
  },
  Philosophical: {
    emoji: "💭",
    backgroundColor: "#100818",
    borderColor: "#3D1A4A",
    accentColor: "#9333EA",
  },
  Psychological: {
    emoji: "🧠",
    backgroundColor: "#180812",
    borderColor: "#5C1A3D",
    accentColor: "#DB2777",
  },
  Romance: {
    emoji: "💗",
    backgroundColor: "#081818",
    borderColor: "#1A4A4A",
    accentColor: "#0D9488",
  },
  "Sci-Fi": {
    emoji: "🚀",
    backgroundColor: "#080E18",
    borderColor: "#1A2A5C",
    accentColor: "#2563EB",
  },
  "Slice of Life": {
    emoji: "🌸",
    backgroundColor: "#18080E",
    borderColor: "#5C1A30",
    accentColor: "#F43F5E",
  },
  Sports: {
    emoji: "⚽",
    backgroundColor: "#081A0A",
    borderColor: "#1A5C20",
    accentColor: "#22C55E",
  },
  Supernatural: {
    emoji: "👁️",
    backgroundColor: "#100E08",
    borderColor: "#3A3010",
    accentColor: "#CA8A04",
  },
  Thriller: {
    emoji: "😨",
    backgroundColor: "#140808",
    borderColor: "#4A1414",
    accentColor: "#B91C1C",
  },
  // Fallback para gêneros não mapeados
  default: {
    emoji: "📚",
    backgroundColor: "#0D0D14",
    borderColor: "#1A1A2E",
    accentColor: "#E040FB",
  },
};
