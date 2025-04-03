const mongoose = require('mongoose');

const PuzzleHistorySchema = new mongoose.Schema({
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

module.exports = mongoose.model('PuzzleHistory', PuzzleHistorySchema);