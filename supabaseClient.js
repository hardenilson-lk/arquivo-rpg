const SUPABASE_URL = "https://hydehmldnrlenphhjeiu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__1Eu9tftOaK7csur1PywZA_9ycHCvRl";

if (!window.supabase) {
  console.error("Supabase JS não foi carregado. Verifique o CDN no index.html.");
} else {
  window.arquivosSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  console.log("Supabase conectado:", SUPABASE_URL);
}
