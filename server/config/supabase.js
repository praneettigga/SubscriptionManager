const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Warning: Supabase credentials not configured. Database operations will fail.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = supabase;
