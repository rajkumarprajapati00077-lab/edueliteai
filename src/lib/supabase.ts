// Supabase client placeholder.
// Once Lovable Cloud is enabled, the SDK + env vars are auto-provisioned.
// For now this exports a typed stub so the rest of the app compiles cleanly.

export type AuthUser = {
  id: string;
  email: string;
  full_name?: string;
};

export const supabase = {
  auth: {
    async signIn(_email: string, _password: string) {
      return { data: null, error: new Error("Connect Lovable Cloud to enable auth") };
    },
    async signOut() {
      return { error: null };
    },
    async getUser(): Promise<{ user: AuthUser | null }> {
      return { user: null };
    },
  },
  from(_table: string) {
    return {
      select: async () => ({ data: [], error: null }),
      insert: async (_rows: unknown) => ({ data: null, error: null }),
      update: async (_rows: unknown) => ({ data: null, error: null }),
    };
  },
};