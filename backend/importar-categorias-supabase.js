// importar-categorias-supabase.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Configuración Supabase
const SUPABASE_URL = 'https://okhvjishzlennulkzhek.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9raHZqaXNoemxlbm51bGt6aGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODIxMDYsImV4cCI6MjA2NDY1ODEwNn0.P-r2eVXZfZFjF4RlLCRG61-kMFifLM6DOG9Qlfqq6gg';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const csvPath = path.join(__dirname, 'imports', 'categorias_strapi.csv');

async function cargarCategorias() {
  const categorias = new Set();
  const subcategorias = new Set();
  const subsubcategorias = [];
  const filas = [];

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (data) => filas.push(data))
    .on('end', async () => {
      // 1. Crear Categorías
      for (const fila of filas) {
        const cat = fila.categoria?.trim();
        if (cat && !categorias.has(cat)) {
          categorias.add(cat);
          const { data, error } = await supabase
            .from('categoria')
            .select('id')
            .eq('nombre', cat)
            .maybeSingle();

          if (!data) {
            await supabase.from('categoria').insert({ nombre: cat });
          }
        }
      }

      // 2. Crear Subcategorías
      for (const fila of filas) {
        const cat = fila.categoria?.trim();
        const subcat = fila.subcategoria?.trim();
        if (cat && subcat && !subcategorias.has(subcat)) {
          subcategorias.add(subcat);
          const { data: catData } = await supabase
            .from('categoria')
            .select('id')
            .eq('nombre', cat)
            .maybeSingle();

          if (catData) {
            const { data: subcatExist } = await supabase
              .from('subcategoria')
              .select('id')
              .eq('nombre', subcat)
              .maybeSingle();

            if (!subcatExist) {
              await supabase.from('subcategoria').insert({ nombre: subcat, categoria: catData.id });
            }
          }
        }
      }

      // 3. Crear Subsubcategorías
      for (const fila of filas) {
        const subcat = fila.subcategoria?.trim();
        const subsub = fila.subsubcategoria?.trim();
        if (subcat && subsub) {
          const { data: subcatData } = await supabase
            .from('subcategoria')
            .select('id')
            .eq('nombre', subcat)
            .maybeSingle();

          if (subcatData) {
            const { data: subsubExist } = await supabase
              .from('subsubcategoria')
              .select('id')
              .eq('nombre', subsub)
              .maybeSingle();

            if (!subsubExist) {
              await supabase.from('subsubcategoria').insert({ nombre: subsub, subcategoria: subcatData.id });
            }
          }
        }
      }

      console.log('✅ Importación completa de categorías.');
    });
}

cargarCategorias();
