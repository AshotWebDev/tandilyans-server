import Product from '../../models/productsModel.js';
import connectDB from '../../Utils/connection.js';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const products = await Product.find();
      res.status(200).json(products.reverse());
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}