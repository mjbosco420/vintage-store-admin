export default {
  name: 'order',
  title: 'Orders',
  type: 'document',

  fields: [
    {
      name: 'orderNumber',
      title: 'Order Number',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },

    {
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'new',
      options: {
        layout: 'radio',
        list: [
          {title: 'New', value: 'new'},
          {title: 'Confirmed', value: 'confirmed'},
          {title: 'Packed', value: 'packed'},
          {title: 'Shipped', value: 'shipped'},
          {title: 'Completed', value: 'completed'},
          {title: 'Cancelled', value: 'cancelled'},
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },

    {
      name: 'source',
      title: 'Checkout Source',
      type: 'string',
      initialValue: 'website',
      options: {
        list: [
          {title: 'Website', value: 'website'},
          {title: 'WhatsApp', value: 'whatsapp'},
        ],
      },
    },

    {
      name: 'paymentMethod',
      title: 'Payment Method',
      type: 'string',
      initialValue: 'Website',
      options: {
        list: [
          {title: 'Website', value: 'Website'},
          {title: 'PayPal', value: 'PayPal'},
          {title: 'WhatsApp', value: 'WhatsApp'},
        ],
      },
    },

    {
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },

    {
      name: 'customerEmail',
      title: 'Customer Email',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },

    {
      name: 'shippingAddress',
      title: 'Shipping Address',
      type: 'text',
      rows: 4,
      validation: (Rule: any) => Rule.required(),
    },

    {
      name: 'shippingCourier',
      title: 'Shipping Courier',
      type: 'string',
      description: 'Example: JNE, J&T, SiCepat, DHL, FedEx.',
      options: {
        list: [
          {title: 'JNE', value: 'JNE'},
          {title: 'J&T', value: 'J&T'},
          {title: 'SiCepat', value: 'SiCepat'},
          {title: 'Anteraja', value: 'Anteraja'},
          {title: 'DHL', value: 'DHL'},
          {title: 'FedEx', value: 'FedEx'},
          {title: 'Other', value: 'Other'},
        ],
      },
      validation: (Rule: any) =>
        Rule.custom((value: string, context: any) => {
          const status = context.document?.status
          if (status === 'shipped' && !value) {
            return 'Courier is required when order status is Shipped'
          }
          return true
        }),
    },

    {
      name: 'trackingNumber',
      title: 'Tracking Number',
      type: 'string',
      description: 'Enter the shipping tracking number after the item has been shipped.',
      validation: (Rule: any) =>
        Rule.custom((value: string, context: any) => {
          const status = context.document?.status
          if (status === 'shipped' && !value) {
            return 'Tracking number is required when order status is Shipped'
          }
          return true
        }),
    },

    {
      name: 'trackingUrl',
      title: 'Tracking URL',
      type: 'url',
      description: 'Optional direct tracking link for the customer.',
    },

    {
      name: 'shippedAt',
      title: 'Shipped At',
      type: 'datetime',
      description: 'Date and time when the package was shipped.',
    },

    {
      name: 'trackingEmailStatus',
      title: 'Tracking Email Status',
      type: 'string',
      initialValue: 'pending',
      readOnly: true,
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Sent', value: 'sent'},
          {title: 'Failed', value: 'failed'},
        ],
      },
    },

    {
      name: 'trackingEmailSentAt',
      title: 'Tracking Email Sent At',
      type: 'datetime',
      readOnly: true,
    },

    {
      name: 'trackingEmailError',
      title: 'Tracking Email Error',
      type: 'text',
      rows: 2,
      readOnly: true,
    },

    {
      name: 'orderedAt',
      title: 'Ordered At',
      type: 'datetime',
      readOnly: true,
    },

    {
      name: 'orderSummaryEmailStatus',
      title: 'Order Summary Email Status',
      type: 'string',
      initialValue: 'pending',
      readOnly: true,
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Sent', value: 'sent'},
          {title: 'Failed', value: 'failed'},
        ],
      },
    },

    {
      name: 'orderSummaryEmailSentAt',
      title: 'Order Summary Email Sent At',
      type: 'datetime',
      readOnly: true,
    },

    {
      name: 'orderSummaryEmailError',
      title: 'Order Summary Email Error',
      type: 'text',
      rows: 2,
      readOnly: true,
    },

    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
      rows: 3,
    },

    {
      name: 'items',
      title: 'Order Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'productId',
              title: 'Product ID',
              type: 'string',
            },
            {
              name: 'productName',
              title: 'Product Name',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'price',
              title: 'Price',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              validation: (Rule: any) => Rule.required().min(1),
            },
          ],
          preview: {
            select: {
              title: 'productName',
              subtitle: 'price',
              quantity: 'quantity',
            },
            prepare(selection: any) {
              return {
                title: selection.title,
                subtitle: `${selection.subtitle} x${selection.quantity || 1}`,
              }
            },
          },
        },
      ],
      validation: (Rule: any) => Rule.required().min(1),
    },

    {
      name: 'orderTotal',
      title: 'Order Total',
      type: 'string',
      readOnly: true,
    },
  ],

  preview: {
    select: {
      title: 'orderNumber',
      customerName: 'customerName',
      status: 'status',
      trackingNumber: 'trackingNumber',
    },
    prepare(selection: any) {
      const trackingLabel = selection.trackingNumber ? ` - ${selection.trackingNumber}` : ''
      return {
        title: selection.title,
        subtitle: `${selection.customerName || 'Customer'} - ${selection.status || 'new'}${trackingLabel}`,
      }
    },
  },
}