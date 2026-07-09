import { createClient } from '@supabase/supabase-js';

// You can find these values in your Supabase Dashboard under Project Settings > API
const supabaseUrl = 'https://gpbokmsjwuyrbuqmakzt.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_IhRSph61X6ijEIDrWwgK6Q_DeJGn287';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);