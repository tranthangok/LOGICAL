import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './puzzle_play.css';
import axios from 'axios';

const PuzzlePlay = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;
    
    const [gridSize, setGridSize] = useState(3);
    const [tiles, setTiles] = useState([]);
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [initialTime, setInitialTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [history, setHistory] = useState([]);
    const [isSolved, setIsSolved] = useState(false);
    const [hintIndex, setHintIndex] = useState(null);
    const [hintCount, setHintCount] = useState(null);
    const [showConfirm, setShowConfirm] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [hintPath, setHintPath] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (!state?.pieces) {
            navigate('/puzzle');
            return;
        }
    
        // Thêm dòng này để tính gridSize từ số pieces
        const size = Math.sqrt(state.pieces);
        setGridSize(size);
    
        if (state.timeMode === 'Counting' && state.timeLimit) {
            const [minutes, seconds] = state.timeLimit.split(':').map(Number);
            const totalSeconds = minutes * 60 + seconds;
            setInitialTime(totalSeconds);
            setTime(totalSeconds);
        }
    
        setHintCount(state.hintMode === 'Limited' ? parseInt(state.hintLimit) : Infinity);
    }, [state, navigate]);

    const shuffleTiles = useCallback(() => {
        // Tạo trạng thái giải pháp đúng
        const solved = Array.from({ length: state.pieces - 1 }, (_, i) => i + 1);
        solved.push(null);
        let currentTiles = [...solved];
        
        // Thực hiện 100 bước di chuyển hợp lệ
        for (let i = 0; i < 100; i++) {
            const emptyIndex = currentTiles.indexOf(null);
            const possibleMoves = [];
            
            if (emptyIndex % gridSize > 0) possibleMoves.push(emptyIndex - 1);
            if (emptyIndex % gridSize < gridSize - 1) possibleMoves.push(emptyIndex + 1);
            if (emptyIndex >= gridSize) possibleMoves.push(emptyIndex - gridSize);
            if (emptyIndex < state.pieces - gridSize) possibleMoves.push(emptyIndex + gridSize);

            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            const newTiles = [...currentTiles];
            [newTiles[emptyIndex], newTiles[randomMove]] = 
                [newTiles[randomMove], newTiles[emptyIndex]];
            currentTiles = newTiles;
        }
        
        return currentTiles;
    }, [state.pieces, gridSize]);
    const initializeGame = useCallback(() => {
        const shuffled = shuffleTiles();
        setTiles(shuffled);
        setMoves(0);
        setTime(initialTime);
        setIsPaused(false);
        setHistory([]);
        setIsSolved(false);
        setHintIndex(null);
    }, [shuffleTiles, initialTime]);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    useEffect(() => {
        let interval;
        if (!isPaused && !isSolved) {
            interval = setInterval(() => {
                if (state.timeMode === 'Counting') {
                    setTime(t => {
                        if (t <= 0) {
                            clearInterval(interval);
                            alert('Time out! Game over!');
                            setIsSolved(true);
                            return 0;
                        }
                        return t - 1;
                    });
                } else {
                    setTime(t => t + 1);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPaused, isSolved, state.timeMode]);

    const handleMove = (index) => {
        if (isPaused || isSolved || tiles[index] === null) return;
        
        const emptyIndex = tiles.indexOf(null);
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const emptyRow = Math.floor(emptyIndex / gridSize);
        const emptyCol = emptyIndex % gridSize;

        if ((Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1) {
            const newTiles = [...tiles];
            [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
            setTiles(newTiles);
            setMoves(m => m + 1);
            setHistory([...history, emptyIndex]);
        }
    };

    const checkSolved = useCallback(() => {
        return tiles.slice(0, -1).every((tile, index) => tile === index + 1);
    }, [tiles, gridSize]); 

    // Trong useEffect kiểm tra thắng
useEffect(() => {
    if (checkSolved() && tiles.length > 0 && !isSolved) {
      setIsSolved(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
  
      // Thêm phần lưu lịch sử
      const saveHistory = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
  
          const userResponse = await axios.get('https://logical-backend.vercel.app/api/auth/user', {
            headers: { Authorization: `Bearer ${token}` }
          });
  
          await axios.post(
            'https://logical-backend.vercel.app/api/game/save-puzzle-history',
            {
              userId: userResponse.data.id,
              level: gridSize + 'x' + gridSize,
              time: formatTime(),
              hint: state.hintMode === 'Limited' ? hintCount : 'Unlimited',
              moves: moves
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          console.error('Error saving puzzle history:', error);
        }
      };
  
      saveHistory();
    }
  }, [tiles, checkSolved, moves, isSolved]);

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

    const handleNewGame = () => {
        if (window.confirm('Are you sure to start new game?')) navigate('/puzzle');
    };

    const handleReset = () => {
        if (window.confirm('Reset puzzle?')) initializeGame();
    };

    const handleUndo = () => {
        if (history.length > 0) {
            const lastMove = history[history.length - 1];
            const newTiles = [...tiles];
            [newTiles[lastMove], newTiles[tiles.indexOf(null)]] = 
                [newTiles[tiles.indexOf(null)], newTiles[lastMove]];
            setTiles(newTiles);
            setHistory(history.slice(0, -1));
            setMoves(m => m + 1);
        }
    };

    const bfsSolve = (currentTiles) => {
        const target = [1, 2, 3, 4, 5, 6, 7, 8, null];
        const queue = [{ tiles: currentTiles, path: [] }];
        const visited = new Set();
        
        while (queue.length > 0) {
            const { tiles, path } = queue.shift();
            if (tiles.join(',') === target.join(',')) return path;
            
            const emptyIndex = tiles.indexOf(null);
            const moves = [];
            if (emptyIndex % 3 > 0) moves.push(emptyIndex - 1); // left
            if (emptyIndex % 3 < 2) moves.push(emptyIndex + 1); // right
            if (emptyIndex >= 3) moves.push(emptyIndex - 3); // up
            if (emptyIndex < 6) moves.push(emptyIndex + 3); // down
            
            for (const move of moves) {
                const newTiles = [...tiles];
                [newTiles[emptyIndex], newTiles[move]] = [newTiles[move], newTiles[emptyIndex]];
                const key = newTiles.join(',');
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({ tiles: newTiles, path: [...path, move] });
                }
            }
        }
        return [];
    };

    const handleHint = () => {
        if (isSolved || gridSize !== 3 || (state.hintMode === 'Limited' && hintCount <= 0)) return;
    
        const bfsSolve = (currentTiles) => {
            const target = [1, 2, 3, 4, 5, 6, 7, 8, null];
            const queue = [{ tiles: currentTiles, path: [] }];
            const visited = new Set();
            
            while (queue.length > 0) {
                const { tiles, path } = queue.shift();
                if (tiles.join(',') === target.join(',')) return path;
                
                const emptyIndex = tiles.indexOf(null);
                const moves = [];
                // Chỉ xét cho 3x3
                if (emptyIndex % 3 > 0) moves.push(emptyIndex - 1); // left
                if (emptyIndex % 3 < 2) moves.push(emptyIndex + 1); // right
                if (emptyIndex >= 3) moves.push(emptyIndex - 3); // up
                if (emptyIndex < 6) moves.push(emptyIndex + 3); // down
                
                for (const move of moves) {
                    const newTiles = [...tiles];
                    [newTiles[emptyIndex], newTiles[move]] = [newTiles[move], newTiles[emptyIndex]];
                    const key = newTiles.join(',');
                    if (!visited.has(key)) {
                        visited.add(key);
                        queue.push({ tiles: newTiles, path: [...path, move] });
                    }
                }
            }
            return [];
        };
    
        const hintPath = bfsSolve(tiles);
        if (hintPath.length === 0) return;
    
        const nextMove = hintPath[0];
        setHintIndex(nextMove);
        
        setTimeout(() => {
            handleMove(nextMove);
            setHintIndex(null);
            if (state.hintMode === 'Limited') setHintCount(prev => prev - 1);
        }, 1000);
    };

    // Component Confirm Dialog
    const PuzzlePlayConfirmDialog = ({ message, onConfirm, onCancel }) => (
        <div className="puzzle-play-confirm-dialog">
            <div className="puzzle-play-confirm-content">{message}</div>
            <div className="puzzle-play-confirm-buttons">
                <button className="puzzle-play-confirm-btn yes" onClick={onConfirm}>Yes</button>
                <button className="puzzle-play-confirm-btn no" onClick={onCancel}>No</button>
            </div>
        </div>
    );

    // Component Success Alert
    const PuzzlePlaySuccessAlert = ({ moves }) => (
        <div className="puzzle-play-success-alert">
            <span>🎉</span>
            Solved in {moves} moves!
            <span>🎉</span>
        </div>
    );

    const handleAction = (actionType) => {
        setShowConfirm({
            message: actionType === 'reset' 
                ? 'Reset puzzle?' 
                : 'Start new game?',
            callback: (confirmed) => {
                if (confirmed) {
                    if (actionType === 'reset') initializeGame();
                    else navigate('/puzzle');
                }
                setShowConfirm(null);
            }
        });
    };

    return (
        <div className="puzzle-play-container">
            {showConfirm && (
                <PuzzlePlayConfirmDialog
                    message={showConfirm.message}
                    onConfirm={() => showConfirm.callback(true)}
                    onCancel={() => showConfirm.callback(false)}
                />
            )}

            {showSuccess && <PuzzlePlaySuccessAlert moves={moves} />}
            <div className="puzzle-play-header">
                <div className="puzzle-play-controls">
                    <button className="puzzle-play-control-btn" onClick={() => handleAction('new')}>
                        New Game
                    </button>
                    <button 
                        className="puzzle-play-control-btn" 
                        onClick={() => setIsPaused(!isPaused)}
                    >
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button className="puzzle-play-control-btn" onClick={() => handleAction('reset')}>
                        Reset
                    </button>   
                    <button 
                        className="puzzle-play-control-btn" 
                        onClick={handleUndo}
                        disabled={history.length === 0 || isSolved}
                    >
                        Undo
                    </button>
                    <button 
                        className="puzzle-play-control-btn" 
                        onClick={handleHint}
                        disabled={isSolved || (state.hintMode === 'Limited' && hintCount <= 0) || gridSize !== 3}
                        style={{ display: gridSize === 3 ? 'block' : 'none' }}
                    >
                        Hint ({hintCount !== Infinity ? hintCount : '∞'})
                    </button>
                </div>
            </div>

            <div className="puzzle-play-stats">
                <div>Time: {formatTime()}</div>
                <div>Moves: {moves}</div>
            </div>

            <div className="puzzle-play-board">
            {isPaused && (
                <div className="puzzle-play-pause-overlay">
                    <h2>Game Paused</h2>
                    <button 
                        className="puzzle-play-control-btn"
                        onClick={() => setIsPaused(false)}
                    >
                        Resume
                    </button>
                </div>
            )}
                <div className="puzzle-play-tile-grid" 
                    style={{ 
                        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                        gridTemplateRows: `repeat(${gridSize}, 1fr)`
                    }}
                >
                    {tiles.map((value, index) => (
                        <div
                            key={index}
                            className={`puzzle-play-tile 
                                ${value === null ? 'puzzle-play-tile-empty' : ''}
                                ${hintIndex === index ? 'hint-tile' : ''}`}
                            onClick={() => handleMove(index)}
                        >
                            {value}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PuzzlePlay;