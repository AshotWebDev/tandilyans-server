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
import axios from 'axios';
import FormData from 'form-data';
// import uuid from "uuid"

config()
const app = express();
const db = connectDB();

app.use(cors())

app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const upload = multer({ dest: 'uploads/' }); // Store locally temporarily for processing


app.post('/api/products/add', upload.single('img'), async (req, res) => {
    try {
        const { productName, description, price } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Create a readable stream for the uploaded file
        const fileStream = fs.createReadStream(file.path);

        // Create FormData and append the file stream
        const formData = new FormData();
        formData.append('file', fileStream);
        formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);

        // Upload to Cloudinary
        const cloudinaryRes = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        // Get the image URL from the response
        const imageUrl = cloudinaryRes.data.secure_url;

        // Create a new product
        const product = new Product({
            name: productName,
            price,
            description,
            img: imageUrl,
        });

        await product.save();

        // Clean up the temporary file
        fs.unlinkSync(file.path);

        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error uploading product:', error.message);
        res.status(500).json({ error: 'Failed to upload product' });
    }
});
// app.use(bodyParser.json({ limit: '2000mb' })); // Set to 50mb, you can adjust the size limit
// app.use(bodyParser.urlencoded({ limit: '2000mb', extended: false, parameterLimit: 500000 }));

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const dir = 'uploads/';
//         // Create the directory if it doesn't exist
//         if (!fs.existsSync(dir)) {
//             fs.mkdirSync(dir, { recursive: true });
//         }
//         cb(null, dir);
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });
// const storage = multer.diskStorage({
    
//     destination: function (req, file, cb) {

//         cb(null, 'uploads/'); // Directory where files will be stored
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
//     }
// });
// const upload = multer({ storage: storage });
// upload.single('image'),


app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products.reverse());
})

app.get('/api/products/:id', async (req, res) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    res.json(product);
})
// app.post('/api/products/add', upload.single('img'), async (req, res) => {
//     try {
//         // Access form fields and file
//         const { productName, description, price } = req.body;
//         const file = req.file;
//         const product = new Product({
//             name: productName,
//             price,
//             description,
//             img: `/uploads/${file.filename}`,//file.filename
//         })
//         await product.save();
//         // Handle form data and file
//         // console.log('Product Name:', productName);
//         // console.log('Description:', description);
//         // console.log('Price:', price);
//         if (file) {
//             console.log('File:', file.filename); // File information
//         }

//         // Respond with success message
//         const products = await Product.find();
//         res.status(200).json(products);
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'Failed to upload product' });
//     }
// });

// app.get("/:image",(req,res)=>{
//     try {
//       const image = req.params.image;
//       const imagePath = path.join(__dirname,"..", "uploads", image);
    
//       // Check if the file exists
//       if (image && imagePath) {
//         res.sendFile(imagePath);
//       } else {
//         res.status(404).send("Image not found");
//       }
//     } catch (error) {
//       console.error(error)
//     }
//   })



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
