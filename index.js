import express from 'express'; // Import express
import cors from 'cors'; // Import CORS
import productsRouter from './api/products/index.js'; // Import your products router
import adminsRouter from './api/products/admins.js'; // Ensure the path is correct
import addRouter from './api/products/add.js'; // Correct path to add router
import delRouter from './api/products/[id].js';
import sendEmailRouter from './api/products/send-email.js';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors()); // Use CORS middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use('/api/products', productsRouter); // Use your products router
app.use('/api/admins', adminsRouter); // Change the base path for the admins router
app.use('/api/add', addRouter); // Use the add router
app.use('/api/del', delRouter);
app.use('/api/send-email', sendEmailRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
