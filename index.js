import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import multer from 'multer';
import cloudinary from 'cloudinary';
import bodyParser from 'body-parser';
import Product from './models/productsModel.js';
import connectDB from './Utils/connection.js';

config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '2000mb' }));
app.use(bodyParser.urlencoded({ limit: '2000mb', extended: false, parameterLimit: 500000 }));

// Cloudinary Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Configuration for file handling
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

// POST request for product creation with image upload to Cloudinary
app.post('/api/products', upload.single('img'), async (req, res) => {
  try {
    const { productName, description, price } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload the image to Cloudinary
    const result = await cloudinary.v2.uploader.upload_stream(
      { folder: 'uploads', resource_type: 'image' },
      async (error, result) => {
        if (error) {
          console.error('Error uploading image:', error);
          return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
        }

        // Create and save product
        const product = new Product({
          name: productName,
          price,
          description,
          img: result.secure_url, // Cloudinary URL
        });

        await product.save();
        const products = await Product.find();
        res.status(200).json(products);
      }
    );

    // Write the image buffer to Cloudinary
    file.buffer.pipe(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to upload product' });
  }
});

app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products.reverse());
});

app.get('/api/products/:id', async (req, res) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  res.json(product);
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete image from Cloudinary
    const public_id = product.img.split('/').pop().split('.')[0]; // Extract Cloudinary public_id
    await cloudinary.v2.uploader.destroy(public_id);

    // Delete product from database
    await Product.findByIdAndDelete(productId);

    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.get('/api/admins', (req, res) => {
  res.json(admins);
});

app.post('/api/send-email', async (req, res) => {
  const { fullName, productName, phone, message, email } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password',
    },
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'recipient-email@gmail.com',
    subject: `New Order from ${fullName}`,
    text: `You have a new order:\n
           Full Name: ${fullName}\n
           Email: ${email}\n
           ${productName && `Product Name: ${productName}\n`}
           ${phone && `Phone: ${phone}\n`}
           Message: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ text: 'Order successfully placed. We will contact you within 24 hours.', variant: 'success' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ text: 'Error. Please try again.', variant: 'destructive' });
  }
});

// Export the app as a handler for Vercel
export default app;
