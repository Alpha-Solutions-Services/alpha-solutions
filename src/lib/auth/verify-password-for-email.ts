import { createClient } from "@supabase/supabase-js";

/**
 * Verifies email + password via anon Supabase client without persisting a session.
 * Used when an auth user may already exist and the API must prove the caller owns the account.
 */
export async function verifyPasswordForEmail(
  email: string,
  password: string,
): Promise<{ userId: string } | { error: string; status: number }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return { error: "Auth not configured", status: 500 };
  }
  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user?.id) {
    return {
      error:
        "Wrong password for this email, or this account uses another sign-in method. Try again or use Forgot password.",
      status: 401,
    };
  }
  return { userId: data.user.id };
}
