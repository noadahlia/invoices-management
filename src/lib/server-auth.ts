import { createServerClient, serialize } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getServerSession() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Les cookies peuvent ne pas être disponibles dans certains contextes
          }
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: No user session');
  }

  return { user, supabase };
}

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Les cookies peuvent ne pas être disponibles dans certains contextes
          }
        },
      },
    },
  );
}

export async function requireAuth() {
  try {
    const { user } = await getServerSession();

    if (!user) {
      throw new Error('Unauthorized: No user session');
    }

    return user;
  } catch (error) {
    // Si c'est une erreur de session, relancer avec un message plus approprié
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      throw error;
    }
    // Pour les autres erreurs, relancer aussi
    throw error;
  }
}
