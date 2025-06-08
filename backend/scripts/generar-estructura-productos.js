// generar-estructura-productos.js

const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

const STRAPI_URL = 'http://localhost:1337/api/categorias?populate[subcategorias][populate]=subsubcategorias';
const OUTPUT_CSV = path.join(__dirname, 'estructura_productos.csv');

(async () => {
  try {
    const res = await fetch(STRAPI_URL);
    const json = await res.json();

    if (!Array.isArray(json.data)) {
      throw new Error('La respuesta de Strapi no es una lista de categorías.');
    }

    const rows = [];
    rows.push('nombre,precioUsd,categoria,subcategoria,subsubcategoria,nombreImagen');

    json.data.forEach((categoria) => {
      const nombreCat = categoria.nombre || 'SIN NOMBRE';
      const subs = categoria.subcategorias || [];

      if (subs.length === 0) {
        // Solo categoría
        rows.push(`,,,,${nombreCat},`);
      } else {
        subs.forEach((sub) => {
          const nombreSub = sub.nombre || 'SIN NOMBRE';
          const subsubs = sub.subsubcategorias || [];

          if (subsubs.length === 0) {
            // Solo hasta subcategoría
            rows.push(`,,,${nombreCat},${nombreSub},`);
          } else {
            subsubs.forEach((subsub) => {
              const nombreSubSub = subsub.nombre || 'SIN NOMBRE';
              rows.push(`,,,,${nombreCat},${nombreSub},${nombreSubSub},`);
            });
          }
        });
      }
    });

    fs.writeFileSync(OUTPUT_CSV, rows.join('\n'), 'utf8');
    console.log(`✅ Archivo generado: ${OUTPUT_CSV}`);
  } catch (err) {
    console.error('❌ Error generando CSV:', err.message);
  }
})();
