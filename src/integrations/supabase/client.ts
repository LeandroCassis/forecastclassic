
// This is a placeholder file to prevent import errors
// The application is currently using direct API calls instead of Supabase

export const supabaseClient = {
  // Dummy methods to prevent errors
  from: () => ({
    select: () => Promise.resolve([]),
    insert: () => Promise.resolve({ error: null, data: [] }),
    update: () => Promise.resolve({ error: null, data: [] }),
    delete: () => Promise.resolve({ error: null })
  }),
  auth: {
    signIn: () => Promise.resolve({ error: null, data: null }),
    signOut: () => Promise.resolve({ error: null })
  }
};
