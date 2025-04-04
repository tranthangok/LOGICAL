import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './sudoku_play.css';
import axios from 'axios';

const createValidGrid = () => {
  const grid = Array(9).fill().map(() => Array(9).fill(0));
  let attempts = 0;
  
  const fillGrid = (grid, row = 0, col = 0) => {
    if (attempts++ > 1000000) throw new Error("Timeout generating grid");
    if (row === 9) return true;
    if (col === 9) return fillGrid(grid, row + 1, 0);
    if (grid[row][col] !== 0) return fillGrid(grid, row, col + 1);

    const numbers = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
    for (let num of numbers) {
      if (isValidPlacement(grid, row, col, num)) {
        grid[row][col] = num;
        if (fillGrid(grid, row, col + 1)) return true;
        grid[row][col] = 0;
      }
    }
    return false;
  };

  try {
    fillGrid(grid);
    return grid;
  } catch (e) {
    console.error("Failed to generate grid, using fallback");
    return Array(9).fill().map((_, i) => 
      Array.from({length: 9}, (_, j) => (i * 3 + j) % 9 + 1)
    );
  }
};

const isValidPlacement = (grid, row, col, num) => {
  if (grid[row].includes(num)) return false;
  if (grid.some(r => r[col] === num)) return false;
  const boxRow = Math.floor(row/3) * 3;
  const boxCol = Math.floor(col/3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[boxRow + i][boxCol + j] === num) return false;
    }
  }
  return true;
};

const removeCells = (grid, emptyCells) => {
    const newGrid = grid.map(row => [...row]);
    const cells = Array.from({length: 81}, (_, i) => i);
    
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
  
    cells.slice(0, emptyCells).forEach(index => {
      const row = Math.floor(index/9);
      const col = index % 9;
      newGrid[row][col] = 0;
    });
  
    return newGrid;
};

const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="sudoku-play-confirm-dialog">
      <div className="sudoku-play-confirm-content">{message}</div>
      <div className="sudoku-play-confirm-buttons">
        <button className="sudoku-play-confirm-btn yes" onClick={onConfirm}>Yes</button>
        <button className="sudoku-play-confirm-btn no" onClick={onCancel}>No</button>
      </div>
    </div>
  );
};

// Thêm component CustomAlert
const CustomAlert = ({ message, type }) => {
  return (
    <div className={`sudoku-play-confirm-dialog ${type}`}>
      <div className="sudoku-play-confirm-content">{message}</div>
    </div>
  );
};

const SudokuPlay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [grid, setGrid] = useState(Array(9).fill().map(() => Array(9).fill({ value: '', fixed: false })));
  const [solvedGrid, setSolvedGrid] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [difficulty] = useState(location.state?.difficulty || 'Easy');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const cellRef = useRef(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [customAlert, setCustomAlert] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false); 
  const [hintsRemaining, setHintsRemaining] = useState(
    location.state?.hintMode === 'Limited' 
      ? parseInt(location.state?.hintLimit || 3)
      : Infinity
  );
  const [checkedCells, setCheckedCells] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [incorrectCells, setIncorrectCells] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (cellRef.current && selectedCell) {
      cellRef.current.focus();
    }
  }, [selectedCell]);

  // Check win condition

  useEffect(() => {
    if (grid.flat().every(cell => cell.value !== '') && !isSolved) {
      const userGrid = grid.map(row => row.map(cell => parseInt(cell.value)));
      const isCorrect = userGrid.every((row, i) => 
        row.every((num, j) => num === solvedGrid[i][j])
      );
      
      if (isCorrect) {
        setIsSolved(true);
        setShowSuccess(true);
        createConfetti();
        setTimeout(() => setShowSuccess(false), 3000);
  
        // Gọi hàm lưu lịch sử
          const saveHistory = async () => {
            try {
              const token = localStorage.getItem('token');
              if (!token) return;
          
              const userResponse = await axios.get('https://logical-backend.vercel.app/api/auth/user', {
                headers: { Authorization: `Bearer ${token}` }
              });
          
              // Kiểm tra cấu trúc response
              console.log('User response:', userResponse.data); 
          
              await axios.post(
                'https://logical-backend.vercel.app/api/game/save-sudoku-history',
                {
                  userId: userResponse.data.id,
                  level: difficulty,
                  time: formatTime(),
                  hint: hintsRemaining,
                  moves: moves
                },
                {
                  headers: { Authorization: `Bearer ${token}` }
                }
              );
            } catch (error) {
              console.error('Error saving history:', error);
            }
          };
  
        saveHistory();
      }
    }
  }, [grid, isSolved, solvedGrid]);

  const handleKeyPress = (e, row, col) => {
    if (grid[row][col].fixed || isSolved) return;
    
    const key = e.key;
    let input = key.replace(/[^1-9]/g, '');
    if (input.length > 0) {
      input = input[0]; // Take only first valid number
      const numericValue = parseInt(input);
      
      const newGrid = [...grid];
      newGrid[row][col] = { ...newGrid[row][col], value: input };
      setGrid(newGrid);
      setMoves(m => m + 1);
    }
    
    if (key === 'Backspace' || key === 'Delete') {
      const newGrid = [...grid];
      newGrid[row][col] = { ...newGrid[row][col], value: '' };
      setGrid(newGrid);
    }
  };

  const initializeGame = useCallback(() => {
    setIsLoading(true);
    try {
      let emptyCells;
      switch(difficulty) {
        case 'Easy': emptyCells = 35; break;
        case 'Medium': emptyCells = 45; break;
        case 'Hard': emptyCells = 55; break;
        case 'Asian': emptyCells = 65; break;
        default: emptyCells = 40;
      }
      
      const generatedSolvedGrid = createValidGrid();
      const playableGrid = removeCells(generatedSolvedGrid, emptyCells).map(row => 
        row.map(num => ({
          value: num !== 0 ? num.toString() : '',
          fixed: num !== 0
        }))
      );
      
      setSolvedGrid(generatedSolvedGrid);
      setGrid(playableGrid);
      setMoves(0);
      setTime(0);
      setIsPaused(false);
      setIsSolved(false);
    } catch (error) {
      console.error("Error initializing game:", error);
      alert('Failed to initialize game. Please try again.');
    }
    setIsLoading(false);
  }, [difficulty]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer
  useEffect(() => {
    if (location.state?.timeMode === 'Counting') {
        // Chuyển đổi "MM:SS" thành giây
        const [minutes, seconds] = location.state.timeLimit.split(':').map(Number);
        const totalSeconds = minutes * 60 + seconds;
        setTime(totalSeconds);
        setInitialTime(totalSeconds);
    } else {
        setTime(0);
    }
}, [location.state]);

// Xử lý timer
useEffect(() => {
    let interval;
    if (!isPaused && !isSolved && !isLoading) {
        interval = setInterval(() => {
            if (location.state?.timeMode === 'Counting') {
                // Đếm ngược
                setTime((t) => {
                    if (t <= 0) {
                        clearInterval(interval);
                        setIsSolved(true);
                        setCustomAlert({ message: 'Time is up!', type: 'error' });
                        return 0;
                    }
                    return t - 1;
                });
            } else {
                // Đếm lên
                setTime((t) => t + 1);
            }
        }, 1000);
    }
    return () => clearInterval(interval);
}, [isPaused, isSolved, isLoading, location.state?.timeMode]);

  // Cell input handling
  const handleCellClick = (row, col) => {
    if (isLoading || isPaused || isSolved || grid[row][col].fixed) return;
    
    const newValue = prompt('Enter number (1-9):');
    const input = newValue ? newValue.replace(/[^1-9]/g, '')[0] || '' : '';
    
    if (!input) return;

    const newGrid = [...grid];
    newGrid[row][col] = { ...newGrid[row][col], value: input };
    
    setGrid(newGrid);
    setMoves(m => m + 1);
  };

  const formatTime = () => {
    if (location.state?.timeMode === 'Counting') {
        const mins = Math.floor(time / 60);
        const secs = time % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        const mins = Math.floor(time / 60);
        const secs = time % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
};

  // Hàm xử lý confirm
  const handleConfirm = (message, callback) => {
    setConfirmDialog({
      message,
      handleConfirm: () => {
        callback(true);
        setConfirmDialog(null);
      },
      handleCancel: () => {
        callback(false);
        setConfirmDialog(null);
      }
    });
  };

  // Hàm hiển thị alert
  const showAlert = (message, type = 'info') => {
    setCustomAlert({ message, type });
    setTimeout(() => setCustomAlert(null), 3000);
  };

  // Controls
  const handleNewGame = () => {
    handleConfirm('Start new game?', (confirmed) => {
      if (confirmed) navigate('/sudoku');
    });
  };

  const handleReset = () => {
    handleConfirm('Reset puzzle?', (confirmed) => {
      if (confirmed) initializeGame();
    });
  };

  useEffect(() => {
    if (isCorrect) {
      showAlert('Congratulations! You solved the puzzle!', 'success');
      setIsSolved(true);
    }
  }, [grid, isSolved, solvedGrid]);

  const handleHint = () => {
    if (hintsRemaining <= 0) return;
    
    const emptyCells = [];
    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (!cell.fixed && cell.value === '') emptyCells.push([i, j]);
      });
    });
  
    if (emptyCells.length === 0) return;
  
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = [...grid];
    newGrid[row][col] = {
      ...newGrid[row][col],
      value: solvedGrid[row][col].toString(),
      fixed: true
    };
  
    setGrid(newGrid);
    setHintsRemaining(prev => prev - 1);
    setMoves(m => m + 1);
  };

  // Hàm tạo confetti
  const createConfetti = () => {
    const confettiCount = 50;
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'sudoku-play-confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.animationDelay = Math.random() * 1 + 's';
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      document.body.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 3000);
    }
  };

  // Hàm xử lý check
  const handleCheck = () => {
    const incorrect = [];
    const correct = [];
    let hasEmpty = false;

    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        const correctValue = solvedGrid[i]?.[j]?.toString() || '';
        if (cell.value !== correctValue) {
          incorrect.push(`${i}-${j}`);
        } else if (cell.value !== '') {
          correct.push(`${i}-${j}`);
        }
        if (cell.value === '') hasEmpty = true;
      });
    });

    setCheckedCells([...incorrect, ...correct]);

    if (incorrect.length === 0 && !hasEmpty) {
      setIsSolved(true);
      setShowSuccess(true);
      createConfetti();
      setTimeout(() => {
        setShowSuccess(false);
        setCheckedCells([]);
      }, 3000);
    } else {
      setTimeout(() => setCheckedCells([]), 3000);
    }
  };

  // sudoku_play_history.jsx
  useEffect(() => {
    const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  return (
    <div className="sudoku-play-container">
      {isLoading ? (
        <div className="loading-message">Generating puzzle...</div>
      ) : (
        <>
          <div className="sudoku-play-header">
            <div className="sudoku-play-controls">
              <button className="sudoku-play-control-btn" onClick={handleNewGame}>
                New Game
              </button>
              <button 
                className="sudoku-play-control-btn" 
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button className="sudoku-play-control-btn" onClick={handleReset}>
                Reset
              </button>
              <button 
                className="sudoku-play-control-btn"
                onClick={handleHint}
                disabled={hintsRemaining <= 0 || isSolved}
              >
                Hint ({hintsRemaining !== Infinity ? hintsRemaining : '∞'})
              </button>
              <button 
                className="sudoku-play-control-btn check"
                onClick={handleCheck}
                disabled={isSolved}
              >
                Check
              </button>
            </div>
          </div>

          <div className="sudoku-play-stats">
            <div>Difficulty: {difficulty}</div> 
            <div>Time: {formatTime()}</div>
            <div>Moves: {moves}</div>
          </div>

          <div className="sudoku-play-board">
            {isPaused && (
              <div className="sudoku-play-pause-overlay">
                <h2>Game Paused</h2>
                <button 
                  className="sudoku-play-control-btn"
                  onClick={() => setIsPaused(false)}
                >
                  Resume
                </button>
              </div>
            )}
            <div className="sudoku-grid">
              {grid.map((row, i) => 
                row.map((cell, j) => {
                  const isChecked = checkedCells.includes(`${i}-${j}`);
                  const isCorrect = isChecked && 
                                  cell.value === solvedGrid[i]?.[j]?.toString();
                  const isWrong = isChecked && !isCorrect;

                  return (
                    <div
                      key={`${i}-${j}`}
                      className={`sudoku-cell 
                        ${cell.fixed ? 'fixed' : ''} 
                        ${selectedCell?.row === i && selectedCell?.col === j ? 'selected' : ''}
                        ${isWrong ? 'wrong' : ''}
                        ${isCorrect ? 'correct' : ''}
                      `}
                      onClick={() => setSelectedCell({ row: i, col: j })}
                      onKeyDown={(e) => handleKeyPress(e, i, j)}
                      tabIndex={0}
                      ref={selectedCell?.row === i && selectedCell?.col === j ? cellRef : null}
                    >
                      {cell.value || ''}
                    </div>
                  );
                })
              )}
            </div>
        </div>
        </>
      )}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.handleConfirm}
          onCancel={confirmDialog.handleCancel}
        />
      )}

      {customAlert && (
        <CustomAlert
          message={customAlert.message}
          type={customAlert.type}
        />
      )}
      {showSuccess && (
        <div className="sudoku-play-success-alert">
          <span>🎉</span>
          Congratulations! You solved the sudoku!
          <span>🎉</span>
        </div>
      )}
    </div>
  );
};

export default SudokuPlay;