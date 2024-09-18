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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Directory where files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});
const upload = multer({ storage: storage });
// upload.single('image'),
app.post('/api/products', upload.single('img'), async (req, res) => {
    try {
        // Access form fields and file
        const { productName, description, price } = req.body;
        const file = req.file;
        const product = new Product({
            name: productName,
            price,
            description,
            img: `/uploads/${file.filename}`,//file.filename
        })
        await product.save();
        // Handle form data and file
        console.log('Product Name:', productName);
        console.log('Description:', description);
        console.log('Price:', price);
        if (file) {
            console.log('File:', file.filename); // File information
        }

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

        // Delete image file from the server
        const filePath = path.join(__dirname, 'uploads', path.basename(product.img));
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                return res.status(500).json({ error: 'Failed to delete file' });
            }



        });
        // Delete product from database
        await Product.findByIdAndDelete(productId)

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
