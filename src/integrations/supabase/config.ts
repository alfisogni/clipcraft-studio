type EnvLike = Record<string, string | undefined>;

const isPlaceholder = (value: string) =>
  /tu-proyecto|tu_publishable|tu_anon|your[-_]?supabase|changeme|placeholder/i.test(value);

/**
 * Resolve Supabase URL/key from Vite env without throwing.
 * Missing or placeholder values → configured: false (app can still boot in demo mode).
 */
export function getSupabaseConfig(env: EnvLike = import.meta.env as EnvLike) {
  const url = env.VITE_SUPABASE_URL?.trim() ?? "";
  const key =
    env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    env.VITE_SUPABASE_ANON_KEY?.trim() ||
    "";

  const configured = Boolean(url && key && !isPlaceholder(url) && !isPlaceholder(key));

  return { url, key, configured };
}
