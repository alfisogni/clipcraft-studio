import { describe, it, expect } from "vitest";
import { getSupabaseConfig } from "./config";

describe("getSupabaseConfig", () => {
  it("marks missing env as not configured", () => {
    expect(getSupabaseConfig({}).configured).toBe(false);
  });

  it("marks placeholder values as not configured", () => {
    expect(
      getSupabaseConfig({
        VITE_SUPABASE_URL: "https://tu-proyecto.supabase.co",
        VITE_SUPABASE_PUBLISHABLE_KEY: "tu_publishable_key_aqui",
      }).configured
    ).toBe(false);
  });

  it("accepts a valid url + publishable key", () => {
    const cfg = getSupabaseConfig({
      VITE_SUPABASE_URL: "https://abcxyz.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
    });
    expect(cfg.configured).toBe(true);
    expect(cfg.url).toBe("https://abcxyz.supabase.co");
    expect(cfg.key).toContain("eyJ");
  });

  it("falls back to VITE_SUPABASE_ANON_KEY when publishable is missing", () => {
    const cfg = getSupabaseConfig({
      VITE_SUPABASE_URL: "https://abcxyz.supabase.co",
      VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon",
    });
    expect(cfg.configured).toBe(true);
    expect(cfg.key).toContain("anon");
  });
});
