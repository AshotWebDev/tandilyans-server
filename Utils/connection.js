import mongoose from "mongoose";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://ashotpoghosyan380:cG4nmfHBO85rw57C@cluster0.60kqp.mongodb.net/Tandilyans", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    //   useCreateIndex: true, // If using Mongoose 5.x, may be needed for unique indexes
    });

    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

export default connectDB;
