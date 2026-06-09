import { createClient } from '@sanity/client'

const sanityProjectId = (process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'j7s2sxwm').trim()
const sanityDataset = (process.env.VITE_SANITY_DATASET || process.env.SANITY_DATASET || 'production').trim()

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email } = req.query // Mengambil email dari query parameter

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' })
  }

  try {
    const client = createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: '2025-05-01',
      useCdn: true, // Menggunakan CDN untuk operasi baca
    })

    // Mengambil pesanan untuk userId yang diberikan, diurutkan berdasarkan tanggal pembelian terbaru
    const orders = await client.fetch(`*[_type == "order" && customerEmail == $email] | order(orderedAt desc){
      _id,
      orderNumber,
      customerName,
      customerEmail,
      shippingAddress,
      notes,
      orderTotal,
      orderedAt,
      status,
      paymentMethod,
      paypalTransactionId,
      shippingCourier,
      trackingNumber,
      items[]{
        _key,
        productId,
        productName,
        price, // Ini adalah harga per item dalam USD
        quantity,
      }
    }`, { email })

    // Untuk mendapatkan gambar produk, kita perlu mengambil detail produk untuk setiap item.
    // Ini dilakukan di server untuk menghindari masalah N+1 pada klien.
    const ordersWithImages = await Promise.all(orders.map(async (order) => {
      const itemsWithImages = await Promise.all(order.items.map(async (item) => {
        const product = await client.fetch(`*[_id == $productId][0]{
          "image": image.asset->url
        }`, { productId: item.productId });
        return {
          ...item,
          image: product?.image || null, // Menambahkan URL gambar
        };
      }));
      return {
        ...order,
        items: itemsWithImages,
      };
    }));

    // Memformat total dan harga item agar sesuai dengan ekspektasi klien (string mata uang)
    const formattedOrders = ordersWithImages.map(order => {
      const formattedItems = order.items.map(item => ({
        id: item.productId, // Klien mengharapkan 'id'
        name: item.productName,
        price: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(item.price)), // Memformat harga item
        quantity: item.quantity,
        image: item.image,
      }));

      return {
        id: order.orderNumber, // Klien mengharapkan 'id'
        items: formattedItems,
        purchasedAt: order.orderedAt,
        total: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(order.orderTotal)),
        userEmail: order.customerEmail,
        userName: order.customerName,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        notes: order.notes,
        status: order.status,
        trackingNumber: order.trackingNumber,
        shippingCourier: order.shippingCourier,
      };
    });

    return res.status(200).json({ orders: formattedOrders })
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return res.status(500).json({ message: 'Failed to fetch orders.', error: error.message })
  }
}