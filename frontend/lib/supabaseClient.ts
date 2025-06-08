// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://okhvjishzlennulkzhek.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9raHZqaXNoemxlbm51bGt6aGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODIxMDYsImV4cCI6MjA2NDY1ODEwNn0.P-r2eVXZfZFjF4RlLCRG61-kMFifLM6DOG9Qlfqq6gg'; // tu anon key

export const supabase = createClient(supabaseUrl, supabaseKey);
