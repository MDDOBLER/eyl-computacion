const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Configuración
const SUPABASE_URL = 'https://okhvjishzlennulkzhek.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9raHZqaXNoemxlbm51bGt6aGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODIxMDYsImV4cCI6MjA2NDY1ODEwNn0.P-r2eVXZfZFjF4RlLCRG61-kMFifLM6DOG9Qlfqq6gg';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
  await supabase.auth.refreshSession();
  await new Promise(resolve => setTimeout(resolve, 1000));

  const csvPath = path.join(__dirname, 'imports', 'productos.csv');
  const productos = [];

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (data) => productos.push(data))
    .on('end', async () => {
      console.log(`📦 Cargando ${productos.length} productos...`);

      for (const fila of productos) {
        const nombre = fila.nombre_producto?.trim();
        const preciousd = parseFloat(fila.preciousd);
        const subcatNombre = fila.subcategoria?.trim().toUpperCase();
        const subsubNombre = fila.subsubcategoria?.trim().toUpperCase();
        const descripcion = fila.descripcion?.trim() || null;
        const masinfo = fila.masinfo?.trim() || null;
        const nombreimagen = fila.nombreimagen?.trim() || null;
        const isOffer = fila.isoffer?.toLowerCase() === 'true' || fila.isoffer === '1';

        if (!nombre || isNaN(preciousd) || !subcatNombre) {
          console.warn(`⚠️ Fila inválida: ${JSON.stringify(fila)}`);
          continue;
        }

        // Buscar subcategoría
        const { data: subcat, error: errSubcat } = await supabase
          .from('subcategoria')
          .select('id, categoria')
          .eq('nombre', subcatNombre)
          .maybeSingle();

        if (!subcat) {
          console.warn(`⚠️ Subcategoría no encontrada: ${subcatNombre}`);
          continue;
        }

        const idSub = subcat.id;
        const idCat = subcat.categoria;

        // Buscar subsubcategoría si viene
        let idSubSub = null;
        if (subsubNombre) {
          const { data: subsub } = await supabase
            .from('subsubcategoria')
            .select('id')
            .eq('nombre', subsubNombre)
            .maybeSingle();
          idSubSub = subsub?.id || null;
        }

        // Crear producto
        const { error } = await supabase.from('producto').insert({
          nombre,
          preciousd,
          categoria: idCat,
          subcategoria: idSub,
          subsubcategoria: idSubSub,
          descripcion,
          masinfo,
          nombreimagen,
          isoffer: isOffer,
        });

        if (error) {
          console.error(`❌ Error creando producto: ${nombre}`, error.message);
        } else {
          console.log(`✅ Producto creado: ${nombre}`);
        }
      }

      console.log('🎉 Importación completa.');
    });
})();
