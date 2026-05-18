import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    // PKCE (Proof Key for Code Exchange) is the recommended OAuth flow for SPAs.
    // Unlike the implicit flow (which passes tokens via URL hash fragments),
    // PKCE uses a secure code exchange via query parameters. This prevents
    // tokens from leaking in browser history and is more reliable across
    // browsers and redirects.
    flowType: 'pkce',

    // Allows the Supabase client to automatically detect and exchange the
    // authorization code from the callback URL after an OAuth redirect.
    // Without this, the client would not pick up the session when the user
    // is redirected back from Google → Supabase → your app.
    detectSessionInUrl: true,

    // Saves the session (access + refresh tokens) to localStorage so the
    // user stays logged in across page reloads and browser restarts.
    persistSession: true,

    // Uses localStorage as the session storage backend.
    // This is the default but we set it explicitly for clarity.
    storage: localStorage,

    // Automatically refreshes the access token before it expires using
    // the stored refresh token. Prevents the user from being silently
    // logged out mid-session.
    autoRefreshToken: true,
  },
});