const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { transporter } = require('../config/Email.js');

router.post('/send-feedback', async (req, res) => {
    try {
      const { name, email, feedback } = req.body;
  
      // Gửi email cho admin
      const adminMailOptions = {
        to: 'logical.playgaming@gmail.com',
        subject: 'New Feedback from User',
        html: `
          <h3>New Feedback Received</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Feedback:</strong> ${feedback}</p>
        `
      };
  
      // Gửi email tự động cho người dùng
      const userMailOptions = {
        to: email,
        subject: 'Thank You for Your Feedback - LOGICAL',
        text: `Hello,\n\nThank you for your feedback, we will try to answer you as soon as possible, around 1-7 business days.\n\nBest regards,\nLOGICAL Supporting Team\n\n*This is an automated email from the LOGICAL system, please don't respond to this email*`
      };
  
      await transporter.sendMail(adminMailOptions);
      await transporter.sendMail(userMailOptions);
  
      res.status(200).json({ message: 'Feedback submitted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;