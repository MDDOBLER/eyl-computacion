const { createClient } = require('@supabase/supabase-js');

// Configuración
const SUPABASE_URL = 'https://okhvjishzlennulkzhek.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9raHZqaXNoemxlbm51bGt6aGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODIxMDYsImV4cCI6MjA2NDY1ODEwNn0.P-r2eVXZfZFjF4RlLCRG61-kMFifLM6DOG9Qlfqq6gg';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function borrarTodosLosProductos() {
  const { error } = await supabase
    .from('producto')
    .delete()
    .not('id', 'is', null); // ✅ elimina todos los registros con id válido

  if (error) {
    console.error('❌ Error al borrar productos:', error.message);
  } else {
    console.log('✅ Productos eliminados correctamente.');
  }
}

borrarTodosLosProductos();
