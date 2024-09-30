import mongoose, { Schema } from "mongoose";
// Define the Cart schema
const productsSchema = new mongoose.Schema({
    name:{type:String},
    price:{type:Number},
    img:{type:String },
    description:{type:String},
});



const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product
