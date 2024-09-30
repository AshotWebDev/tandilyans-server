import express from 'express'; // Import express
import Product from '../../models/productsModel.js'; // Ensure the correct import path and file extension
import connectDB from '../../Utils/connection.js'; // Ensure the correct import path and file extension
import path from 'path';
import fs from 'fs';

const router = express.Router();

async function handler(req, res) {
  await connectDB(); // Connect to the database

  const { id } = req.params; // Use req.params to get the ID from the route

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
        fs.unlinkSync(filePath);  // Remove image file from temporary storage
      }

      await Product.findByIdAndDelete(id);

      // Get updated list of products excluding the deleted one
      const products = await Product.find();
      res.status(200).json(products.reverse());
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Correctly configure the route to capture the product ID
router.route('/:id').get(handler).delete(handler);

export default router;
