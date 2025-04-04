const express = require('express');
const router = express.Router();
const SudokuHistory = require('../model/Sudoku_history');
const PuzzleHistory = require('../model/Puzzle_history');
const SolitaireHistory = require('../model/Solitaire_history');
const jwt = require('jsonwebtoken');
const UsersModel = require('../model/Users.js');

router.post('/save-sudoku-history', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    // Giải mã token để lấy userId
    const decoded = jwt.verify(token, "jwt-secret-key");
    const userId = decoded.id; // Sử dụng trực tiếp decoded.id

    const newHistory = await SudokuHistory.create({
      user: userId, // Sử dụng userId đã giải mã
      level: req.body.level,
      time: req.body.time,
      hint: req.body.hint,
      moves: req.body.moves
    });

    // Xóa bản ghi cũ (giữ lại 5 bản ghi mới nhất)
    await SudokuHistory.find({ user: userId })
      .sort({ timePlayed: -1 })
      .skip(5)
      .then(oldRecords => {
        oldRecords.forEach(async (record) => {
          await SudokuHistory.findByIdAndDelete(record._id);
        });
      });

    res.status(200).json(newHistory);
  } catch (error) {
    console.error('Save history error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/get-sudoku-history/:userId', async (req, res) => {
  try {
    const history = await SudokuHistory.find({ user: req.params.userId })
      .sort({ timePlayed: -1 })
      .limit(5);
      
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/save-puzzle-history', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, "jwt-secret-key");
    
    const newHistory = await PuzzleHistory.create({
      user: decoded.id,
      level: req.body.level,
      time: req.body.time,
      hint: req.body.hint,
      moves: req.body.moves
    });

    await PuzzleHistory.find({ user: decoded.id })
      .sort({ timePlayed: -1 })
      .skip(5)
      .then(oldRecords => {
        oldRecords.forEach(async (record) => {
          await PuzzleHistory.findByIdAndDelete(record._id);
        });
      });

    res.status(200).json(newHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/get-puzzle-history/:userId', async (req, res) => {
  try {
    const history = await PuzzleHistory.find({ user: req.params.userId })
      .sort({ timePlayed: -1 })
      .limit(5);
      
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/save-solitaire-history', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, "jwt-secret-key");
    
    const newHistory = await SolitaireHistory.create({
      user: decoded.id,
      time: req.body.time,
      hint: req.body.hint,
      moves: req.body.moves
    });

    await SolitaireHistory.find({ user: decoded.id })
      .sort({ timePlayed: -1 })
      .skip(5)
      .then(oldRecords => {
        oldRecords.forEach(async (record) => {
          await SolitaireHistory.findByIdAndDelete(record._id);
        });
      });

    res.status(200).json(newHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/get-solitaire-history/:userId', async (req, res) => {
  try {
    const history = await SolitaireHistory.find({ user: req.params.userId })
      .sort({ timePlayed: -1 })
      .limit(5);
      
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;