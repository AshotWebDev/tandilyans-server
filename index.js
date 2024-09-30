import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config(); // Load environment variables
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Define your routes
app.use('/api/products', require('./api/products/index').default);

const PORT = process.env.PORT || 4000; // Default to 4000 if not specified
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
