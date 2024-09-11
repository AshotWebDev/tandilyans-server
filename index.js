import express from 'express';
import { products } from './products.js';
import cors from 'cors';
import { admins } from './admin.js';
const app = express();
const PORT = 4000;

app.use(cors())

app.use(express.json());

app.post('/api/products', (req, res) => {
    const product = req.body;
    
    const newProd = { ...product, id: products.length + 1 };
    products.push(newProd);
    
    res.send(products);

})

 app.get('/api/products', (req, res) => {
    res.json(products);
 })

app.get('/api/products/:id', (req, res) => {
    const product = products.find((p) => p.id === req.params.id);
    res.json(product);
})





app.put('/api/products/:id', (req, res) => {
    const product = req.body;
    const index = products.findIndex((p) => p.id === req.params.id);
    products[index] = product;
    res.send(products);
})


app.delete('/api/products/:id', (req, res) => {
    const index = products.findIndex((p) => p.id === req.params.id);
    products.splice(index, 1);
    res.send(products);
})



// ==========================================

app.get('/api/admins', (req, res) => {
    res.json(admins);
})

app.listen(4000, () => {
    console.log("Server started on port 4000");
});