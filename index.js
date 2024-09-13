// import express from 'express';
// import { products } from './products.js';
// import cors from 'cors';
// import { admins } from './admin.js';
// import connectDB from './Utils/connection.js';
// import { config } from 'dotenv';
// import Product from './models/productsModel.js';
// import multer from 'multer';
// import path from "path"
// import fs from 'fs';
// import uuid from "uuid"


// const app = express();
// const PORT = 4000;
// const db= connectDB();
// // server.setTimeout(300000); 
// config()
// app.use(cors())

// app.use(express.json());


// const storage = multer.diskStorage({ 
//     destination: (req, file, cb) => { 
//       cb(null, 'uploads/'); 
//     }, 
//     filename: (req, file, cb) => { 
//       cb(null, uuid.v4() + path.extname(file.originalname)); 
//     }, 
//      }); 
      
//      const upload = multer({ storage }); 
      
//      // Ensure the uploads directory exists 
//      if (!fs.existsSync('uploads')) { 
//     fs.mkdirSync('uploads'); 
//      }


// app.post('/api/products',async(req, res) => {
//     const {productName,price,img,description} = req.body;


    
// const buffer = Buffer.from(img, 'base64') 
   
// const now = new Date(); 

 

// const fileName = `${Date.now()}.jpg`; 
// const filePath = path.join(__dirname, 'uploads', fileName); 

// fs.writeFile(filePath, buffer, (err) => { 
//   if (err) { 
//  console.error(err); 
//   } else { 
  
//   } 
// }); 
// const imageUrl = `uploads/${fileName}`;



    
//     const product=new Product({
//         name:productName,
//         price,
//         imageUrl,
//         description
//     })    
//     await product.save();
//     res.send({message:"added"});
// })

//  app.get('/api/products',async (req, res) => {
//     const products=await Product.find();
//     res.json(products);
//  })

// app.get('/api/products/:id',async (req, res) => {
//     const id = req.params.id;
//     const product=await Product.findById(id);
//     res.json(product);
// })





// // app.put('/api/products/:id', (req, res) => {
// //     const product = req.body;
// //     const index = products.findIndex((p) => p.id === req.params.id);
// //     products[index] = product;
// //     res.send(products);
// // })


// app.delete('/api/products/:id', (req, res) => {
//     const id = req.params.id;
//     const product= Product.findByIdAndDelete(id);
//     res.send({message:"deleted"});
// })



// // ==========================================

// app.get('/api/admins', (req, res) => {
//     res.json(admins);
// })

// app.listen(4000, () => {
//     console.log("Server started on port 4000");
// });


import express from 'express';
import cors from 'cors';
import { products } from './products.js';
import { admins } from './admin.js';
import connectDB from './Utils/connection.js';
import Product from './models/productsModel.js';
import multer from 'multer';
import path from "path";
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid'; // Corrected import for uuid
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
config();
const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename);



const app = express();
const db = connectDB();

app.use(cors());
app.use(express.json());

// Setting up multer storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + path.extname(file.originalname)); // Use uuid for file names
    },
});

const upload = multer({ storage });

// Ensure the uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// POST route to upload product with image
app.post('/api/products', upload.single('img'), async (req, res) => {
    try {
        const { productName, price, description } = req.body;
        const imgFile = req.file;

        if (!imgFile) {
            return res.status(400).json({ message: 'Image file is required' });
        }

        const imageUrl = `uploads/${imgFile.filename}`;

        const product = new Product({
            name: productName,
            price,
            imageUrl,
            description,
        });

        await product.save();
        res.send({ message: "Product added", product });
    } catch (error) {
        console.error('Error while uploading product:', error);
        res.status(500).json({ message: 'Error adding product', error });
    }
});

// GET all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error while fetching products:', error);
        res.status(500).json({ message: 'Error fetching products', error });
    }
});

// GET a single product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error while fetching product:', error);
        res.status(500).json({ message: 'Error fetching product', error });
    }
});

// DELETE a product by ID
app.delete('/api/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.send({ message: "Product deleted" });
    } catch (error) {
        console.error('Error while deleting product:', error);
        res.status(500).json({ message: 'Error deleting product', error });
    }
});

// GET admins (example route)
app.get('/api/admins', (req, res) => {
    res.json(admins);
});

app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});
