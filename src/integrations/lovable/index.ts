// Lovable integration stub.
// The original Lovable cloud-auth wrapper has been removed because it
// routes OAuth through "/~oauth/initiate" — a Lovable-hosted broker URL
// that does not exist on Vercel or any self-hosted deployment.
//
// All OAuth is now handled directly via supabase.auth.signInWithOAuth()
// in src/pages/Auth.tsx.

export const lovable = {
  auth: {
    signInWithOAuth: async () => {
      throw new Error(
        "lovable.auth.signInWithOAuth is no longer available. " +
        "Use supabase.auth.signInWithOAuth() directly instead."
      );
    },
  },
};
