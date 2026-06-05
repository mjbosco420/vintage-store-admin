export default {
  name: 'product',
  title: 'Products',
  type: 'document',

  fields: [
    {
      name: 'title',
      title: 'Product Name',
      type: 'string',
    },

    {
      name: 'price',
      title: 'Price',
      type: 'number',
    },

    {
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [{ type: 'image' }],
    },

    {
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Use Hoodies, T-Shirts, Outerwear, or Pants for primary menus. Any other value will appear under Others on the website.',
    },

    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },

    {
      name: 'stock',
      title: 'Stock',
      type: 'number',
    },

    {
      name: 'isReserved',
      title: 'Reserved',
      type: 'boolean',
      initialValue: false,
      description: 'Check this if the product is reserved or shipped.',
    },

    {
      name: 'sizes',
      title: 'Sizes',
      type: 'array',
      of: [{ type: 'string' }],
    },

    {
      name: 'likes',
      title: 'Likes',
      type: 'number',
      initialValue: 0,
      description: 'Total number of likes across all users.',
    },
    {
      name: 'views',
      title: 'Views',
      type: 'number',
      initialValue: 0,
      description: 'Total number of times this product has been viewed.',
    },
  ],
}
