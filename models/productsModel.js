import mongoose, { Schema } from "mongoose";
// Define the Cart schema
const productsSchema = new mongoose.Schema({
    name:{type:String},
    price:{type:Number},
    img:{type:String },
    description:{type:String},
}, {
  timestamps: true  
});



const Product = mongoose.model('Products', productsSchema);
export default Product
