import axios from "axios";

const API_BASE = __DEV__
  ? "http://localhost:3000/api/v1"
  : "https://your-production-domain.com/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ── Explore ───────────────────────────────────────────────────────────────────

export const getExplore = () =>
  api.get("/explore").then((r) => r.data);

export const getCategory = (tagId: string, name: string) =>
  api.get("/explore/category", { params: { tag_id: tagId, name } }).then((r) => r.data);

// ── Mangás locais ─────────────────────────────────────────────────────────────

export const getMangas = (params?: { genre?: string; query?: string }) =>
  api.get("/mangas", { params }).then((r) => r.data);

export const getManga = (id: string) =>
  api.get(`/mangas/${id}`).then((r) => r.data);

// ── Capítulos ─────────────────────────────────────────────────────────────────

export const getChapter = (mangaId: string, chapterId: string) =>
  api.get(`/mangas/${mangaId}/chapters/${chapterId}`).then((r) => r.data);

// ── Histórico de leitura ──────────────────────────────────────────────────────

export const getHistory = () =>
  api.get("/reading_histories").then((r) => r.data);

export interface TrackHistoryPayload {
  manga_id?: number;
  mangadex_id?: string;
  title: string;
  cover_url?: string;
  genre?: string;
}

export const trackHistory = (payload: TrackHistoryPayload) =>
  api.post("/reading_histories", { reading_history: payload }).then((r) => r.data);

// ── MangaDex proxy — leitura direta ──────────────────────────────────────────

/** Detecta se um ID é UUID do MangaDex ou inteiro do catálogo local. */
export const isMdexId = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const searchMdex = (query: string) =>
  api.get("/mdex/search", { params: { query } }).then((r) => r.data);

export const getMdexManga = (id: string, lang = "pt-br") =>
  api.get(`/mdex/manga/${id}`, { params: { lang } }).then((r) => r.data);

export const getMdexChapter = (id: string, dataSaver = false) =>
  api.get(`/mdex/chapter/${id}`, { params: { data_saver: dataSaver } }).then((r) => r.data);

// ── Auth MangaVerse (contas próprias) ────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const registerUser = (payload: RegisterPayload) =>
  api.post("/users/register", payload).then((r) => r.data);

export const loginAppUser = (identifier: string, password: string) =>
  api.post("/users/login", { identifier, password }).then((r) => r.data);

export const logoutUser = () =>
  api.delete("/users/logout").then((r) => r.data);

export const getMe = () =>
  api.get("/users/me").then((r) => r.data);

export const updateProfile = (payload: { name?: string; avatar_color?: string }) =>
  api.patch("/users/me", payload).then((r) => r.data);

// ── Auth MangaDex (OAuth para upload/listas) ─────────────────────────────────

export const loginUser = (username: string, password: string) =>
  api.post("/auth/login", { username, password }).then((r) => r.data);

export const refreshToken = (refresh_token: string) =>
  api.post("/auth/refresh", { refresh_token }).then((r) => r.data);

// ── MDList — Status de leitura ────────────────────────────────────────────────

export type ReadingStatus =
  | "reading" | "on_hold" | "dropped"
  | "plan_to_read" | "completed" | "re_reading" | null;

export const STATUS_LABELS: Record<NonNullable<ReadingStatus>, string> = {
  reading:      "Lendo",
  on_hold:      "Em pausa",
  dropped:      "Abandonado",
  plan_to_read: "Quero ler",
  completed:    "Concluído",
  re_reading:   "Relendo",
};

export const setReadingStatus = (mangaId: string, status: ReadingStatus) =>
  api.post(`/mdlist/status/${mangaId}`, { status }).then((r) => r.data);

export const getReadingStatus = (mangaId: string) =>
  api.get(`/mdlist/status/${mangaId}`).then((r) => r.data);

export const followManga = (mangaId: string) =>
  api.post(`/mdlist/follow/${mangaId}`).then((r) => r.data);

export const unfollowManga = (mangaId: string) =>
  api.delete(`/mdlist/follow/${mangaId}`).then((r) => r.data);

export const getLists = () =>
  api.get("/mdlist/lists").then((r) => r.data);

export const createList = (name: string, visibility: "public" | "private", manga: string[] = []) =>
  api.post("/mdlist/lists", { name, visibility, manga }).then((r) => r.data);

export const updateList = (id: string, manga: string[], version: number) =>
  api.put(`/mdlist/lists/${id}`, { manga, version }).then((r) => r.data);

// ── Upload de capítulos ───────────────────────────────────────────────────────

export const getUploadSession = () =>
  api.get("/upload/session").then((r) => r.data);

export const beginUploadSession = (mangaId: string, groupIds: string[] = []) =>
  api.post("/upload/begin", { manga_id: mangaId, group_ids: groupIds }).then((r) => r.data);

export const uploadPages = (sessionId: string, formData: FormData) =>
  api.post(`/upload/${sessionId}/pages`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  }).then((r) => r.data);

export const deleteUploadPage = (sessionId: string, fileId: string) =>
  api.delete(`/upload/${sessionId}/pages/${fileId}`).then((r) => r.data);

export interface CommitChapterPayload {
  chapter: string;
  title?: string;
  volume?: string;
  translated_language?: string;
  page_order: string[];
}

export const commitUpload = (sessionId: string, payload: CommitChapterPayload) =>
  api.post(`/upload/${sessionId}/commit`, payload).then((r) => r.data);

export const abandonUpload = (sessionId: string) =>
  api.delete(`/upload/${sessionId}`).then((r) => r.data);

// ── Criação de mangá ──────────────────────────────────────────────────────────

export interface CreateMangaPayload {
  title: string;
  description?: string;
  original_language?: string;
  status?: "ongoing" | "completed" | "hiatus" | "cancelled";
  year?: number;
  content_rating?: "safe" | "suggestive";
  tags?: string[];
}

export const getMangaDrafts = () =>
  api.get("/manga_drafts").then((r) => r.data);

export const createMangaDraft = (payload: CreateMangaPayload) =>
  api.post("/manga_drafts", payload).then((r) => r.data);

export const uploadMangaCover = (mangaId: string, formData: FormData, volume?: string) =>
  api.post(`/manga_drafts/${mangaId}/cover`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    params: volume ? { volume } : {},
  }).then((r) => r.data);

export const submitMangaDraft = (mangaId: string, version: number) =>
  api.post(`/manga_drafts/${mangaId}/submit`, { version }).then((r) => r.data);
