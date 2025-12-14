import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

console.log('--- DEBUG ENV VARS ---');
console.log('URL:', SUPABASE_URL);
console.log('KEY:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 10) + '...' : 'UNDEFINED');
console.log('--- END DEBUG ---');
