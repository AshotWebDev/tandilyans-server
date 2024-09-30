import express from 'express';
import { admins } from '../../admin.js'; // Adjust the path as necessary

const router = express.Router();

function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(admins);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

router.get('/', handler); // Change the route to use the base path

export default router;
