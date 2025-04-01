
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getUserRole: () => UserRole | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check active session and sets the user
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Check for admin role in metadata or profiles table
          let role: UserRole = 'doctor'; // Default role
          
          // First check in user metadata
          const metaRole = session.user.user_metadata?.role;
          if (metaRole === 'admin') {
            role = 'admin';
          } else {
            // If not in metadata, check profiles table if it exists
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
                
              if (profileData?.role === 'admin') {
                role = 'admin';
              }
            } catch (err) {
              // Profiles table might not exist, continue with default role
              console.log('No profile found, using default role');
            }
          }
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: role,
            firstName: session.user.user_metadata?.first_name || 'Test',
            lastName: session.user.user_metadata?.last_name || 'User',
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast({
          title: 'Authentication Error',
          description: 'Failed to initialize authentication.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Check for admin role in metadata or profiles table
        let role: UserRole = 'doctor'; // Default role
        
        // First check in user metadata
        const metaRole = session.user.user_metadata?.role;
        if (metaRole === 'admin') {
          role = 'admin';
        } else {
          // If not in metadata, check profiles table if it exists
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
              
            if (profileData?.role === 'admin') {
              role = 'admin';
            }
          } catch (err) {
            // Profiles table might not exist, continue with default role
            console.log('No profile found, using default role');
          }
        }
        
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: role,
          firstName: session.user.user_metadata?.first_name || 'Test',
          lastName: session.user.user_metadata?.last_name || 'User',
        });
      } else {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast({
        title: 'Sign In Successful',
        description: 'Welcome back!',
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: 'Sign In Failed',
        description: error.message || 'An error occurred during sign in.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: 'Google Sign In Failed',
        description: error.message || 'An error occurred during Google sign in.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: 'Signed Out',
        description: 'You have been signed out successfully.',
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: 'Sign Out Failed',
        description: error.message || 'An error occurred during sign out.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getUserRole = (): UserRole | null => {
    return user?.role || null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signOut, getUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
