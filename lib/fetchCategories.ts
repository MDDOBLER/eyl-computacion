import { supabase } from './supabaseClient';

type SubcategoriaRaw = {
  id: number;
  nombre: string;
  categoria: { id: number; nombre: string } | { id: number; nombre: string }[];
  subsubcategoria: { id: number; nombre: string }[];
};

type CategoriaFinal = {
  id: number;
  nombre: string;
  subcategorias: {
    id: number;
    nombre: string;
    subsubcategorias: { id: number; nombre: string }[];
  }[];
};

export const fetchCategoryTree = async (): Promise<CategoriaFinal[]> => {
  const { data, error } = await supabase
    .from('subcategoria')
    .select(`
      id,
      nombre,
      categoria (
        id,
        nombre
      ),
      subsubcategoria (
        id,
        nombre
      )
    `);

  if (error || !Array.isArray(data)) {
    console.error('❌ Error al obtener categorías:', error);
    return [];
  }

  const rawData = data as SubcategoriaRaw[];

  const categoriasMap = new Map<number, CategoriaFinal>();

  for (const sub of rawData) {
    const categoria = Array.isArray(sub.categoria) ? sub.categoria[0] : sub.categoria;
    if (!categoria) continue;

    const catId = categoria.id;
    if (!categoriasMap.has(catId)) {
      categoriasMap.set(catId, {
        id: catId,
        nombre: categoria.nombre,
        subcategorias: [],
      });
    }

    categoriasMap.get(catId)?.subcategorias.push({
      id: sub.id,
      nombre: sub.nombre,
      subsubcategorias: sub.subsubcategoria || [],
    });
  }

  return Array.from(categoriasMap.values());
};
