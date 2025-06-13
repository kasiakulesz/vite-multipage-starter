import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nrlitwvxtepgxqtmukuh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybGl0d3Z4dGVwZ3hxdG11a3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNzk3ODMsImV4cCI6MjA2MzY1NTc4M30.MzdeaeuY5cgVBNgqOXBLLFHo0JG9ugWbhqLVOHvB2Ng';
export const supabase = createClient(supabaseUrl, supabaseKey);