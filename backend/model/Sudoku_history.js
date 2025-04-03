const mongoose = require('mongoose');

const SudokuHistorySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users',
    required: true 
  },
  level: String,
  time: String,
  hint: String,
  moves: Number,
  timePlayed: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('SudokuHistory', SudokuHistorySchema);