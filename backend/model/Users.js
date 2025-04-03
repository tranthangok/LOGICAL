const mongoose = require('mongoose')

const UsersSchema = new mongoose.Schema({
    name: String,
    email: {
      type: String,
      unique: true
    },
    password: String,
    otp: String,
    otpExpiration: Date,
    otpAttempts: { type: Number, default: 0 },
    verifyStatus: { type: Boolean, default: false },
    verifyToken: String,
    verifyTokenExpiry: Date
  });

const UsersModel = mongoose.model("users", UsersSchema)
module.exports = UsersModel
