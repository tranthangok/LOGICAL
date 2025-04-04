const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const saltRounds = 10;
const UsersModel = require('../model/Users.js');
const { transporter } = require('../config/Email.js');

// Route đăng nhập
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await UsersModel.findOne({ email: email });
      if (!user) {
        return res.status(404).json("User not found.");
      }
      if (!user.verifyStatus) {
        return res.status(403).json({ error: "Login failed! Please verify your email" });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json("The email or password is not correct.");
      }
  
          // Tạo JWT token
          const token = jwt.sign(
              { email: user.email, id: user._id }, 
              "jwt-secret-key", 
              { expiresIn: "2h" }
          );
  
          res.status(200).json({
            message: "Login successfully!",
            token, // Thêm token vào response
            user: {
              id: user._id,
              name: user.name,
              email: user.email
            }
          });
      
        } catch (err) {
          res.status(500).json("Internal server error.");
        }
  });

// Route đăng ký
router.post('/signup', async (req, res) => {
  try {
    const existingUser = await UsersModel.findOne({ email: req.body.email });
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExpiry = Date.now() + 172800000; // 2 months 
    if (existingUser) {
      return res.status(400).json({ error: 'This email has been used' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    
    const newUser = await UsersModel.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        verifyToken,
        verifyTokenExpiry
    });

    res.status(201).json({ 
        message: 'Account created successfully. Verify link sent, please check your inbox.',
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email
        }
    });

    const verificationLink = `http://localhost:3000/api/otp/verify-email?token=${verifyToken}`;

    const mailOptions = {
      to: newUser.email,
      subject: 'Verify Your Email - LOGICAL',
      html: `Click <a href="${verificationLink}">here</a> to verify your email.`
    };

    await transporter.sendMail(mailOptions);
    
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/logout', (req, res) => {
  res.status(200).json({ 
    message: 'Logged out successfully' 
  });
});
  // Thêm route để cập nhật thông tin user
router.get('/user', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]; // Đọc từ header
      if (!token) return res.status(401).json({ error: "Unauthorized" });
  
      const decoded = jwt.verify(token, "jwt-secret-key");
      const user = await UsersModel.findById(decoded.id);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      res.json({
        id: user._id,
        name: user.name,
        email: user.email
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
  
      const user = await UsersModel.findOne({ 
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() }
      });
  
      if (!token) return res.status(400).json({ error: 'Missing token' });
  
      if (!user) {
        return res.status(400).json({ 
          error: 'Link has expired. Please request a new password reset.' 
        });
      }
  
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }
  
      // Thêm validate password
      const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
      if (!strongRegex.test(newPassword)) {
        return res.status(400).json({ error: 'Password does not meet requirements' });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      
      await user.save();
      
      res.status(200).json({ message: 'Password updated successfully' });
      
    } catch (err) {
      console.error('Reset password error:', err); 
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;