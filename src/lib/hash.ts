/**
 * SHA-256 password hashing via Web Crypto. This avoids storing plain
 * text passwords in Supabase for the demo build. For a real
 * production deployment, move authentication server-side (e.g. a
 * Supabase Edge Function or Next.js API route) and hash with a
 * salted algorithm such as bcrypt/argon2 instead of doing it in the
 * browser.
 */
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", enc.encode(password));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
