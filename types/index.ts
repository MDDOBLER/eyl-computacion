export type Product = {
  id: number;                  // ID numérico de Supabase
  name: string;                // nombre del producto
  price: string;               // precio en pesos formateado (ej. "$ 10.000")
  image?: string;              // URL local o completa de imagen
  category: string;            // nombre de la categoría
  subcategory: string;         // nombre de la subcategoría
  subSubcategory?: string;     // nombre de la sub-subcategoría (opcional)
  descripcion?: string;        // descripción breve (opcional)
  masinfo?: string;            // link externo (opcional)
  isOffer?: boolean;           // true si es una oferta
};


  