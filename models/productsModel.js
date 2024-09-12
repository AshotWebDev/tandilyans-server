import mongoose, { Schema } from "mongoose";
// Define the Cart schema
const productsSchema = new mongoose.Schema({
    name:{type:String, required:true},
    price:{type:Number, required:true},
    img:{type:String, required:true},
    description:{type:String, required:true},
}, {
  timestamps: true  
});



const Product = mongoose.model('Products', productsSchema);
export default Product
