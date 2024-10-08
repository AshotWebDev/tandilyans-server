// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//     //   useNewUrlParser: true,
//     //   useUnifiedTopology: true,
//     //   useCreateIndex: true, // If using Mongoose 5.x, may be needed for unique indexes
//     });

//     console.log(`MongoDB Connected`);
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     process.exit(1); // Exit with failure
//   }
// };

// export default connectDB;


import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return; 

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('Connected to MongoDB');
};

export default connectDB;