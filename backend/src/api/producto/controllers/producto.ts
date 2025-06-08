import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::producto.producto', ({ strapi }) => ({
  async eliminarTodos(ctx) {
    try {
      const productos = await strapi.entityService.findMany('api::producto.producto', {
        fields: ['id'],
        limit: 1000,
      });

      for (const producto of productos) {
        await strapi.entityService.delete('api::producto.producto', producto.id);
      }

      ctx.send({
        mensaje: `Se eliminaron ${productos.length} productos.`,
        idsEliminados: productos.map(p => p.id),
      });
    } catch (err) {
      ctx.throw(500, 'Error al eliminar productos', { details: err });
    }
  },
}));

