import express from 'express';
import { products } from './products.js';
import cors from 'cors';
import { admins } from './admin.js';
import connectDB from './Utils/connection.js';
import { config } from 'dotenv';
import Product from './models/productsModel.js';
import multer from 'multer';
import path from "path"
import fs from 'fs';
import { Buffer } from 'buffer';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
// import uuid from "uuid"

config()
const app = express();
const db = connectDB();

app.use(cors())

app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.json({ limit: '2000mb' })); // Set to 50mb, you can adjust the size limit
app.use(bodyParser.urlencoded({ limit: '2000mb', extended: false, parameterLimit: 500000 }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/products', upload.single('img'), async (req, res) => {
    try {
        // Access form fields and file
        const { productName, description, price } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // For demonstration, let's log the file buffer and filename
        console.log('File buffer:', file.buffer);
        console.log('File original name:', file.originalname);

        // Here, you should implement the logic to upload the file to a cloud service
        // and get the URL or handle the file data as needed.

        // Example: Convert buffer to base64 (not recommended for large files)
        const imgBase64 = file.buffer.toString('base64');
        
        // Create a new product with the image data
        const product = new Product({
            name: productName,
            price,
            description,
            img: imgBase64, // Store base64 data or URL if uploaded elsewhere
        });

        await product.save();

        // Respond with success message
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to upload product' });
    }
});

app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products.reverse());
})

app.get('/api/products/:id', async (req, res) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    res.json(product);
})





// app.put('/api/products/:id', (req, res) => {
//     const product = req.body;
//     const index = products.findIndex((p) => p.id === req.params.id);
//     products[index] = product;
//     res.send(products);
// })

app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Construct the file path for deletion
        const filePath = path.join(__dirname, 'uploads', path.basename(product.img));

        // Delete the file from the local file system
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                return res.status(500).json({ error: 'Failed to delete file' });
            }
            console.log('File deleted successfully');
        });

        // Delete product from the database
        await Product.findByIdAndDelete(productId);

        // Respond with success message
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});


// ==========================================

app.get('/api/admins', (req, res) => {
    res.json(admins);
})



// =====================================


app.post('/api/send-email', async (req, res) => {
    const { fullName, productName, phone, message, email } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail', // or use another email service
      auth: {
        user: 'ashotpoghosyan380@gmail.com', // replace with your email
        pass: 'utriacrgjunftuvf', // replace with your email password
      },
    });
  
    const mailOptions = {
      from: 'ashotpoghosyan380@gmail.com', // sender address
      to: 'poghosyan.01@list.ru',   // recipient email
      subject: `New Order from ${fullName}`, // Subject line
      text: `You have a new order:\n
             Full Name: ${fullName}\n
             Email: ${email}\n
             ${productName && `Product Name: ${productName}\n`}
            ${phone && `Phone: ${phone}\n`}  
             Message: ${message}`,
    };
  
    try {
      // Send the email
      await transporter.sendMail(mailOptions);
      res.status(200).send({text: 'Պատվերը հաջողությամբ կատարվել է։ Մենք կապ կհաստատենք ձեզ հետ 24 ժամվա ընթացքում։', variant: 'success'});
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send({text: 'Սխալ։ Խնդրում ենք կրկին փորձել։', variant: 'destructive'});
    }
  });


// ======================================

app.listen(process.env.PORT, () => {
    console.log("Server started on port 4000");
});
