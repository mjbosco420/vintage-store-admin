export default {
  name: 'customer',
  title: 'Customers',
  type: 'document',

  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },

    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },

    {
      name: 'password',
      title: 'Password',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },

    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
    },
  ],
}