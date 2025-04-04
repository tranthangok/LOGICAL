const mongoose = require('mongoose');

const SolitaireHistorySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users',
    required: true 
  },
  time: String,
  hint: Number,
  moves: Number,
  timePlayed: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('SolitaireHistory', SolitaireHistorySchema);