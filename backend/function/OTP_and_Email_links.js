const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const UsersModel = require('../model/Users.js');
const jwt = require('jsonwebtoken');
const { transporter } = require('../config/Email.js');

router.post('/send-otp', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await UsersModel.findOne({ email });
  
      if (!user.verifyStatus) {
        return res.status(403).json({ error: 'OTP sent failed! Please verify your email' });
      }
      
      if (!user) return res.status(404).json({ error: 'Email not found' });
  
      // Tạo mã OTP 6 số
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiration = Date.now() + 300000; // 5 phút
  
      await UsersModel.updateOne(
        { _id: user._id },
        {
          $set: { otp, otpExpiration },
          $inc: { otpAttempts: 1 }
        }
      );
  
      // Gửi email chứa OTP (sử dụng Nodemailer)
      const mailOptions = {
        to: email,
        subject: 'Your Login OTP - LOGICAL',
        text: `Your OTP code is: ${otp} (Valid for 5 minutes)`
      };
      
      await transporter.sendMail(mailOptions);
      res.json({ message: 'OTP sent' });
      
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Route xác thực OTP
router.post('/verify-otp', async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await UsersModel.findOne({ email });
  
      if (!user.verifyStatus) {
        return res.status(403).json({ error: 'Login failed! Please verify your email' });
      }
      
      if (!user) return res.status(404).json({ error: 'Invalid OTP' });
      if (user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
      if (Date.now() > user.otpExpiration) return res.status(400).json({ error: 'OTP expired' });
  
      // Tạo JWT token như đăng nhập thông thường
      const token = jwt.sign(
        { email: user.email, id: user._id }, 
        "jwt-secret-key", 
        { expiresIn: "2h" }
      );

      res.status(200).json({
        message: "Login successfully!",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Route xác thực email
router.get('/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) return res.status(400).send('Invalid verification link');
  
      const user = await UsersModel.findOne({ 
        verifyToken: token,
        verifyTokenExpiry: { $gt: Date.now() }
      });
  
      if (!user) return res.status(400).send('Link invalid or expired');
  
      user.verifyStatus = true;
      user.verifyToken = undefined;
      user.verifyTokenExpiry = undefined;
      await user.save();
  
      res.send('Email verified successfully! You can now login.');
    } catch (err) {
      res.status(500).send('Server error');
    }
  });

module.exports = router;