import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();


 async function handler(req, res) {
  const { fullName, productName, phone, message, email } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: 'poghosyan.01@list.ru',
    subject: `New Order from ${fullName}`,
    text: `You have a new order:\n
           Full Name: ${fullName}\n
           Email: ${email}\n
           ${productName && `Product Name: ${productName}\n`}
           ${phone && `Phone: ${phone}\n`}
           Message: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}


 router.post('/', handler)


export default router;