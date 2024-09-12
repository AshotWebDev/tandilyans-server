import mongoose, { Schema } from "mongoose";
// Define the Cart schema
const adminsSchema = new mongoose.Schema({
    username:{type:String, required:true},
    password:{type:String, required:true},
}, {
  timestamps: true  
});

const Admin = mongoose.model('Admins', adminsSchema);
export default Admin