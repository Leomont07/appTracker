const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://brlcjqbwrvrbssvkxtgt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJybGNqcWJ3cnZyYnNzdmt4dGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5Njg0OTYsImV4cCI6MjA3MDU0NDQ5Nn0.KGbJDSZe5JHsXgfn2AzNfoxM5-xBg53m9TUf4BwQf5k'
);

module.exports = supabase;