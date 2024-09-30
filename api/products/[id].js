import Product from '../../models/productsModel';
import connectDB from '../../Utils/connection';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const filePath = path.join('/tmp', path.basename(product.img));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);  // Remove image file from Vercel's temporary storage
      }

      await Product.findByIdAndDelete(id);
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
