import { Database } from "@/types/supabase";
import { createBrowserClient } from "@supabase/ssr";

export type SupabaseClient = ReturnType<typeof createClient>

export const createClient = () =>
    createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
