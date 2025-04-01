
import { createClient } from '@supabase/supabase-js';
// Import the supabase client that's already properly configured
import { supabase as supabaseClient } from '../../integrations/supabase/client';

// Export the client that's already properly configured
export const supabase = supabaseClient;
