import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types/game';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string, username: string, avatarUrl: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInAsGuest: (username: string, avatarUrl: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'tod_guest_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  // Initialize Auth state
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // 1. If Supabase is configured, check real session
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            await fetchSupabaseProfile(session.user.id, session.user.email);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Error fetching Supabase session:', err);
        }

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user && mounted) {
            await fetchSupabaseProfile(session.user.id, session.user.email);
          } else if (mounted) {
            // Check guest fallback
            checkGuestUser();
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      }

      // 2. Check local guest storage
      if (mounted) {
        checkGuestUser();
        setLoading(false);
      }
    }

    function checkGuestUser() {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setIsGuest(true);
        } catch {
          localStorage.removeItem(GUEST_STORAGE_KEY);
        }
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchSupabaseProfile = async (userId: string, email?: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // Fallback default profile
        const defaultProfile: UserProfile = {
          id: userId,
          username: email ? email.split('@')[0] : `Player_${userId.slice(0, 4)}`,
          avatarUrl: 'cyber-fox',
          email,
          createdAt: new Date().toISOString(),
          truthsCount: 0,
          daresCount: 0,
          passesCount: 0,
        };
        setUser(defaultProfile);
      } else {
        setUser({
          id: data.id,
          username: data.username,
          avatarUrl: data.avatar_url,
          email,
          createdAt: data.created_at,
          truthsCount: data.truths_count || 0,
          daresCount: data.dares_count || 0,
          passesCount: data.passes_count || 0,
        });
      }
      setIsGuest(false);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      // Offline/Local demo sign in
      const guestProfile: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        username: email.split('@')[0],
        avatarUrl: 'cyber-fox',
        email,
        createdAt: new Date().toISOString(),
        truthsCount: 0,
        daresCount: 0,
        passesCount: 0,
      };
      setUser(guestProfile);
      setIsGuest(false);
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestProfile));
      return {};
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) return { error: error.message };
      if (data.user) {
        await fetchSupabaseProfile(data.user.id, data.user.email);
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to sign in' };
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    username: string,
    avatarUrl: string
  ): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      const localProfile: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        username: username.trim() || email.split('@')[0],
        avatarUrl: avatarUrl || 'cyber-fox',
        email,
        createdAt: new Date().toISOString(),
        truthsCount: 0,
        daresCount: 0,
        passesCount: 0,
      };
      setUser(localProfile);
      setIsGuest(false);
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(localProfile));
      return {};
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            username,
            avatar_url: avatarUrl,
          },
        },
      });

      if (error) return { error: error.message };

      if (data.user) {
        // Insert profile into public.profiles
        await supabase.from('profiles').upsert({
          id: data.user.id,
          username,
          avatar_url: avatarUrl,
        });

        await fetchSupabaseProfile(data.user.id, data.user.email);
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to sign up' };
    }
  };

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Supabase credentials not configured in .env' };
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err.message || 'Google login failed' };
    }
  };

  const signInAsGuest = (username: string, avatarUrl: string) => {
    const guestProfile: UserProfile = {
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      username: username.trim() || 'PartyGuest_' + Math.floor(Math.random() * 899 + 100),
      avatarUrl: avatarUrl || 'cyber-fox',
      createdAt: new Date().toISOString(),
      truthsCount: 0,
      daresCount: 0,
      passesCount: 0,
    };
    setUser(guestProfile);
    setIsGuest(true);
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestProfile));
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);

    if (isGuest || !isSupabaseConfigured() || !supabase) {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
    } else {
      await supabase.from('profiles').update({
        username: updated.username,
        avatar_url: updated.avatarUrl,
        truths_count: updated.truthsCount,
        dares_count: updated.daresCount,
        passes_count: updated.passesCount,
      }).eq('id', user.id);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem(GUEST_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInAsGuest,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
