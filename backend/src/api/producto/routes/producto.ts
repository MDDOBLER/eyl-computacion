export default {
  routes: [
    {
      method: 'POST',
      path: '/productos/eliminar-todos',
      handler: 'producto.eliminarTodos',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/productos',
      handler: 'producto.create',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/productos',
      handler: 'producto.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/productos/:id',
      handler: 'producto.findOne',
      config: {
        auth: false,
      },
    },
  ],
};
