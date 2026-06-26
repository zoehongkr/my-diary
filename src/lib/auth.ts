import { supabaseClient } from "@/lib/supabaseClient";

export async function signInWithPassword(email: string, password: string) {
  return supabaseClient.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabaseClient.auth.signOut();
}

export async function getSession() {
  return supabaseClient.auth.getSession();
}
