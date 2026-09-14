/**
 * Helpers for mocking the Supabase service client that the signup route uses.
 *
 * `app/api/auth/signup/route.ts` calls `createServiceClient().auth.admin
 * .createUser()`. These suites predate that: they mock Prisma and bcrypt but
 * not Supabase, so the route reached for a real auth endpoint and died with
 * "AuthRetryableFetchError: fetch failed" long before any assertion ran —
 * which had nothing to do with the security properties they were written to
 * check (role sanitisation, password rules, admin-domain rejection).
 *
 * Pair these with:
 *
 *   vi.mock('@/lib/supabase/server', () => ({
 *     createServiceClient: () => ({
 *       auth: { admin: { createUser: mocks.createUser } },
 *     }),
 *   }));
 */

/** A successful supabase.auth.admin.createUser() result. */
export function createdUser(id = 'test-supabase-uid') {
  return { data: { user: { id } }, error: null };
}

/** A failed one — e.g. an address that is already registered. */
export function createUserError(message: string) {
  return { data: { user: null }, error: { message } };
}
