import express from 'express';
import { products } from './products.js';
import cors from 'cors';
import { admins } from './admin.js';
import connectDB from './Utils/connection.js';
import Product from './models/productsModel.js';
const app = express();
const PORT = 4000;
const db= connectDB();
// server.setTimeout(300000); 

app.use(cors())

app.use(express.json());


app.post('/api/products',async(req, res) => {
    const {productName,price,img,description} = req.body;
    
    const product=new Product({
        name:productName,
        price,
        img,
        description
    })    
    await product.save();
    res.send({message:"added"});
})

 app.get('/api/products',async (req, res) => {
    const products=await Product.find();
    res.json(products);
 })

app.get('/api/products/:id',async (req, res) => {
    const id = req.params.id;
    const product=await Product.findById(id);
    res.json(product);
})





// app.put('/api/products/:id', (req, res) => {
//     const product = req.body;
//     const index = products.findIndex((p) => p.id === req.params.id);
//     products[index] = product;
//     res.send(products);
// })


app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const product= Product.findByIdAndDelete(id);
    res.send({message:"deleted"});
})



// ==========================================

app.get('/api/admins', (req, res) => {
    res.json(admins);
})

app.listen(4000, () => {
    console.log("Server started on port 4000");
});