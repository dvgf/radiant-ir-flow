
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const Callback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Process the OAuth callback
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // If successful, redirect to dashboard
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Error in auth callback:', err);
        setError(err.message || 'Authentication failed');
        
        // Redirect to login after a delay if there's an error
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-ir-background">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Authentication Error</h1>
          <p className="mt-2 text-ir-foreground">{error}</p>
          <p className="mt-4 text-ir-foreground">Redirecting to login page...</p>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ir-foreground mb-4">Completing Authentication</h1>
          <div className="animate-pulse flex justify-center">
            <div className="h-4 w-4 bg-ir-primary rounded-full mx-1"></div>
            <div className="h-4 w-4 bg-ir-primary rounded-full mx-1 animation-delay-200"></div>
            <div className="h-4 w-4 bg-ir-primary rounded-full mx-1 animation-delay-400"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Callback;
