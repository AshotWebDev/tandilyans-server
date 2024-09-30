import multer from 'multer';
import fs from 'fs';
import axios from 'axios';
import Product from '../../models/productsModel.js';
import connectDB from '../../Utils/connection.js';
import FormData from 'form-data';
import express from 'express';

const router = express.Router();

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({ dest: '/tmp' });

async function handler(req, res) {
  await connectDB();

  upload.single('img')(req, res, async (err) => {
    if (err) return res.status(500).json({ error: 'File upload failed' });

    const { productName, description, price } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    try {
      const fileBuffer = fs.readFileSync(file.path);

      const formData = new FormData();
      formData.append('file', fileBuffer, file.originalname);
      formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        { headers: formData.getHeaders() }
      );

      const product = new Product({
        name: productName,
        price,
        description,
        img: cloudinaryRes.data.secure_url,
      });

      await product.save();
      fs.unlinkSync(file.path);  // Clean up temp file

      const products = await Product.find();
      res.status(200).json(products.reverse());
    } catch (error) {
      console.error('Error uploading product:', error.message);
      res.status(500).json({ error: 'Failed to upload product' });
    }
  });
}

router.post('/', handler);



export default router;
