const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const app = express();
const UsersModel = require('./model/Users.js');
const path = require('path');
const PORT = process.env.PORT || 3000;
require('dotenv').config();

const authRouter = require('./function/Auth.js');
const feedbackRouter = require('./function/Feedback.js');
const otpEmailRouter = require('./function/OTP_and_Email_links.js');
const gameDataRouter = require('./function/Game_data');

app.use(
  cors({
    origin: ['https://logical-sage.vercel.app'],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
    credentials: false
  })
);

app.options('*', cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRouter);
app.use('/api/feedback', feedbackRouter); 
app.use('/api/game', gameDataRouter); 
app.use('/api/otp', otpEmailRouter); 

app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "Server is running",
    api: {
      auth: "/api/auth",
      feedback: "/api/feedback",
      game: "/api/game",
      otp: "/api/otp"
    }
  });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
