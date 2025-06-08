const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const csv = require('csv-parser');

const API_URL = 'http://localhost:1337/api';
const API_TOKEN = '814163e3423e3955c7d6a5b0f90ada95d8606db0e7b9dd8acd50304af5866d93716904ba2217d253f4e3805a666e630bd21dddcc4e297bb41f48af5d86fec5ace2bf9bf81f9ca642c77ceafc47d2b4e1d26646026fad04cdc664027f3185522cbfd404ca54357b6c9967b41a3bb0e1698c8d4bfc968c1cf5d00fc21ab1e45cc4';

const HEADERS = { Authorization: `Bearer ${API_TOKEN}` };
const IMAGES_FOLDER = path.join(__dirname, 'imports', 'images');

async function borrarProductos() {
  const { data } = await axios.get(`${API_URL}/productos?pagination[pageSize]=1000`, { headers: HEADERS });
  const productos = data.data;
  console.log(`🧹 Borrando ${productos.length} productos...`);
  for (const prod of productos) {
    await axios.delete(`${API_URL}/productos/${prod.id}`, { headers: HEADERS });
  }
}

async function obtenerMapas() {
  const [cats, subs, subsubs] = await Promise.all([
    axios.get(`${API_URL}/categorias?populate=*`, { headers: HEADERS }),
    axios.get(`${API_URL}/subcategorias?populate=categoria`, { headers: HEADERS }),
    axios.get(`${API_URL}/subsubcategorias?populate=subcategoria`, { headers: HEADERS }),
  ]);

  const categorias = {};
  cats.data.data.forEach(c => {
    const nombre = c.nombre?.trim();
    if (nombre) {
      categorias[nombre.toUpperCase()] = c.id;
    } else {
      console.warn(`⚠️ Categoría sin nombre: ${JSON.stringify(c)}`);
    }
  });

  const subcategorias = {};
  subs.data.data.forEach(s => {
    const nombre = s.nombre?.trim();
    const idCat = s.categoria?.id;
    if (nombre && idCat) {
      subcategorias[nombre.toUpperCase()] = { id: s.id, categoriaId: idCat };
    } else {
      console.warn(`⚠️ Subcategoría incompleta: ${JSON.stringify(s)}`);
    }
  });

  const subsubcategorias = {};
  subsubs.data.data.forEach(ss => {
    const nombre = ss.nombre?.trim();
    const idSub = ss.subcategoria?.id;
    if (nombre && idSub) {
      subsubcategorias[nombre.toUpperCase()] = { id: ss.id, subcategoriaId: idSub };
    } else {
      console.warn(`⚠️ Subsubcategoría incompleta: ${JSON.stringify(ss)}`);
    }
  });

  return { categorias, subcategorias, subsubcategorias };
}

function leerCSV(pathCsv) {
  return new Promise((resolve, reject) => {
    const filas = [];
    fs.createReadStream(pathCsv)
      .pipe(csv())
      .on('data', (data) => filas.push(data))
      .on('end', () => resolve(filas))
      .on('error', reject);
  });
}

async function subirImagen(nombreArchivo) {
  const ruta = path.join(IMAGES_FOLDER, nombreArchivo);
  if (!nombreArchivo || !fs.existsSync(ruta)) return null;

  const form = new FormData();
  form.append('files', fs.createReadStream(ruta));

  const res = await axios.post(`${API_URL}/upload`, form, {
    headers: { ...form.getHeaders(), Authorization: `Bearer ${API_TOKEN}` },
  });

  return res.data[0]?.id || null;
}

async function importar() {
  await borrarProductos();
  const { categorias, subcategorias, subsubcategorias } = await obtenerMapas();

  console.log('📋 Categorías encontradas en Strapi:');
  console.log(Object.keys(categorias));

  console.log('\n📋 Subcategorías encontradas en Strapi:');
  console.log(Object.keys(subcategorias));

  const productos = await leerCSV(path.join(__dirname, 'imports', 'productos.csv'));
  console.log(`🚀 Importando ${productos.length} productos...\n`);

  for (const fila of productos) {
    const nombre = fila.nombre?.trim();
    const precioUSD = parseFloat(fila.precioUSD);
    const categoria = fila.categoria?.trim().toUpperCase();
    const subcategoria = fila.subcategoria?.trim().toUpperCase();
    const subsubcategoria = fila.subsubcategoria?.trim().toUpperCase();
    const nombreImagen = fila.nombreImagen?.trim();

    if (!nombre || isNaN(precioUSD) || !categoria || !subcategoria) {
      console.error(`⚠️ Fila inválida: ${JSON.stringify(fila)}`);
      continue;
    }

    const idCat = categorias[categoria];
    const sub = subcategorias[subcategoria];
    const subsub = subsubcategoria ? subsubcategorias[subsubcategoria] : null;

    if (!idCat) {
      console.error(`❌ Categoría no encontrada: '${categoria}'`);
      console.log('🔎 Categorías disponibles:', Object.keys(categorias));
      continue;
    }
    if (!sub || sub.categoriaId !== idCat) {
      console.error(`❌ Subcategoría '${subcategoria}' no pertenece a categoría '${categoria}'`);
      console.log('🔎 Subcategorías disponibles:', Object.keys(subcategorias));
      continue;
    }
    if (subsubcategoria && (!subsub || subsub.subcategoriaId !== sub.id)) {
      console.error(`❌ Subsubcategoría '${subsubcategoria}' no pertenece a subcategoría '${subcategoria}'`);
      console.log('🔎 Subsubcategorías disponibles:', Object.keys(subsubcategorias));
      continue;
    }

    let imagenId = null;
    if (nombreImagen) {
      try {
        imagenId = await subirImagen(nombreImagen);
        if (!imagenId) console.warn(`📁 Imagen no encontrada: ${nombreImagen}`);
      } catch (e) {
        console.warn(`💥 Error subiendo imagen '${nombreImagen}': ${e.message}`);
      }
    }

    try {
      await axios.post(`${API_URL}/productos`, {
        data: {
          nombre,
          precioUSD,
          categoria: idCat,
          subcategoria: sub.id,
          subsubcategoria: subsub?.id || null,
          imagen: imagenId,
        },
      }, { headers: HEADERS });

      console.log(`✅ Producto creado: ${nombre}`);
    } catch (err) {
      console.error(`💥 Error creando '${nombre}':`, err.response?.data || err.message);
    }
  }
}

importar();
