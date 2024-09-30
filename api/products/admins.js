import { admins } from '../../admin';

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(admins);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
