const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vaalutcvnjjkrdkautfg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhYWx1dGN2bmpqa3Jka2F1dGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTEyNzgsImV4cCI6MjA3MDE2NzI3OH0.jszqfLQkbKT2JBMg4IzGZ451nOfTy6alZRLq4OSxWcQ'
);

module.exports = supabase;