import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yydvhvwxysfolthcsnub.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHZodnd4eXNmb2x0aGNzbnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0Nzg3MTIsImV4cCI6MjA4MjA1NDcxMn0.29stDaTxBKObubh308lKYpJslmxpra9Isc-mfhKgPjU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);