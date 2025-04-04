import { useState, useEffect } from 'react';
import './solitaire_play.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SUITS = ['♠', '♣', '♥', '♦'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function SolitairePlay() {
    const [game, setGame] = useState({
        deck: [],
        drawPile: [],
        wastePile: [],
        foundations: [[], [], [], []],
        tableaus: [[], [], [], [], [], [], []],
        moves: 0,
        lastTwoDrawn: []
      });
      const [selectedCard, setSelectedCard] = useState(null);
      const [selectedPile, setSelectedPile] = useState(null);
      const [hintsRemaining, setHintsRemaining] = useState(
        location.state?.hintMode === 'Limited' 
            ? parseInt(location.state?.hintLimit || 3)
            : Infinity
    );  
    const [hintCards, setHintCards] = useState(null);
    const [draggedCard, setDraggedCard] = useState(null);
    const [dragSource, setDragSource] = useState(null);
    const [time, setTime] = useState(0);
    const [initialTime, setInitialTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();
    const [confirmDialog, setConfirmDialog] = useState(null);      
    const [showVictory, setShowVictory] = useState(false);
    const [isGameWon, setIsGameWon] = useState(false); 
    const [showSuccess, setShowSuccess] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    useEffect(() => {
        if (location.state?.timeMode === 'Counting') {
            const [minutes, seconds] = location.state.timeLimit.split(':').map(Number);
            const totalSeconds = minutes * 60 + seconds;
            setTime(totalSeconds);
            setInitialTime(totalSeconds);
        }
    }, [location.state]);

    useEffect(() => {
        let interval;
        if (!isPaused && !isGameWon) { // Thêm điều kiện !isGameWon
            interval = setInterval(() => {
                if (location.state?.timeMode === 'Counting') {
                    setTime((t) => {
                        if (t <= 0) {
                            clearInterval(interval);
                            return 0;
                        }
                        return t - 1;
                    });
                } else {
                    setTime((t) => t + 1);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPaused, location.state?.timeMode, isGameWon]);

    const formatTime = () => {
        const mins = Math.floor(time / 60);
        const secs = time % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const pushToHistory = (currentState) => {
        setHistory(prev => [...prev.slice(-10), JSON.stringify(currentState)]);
    };
    
    const handleReset = () => {
        let newDeck = [];
        for (const suit of SUITS) {
            for (const value of VALUES) {
                newDeck.push({ suit, value, isRevealed: false });
            }
        }
        newDeck = shuffle(newDeck);

        const newTableaus = [[], [], [], [], [], [], []];
        for (let i = 0; i < 7; i++) {
            for (let j = i; j < 7; j++) {
                const card = newDeck.pop();
                card.isRevealed = i === j;
                newTableaus[j].push(card);
            }
        }

        if (location.state?.timeMode === 'Counting') {
            const [minutes, seconds] = location.state.timeLimit.split(':').map(Number);
            const totalSeconds = minutes * 60 + seconds;
            setTime(totalSeconds);
            setInitialTime(totalSeconds);
        } else {
            setTime(0);
        }

        setGame({
            deck: [],
            drawPile: newDeck,
            wastePile: [],
            foundations: [[], [], [], []],
            tableaus: newTableaus,
            moves: 0,
            lastTwoDrawn: []
        });
        setHintsRemaining(
            location.state?.hintMode === 'Limited' 
                ? parseInt(location.state?.hintLimit || 3)
                : Infinity
        );
        setHintCards(null);
        setHistory([]);
        setHasSaved(false);
    };

    useEffect(() => {
        handleReset();
    }, []);
    
    const getCardValue = (card) => {
        const valueMap = {
          'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
          '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
        };
        return valueMap[card.value];
    };
    
    const isRedSuit = (suit) => {
        return suit === '♥' || suit === '♦';
    };
    
    const canMoveToFoundation = (card, foundation) => {
        if (foundation.length === 0) {
          return card.value === 'A';
        }
        const topCard = foundation[foundation.length - 1];
        return card.suit === topCard.suit && 
               getCardValue(card) === getCardValue(topCard) + 1;
    };
    
    const canMoveToTableau = (card, tableau) => {
        if (tableau.length === 0) {
          return card.value === 'K';
        }
        const topCard = tableau[tableau.length - 1];
        const isAlternatingColor = (
          (isRedSuit(card.suit) && !isRedSuit(topCard.suit)) ||
          (!isRedSuit(card.suit) && isRedSuit(topCard.suit))
        );
        return isAlternatingColor && getCardValue(card) === getCardValue(topCard) - 1;
    };
    
    const handleDragStart = (e, card, sourceType, sourceIndex, cardIndex) => {
        if (!card.isRevealed) return;
        
        setDraggedCard(card);
        setDragSource({ type: sourceType, index: sourceIndex, cardIndex });
        
        const dragImage = e.target.cloneNode(true);
        dragImage.style.opacity = '0.6';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 45, 60);
        setTimeout(() => document.body.removeChild(dragImage), 0);
      };
    
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const checkVictory = () => {
        const isVictory = game.foundations.every(foundation => foundation.length === 13);
        if (isVictory && !isGameWon) {
            setIsGameWon(true);
            setShowSuccess(true);
            createConfetti();
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };
    
    const handleDrop = (e, targetType, targetIndex) => {
        e.preventDefault();
        if (!draggedCard || !dragSource) return;
    
        const newGame = { ...game };
        let moved = false;
    
        if (targetType === 'foundation') {
            const foundation = newGame.foundations[targetIndex];
            if (canMoveToFoundation(draggedCard, foundation)) {
                pushToHistory(JSON.parse(JSON.stringify(game))); 
                if (dragSource.type === 'tableau') {
                    const cards = newGame.tableaus[dragSource.index].splice(dragSource.cardIndex);
                    foundation.push(cards[0]); 
                    moved = true;
                } else if (dragSource.type === 'waste') {
                    foundation.push(draggedCard);
                    newGame.wastePile = newGame.wastePile.filter(card => 
                        card.value !== draggedCard.value || card.suit !== draggedCard.suit
                    );
                    newGame.drawPile = newGame.drawPile.filter(card => 
                        card.value !== draggedCard.value || card.suit !== draggedCard.suit
                    );
                    moved = true;
                }
                
            }
        } else if (targetType === 'tableau') {
            const tableau = newGame.tableaus[targetIndex];
            if (canMoveToTableau(draggedCard, tableau)) {
                pushToHistory(JSON.parse(JSON.stringify(game)));
                if (dragSource.type === 'tableau') {
                    const cards = newGame.tableaus[dragSource.index].splice(dragSource.cardIndex);
                    tableau.push(...cards);
                    moved = true;
                } else if (dragSource.type === 'waste') {
                    tableau.push(draggedCard);
                    newGame.wastePile = newGame.wastePile.filter(card => 
                        card.value !== draggedCard.value || card.suit !== draggedCard.suit
                    );
                    newGame.drawPile = newGame.drawPile.filter(card => 
                        card.value !== draggedCard.value || card.suit !== draggedCard.suit
                    );
                    moved = true;
                } else if (dragSource.type === 'foundation') {
                    const foundation = newGame.foundations[dragSource.index];
                    const card = foundation.pop();
                    tableau.push(card);
                    moved = true;
                }
            }
        }
    
        if (moved) {
            newGame.lastTwoDrawn = newGame.wastePile.slice(-2);
    
            if (dragSource.type === 'tableau' && 
                newGame.tableaus[dragSource.index].length > 0 && 
                !newGame.tableaus[dragSource.index].slice(-1)[0]?.isRevealed) {
                newGame.tableaus[dragSource.index].slice(-1)[0].isRevealed = true;
            }
            
            newGame.moves++;
            setGame(newGame);

            setTimeout(() => {
                const isVictory = newGame.foundations.every(foundation => foundation.length === 13);
                if (isVictory && !isGameWon) {
                    setIsGameWon(true);
                    setShowSuccess(true);
                    createConfetti();
                    setTimeout(() => setShowSuccess(false), 3000);
                }
            }, 0);
        }
    
        setDraggedCard(null);
        setDragSource(null);
      };

      const handleDrawCard = () => {
        if (game.drawPile.length === 0 && game.wastePile.length === 0) return;
        
        pushToHistory(JSON.parse(JSON.stringify(game)));
        
        setGame(prevGame => {
            const newGame = { ...prevGame };
            
            if (newGame.drawPile.length === 0) {
                newGame.drawPile = [...newGame.wastePile].reverse();
                newGame.wastePile = [];
                newGame.lastTwoDrawn = [];
            } else {
                const card = newGame.drawPile.pop();
                card.isRevealed = true;
                newGame.wastePile.push(card);
                
                newGame.lastTwoDrawn = newGame.wastePile.slice(-2);
            }
            
            newGame.moves++;
            return newGame;
        });
      };
    
    const findValidMoves = () => {
        if (hintsRemaining <= 0) return;

        const moves = [];
        const suggestedMoves = new Set();

        game.tableaus.forEach((tableau, tableauIndex) => {
            if (tableau.length === 0) return;
            const card = tableau[tableau.length - 1];
            if (!card.isRevealed) return;

            game.foundations.forEach((foundation, foundationIndex) => {
                if (canMoveToFoundation(card, foundation)) {
                    const moveKey = `${card.value}${card.suit}-foundation${foundationIndex}`;
                    if (!suggestedMoves.has(moveKey)) {
                        moves.push({
                            priority: 1,
                            from: { type: 'tableau', index: tableauIndex },
                            to: { type: 'foundation', index: foundationIndex },
                            card,
                            moveKey
                        });
                        suggestedMoves.add(moveKey);
                    }
                }
            });
        });

        if (game.wastePile.length > 0) {
            const wasteCard = game.wastePile[game.wastePile.length - 1];
            
            game.foundations.forEach((foundation, foundationIndex) => {
                if (canMoveToFoundation(wasteCard, foundation)) {
                    const moveKey = `${wasteCard.value}${wasteCard.suit}-foundation${foundationIndex}`;
                    if (!suggestedMoves.has(moveKey)) {
                        moves.push({
                            priority: 2,
                            from: { type: 'waste', index: 0 },
                            to: { type: 'foundation', index: foundationIndex },
                            card: wasteCard,
                            moveKey
                        });
                        suggestedMoves.add(moveKey);
                    }
                }
            });
        }

        game.tableaus.forEach((sourceTableau, sourceIndex) => {
            if (sourceTableau.length === 0) return;
            const card = sourceTableau[sourceTableau.length - 1];
            if (!card.isRevealed) return;

            game.tableaus.forEach((targetTableau, targetIndex) => {
                if (sourceIndex !== targetIndex && canMoveToTableau(card, targetTableau)) {
                    const moveKey = `${card.value}${card.suit}-tableau${targetIndex}`;
                    if (!suggestedMoves.has(moveKey)) {
                        moves.push({
                            priority: 3,
                            from: { type: 'tableau', index: sourceIndex },
                            to: { type: 'tableau', index: targetIndex },
                            card,
                            moveKey
                        });
                        suggestedMoves.add(moveKey);
                    }
                }
            });
        });

        if (game.wastePile.length > 0) {
            const wasteCard = game.wastePile[game.wastePile.length - 1];
            game.tableaus.forEach((tableau, tableauIndex) => {
                if (canMoveToTableau(wasteCard, tableau)) {
                    const moveKey = `${wasteCard.value}${wasteCard.suit}-tableau${tableauIndex}`;
                    if (!suggestedMoves.has(moveKey)) {
                        moves.push({
                            priority: 4,
                            from: { type: 'waste', index: 0 },
                            to: { type: 'tableau', index: tableauIndex },
                            card: wasteCard,
                            moveKey
                        });
                        suggestedMoves.add(moveKey);
                    }
                }
            });
        }

        moves.sort((a, b) => a.priority - b.priority);

        if (moves.length > 0) {
            const move = moves[0];
            setHintCards(move);
            setHintsRemaining(prev => prev - 1);
        } else if (game.drawPile.length > 0) {
            setHintCards({ type: 'draw' });
            setHintsRemaining(prev => prev - 1);
        }

        setTimeout(() => {
            setHintCards(null);
        }, 2000);
    };
    
    const renderCard = (card, index, total, sourceType, sourceIndex) => {
        if (!card) return null;
    
        const isHinted = hintCards && 
            ((hintCards.card && hintCards.card.value === card.value && hintCards.card.suit === card.suit) ||
             (sourceType === 'draw' && hintCards.type === 'draw'));
    
        const cardStyle = {
            '--index': index,
            position: sourceType === 'tableau' ? 'absolute' : 'relative',
            top: sourceType === 'tableau' ? `${index * 30}px` : '0',
            zIndex: sourceType === 'waste' ? total - index : undefined
        };
    
        return (
            <div
                key={`${card.value}${card.suit}-${index}`}
                className={`solitaire-card ${!card.isRevealed ? 'hidden' : ''} 
                    ${selectedCard === card ? 'selected' : ''} 
                    ${(card.suit === '♥' || card.suit === '♦') ? 'red' : ''}
                    ${isHinted ? 'hint-highlight' : ''}`}
                style={cardStyle}
                draggable={card.isRevealed}
                onDragStart={(e) => handleDragStart(e, card, sourceType, sourceIndex, index)}
                onClick={() => handleCardClick(card, sourceType, sourceIndex, index)}
            >
                {card.isRevealed && (
                    <>
                        <div className="card-value">{card.value}{card.suit}</div>
                        <div className="card-suit">{card.suit}</div>
                        <div className="card-value-bottom">{card.value}{card.suit}</div>
                    </>
                )}
            </div>
        );
      };
    
    const handleCardClick = (card, sourceType, sourceIndex, cardIndex) => {
        if (!card.isRevealed) return;
    
        if (selectedCard) {
          // Try to move to foundation first
          let moved = false;
          if (sourceType === 'tableau') {
            game.foundations.forEach((foundation, i) => {
              if (!moved && canMoveToFoundation(card, foundation)) {
                moveCards(game.tableaus[sourceIndex], game.foundations[i], cardIndex);
                moved = true;
              }
            });
          }
    
          // Try to move to tableau
          if (!moved) {
            game.tableaus.forEach((tableau, i) => {
              if (!moved && canMoveToTableau(card, tableau)) {
                pushToHistory(JSON.parse(JSON.stringify(game)));
                moveCards(game.tableaus[sourceIndex], game.tableaus[i], cardIndex);
                moved = true;
              }
            });
          }
    
          setSelectedCard(null);
          setSelectedPile(null);
        } else {
          setSelectedCard(card);
          setSelectedPile({ type: sourceType, index: sourceIndex });
        }
      };

    const handleUndo = () => {
        if (history.length === 0) return;
        
        const prevState = JSON.parse(history[history.length - 1]);
        
        prevState.moves += 2;
        
        prevState.tableaus = prevState.tableaus.map(tableau => 
            tableau.map((card, index, arr) => ({
                ...card,
                isRevealed: card.isRevealed || index === arr.length - 1
            }))
        );
        
        prevState.wastePile = prevState.wastePile.map(card => ({
            ...card,
            isRevealed: true
        }));
        
        setGame(prevState);
        setHistory(prev => prev.slice(0, -1));
        setSelectedCard(null);
        setSelectedPile(null);
        setHintCards(null);
    };

    const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
        return (
          <div className="solitaire-play-confirm-dialog">
            <div className="solitaire-play-confirm-content">{message}</div>
            <div className="solitaire-play-confirm-buttons">
              <button className="solitaire-play-confirm-btn yes" onClick={onConfirm}>Yes</button>
              <button className="solitaire-play-confirm-btn no" onClick={onCancel}>No</button>
            </div>
          </div>
        );
    };

    const handleConfirmNewGame = () => {
        setConfirmDialog({
            message: "Start new game?",
            handleConfirm: () => {
                navigate('/solitaire');
                setConfirmDialog(null);
            },
            handleCancel: () => setConfirmDialog(null)
        });
        setHasSaved(false);
    };

    const handleConfirmReset = () => {
        setConfirmDialog({
            message: "Reset current game?",
            handleConfirm: () => {
                handleReset();
                setConfirmDialog(null);
            },
            handleCancel: () => setConfirmDialog(null)
        });
    };

    const createConfetti = () => {
        const confettiCount = 50;
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 1 + 's';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }
    };
      
    useEffect(() => {
        const isVictory = game.foundations.every(foundation => foundation.length === 13);
        
        if (isVictory && !isGameWon && !hasSaved) {
        setIsGameWon(true);
        setShowSuccess(true);
        createConfetti();
        setTimeout(() => setShowSuccess(false), 3000);
    
        const saveHistory = async () => {
            try {
            const token = localStorage.getItem('token');
            if (!token) return;
    
            const userResponse = await axios.get('https://logical-backend.vercel.app/api/auth/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            await axios.post(
                'https://logical-backend.vercel.app/api/game/save-solitaire-history',
                {
                    userId: userResponse.data.id,
                    time: formatTime(),
                    hint: state.hintMode === 'Limited' ? state.hintLimit - hintCount : null,
                    moves: game.moves
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            } catch (error) {
            console.error('Error saving solitaire history:', error);
            }
        };
    
        saveHistory();
        setHasSaved(true);
        }
    }, [game.foundations, isGameWon, game.moves, hintsRemaining, hasSaved]);

    const handleCheat = () => {
        const newFoundations = SUITS.map(suit => 
            VALUES.map(value => ({
                suit,
                value,
                isRevealed: true
            }))
        );
    
        setGame(prev => ({
            ...prev,
            foundations: newFoundations,
            tableaus: [[], [], [], [], [], [], []],
            drawPile: [],
            wastePile: [],
            lastTwoDrawn: []
        }));
        
        // Kích hoạt hiệu ứng chiến thắng nhưng CHƯA set isGameWon ở đây
        setShowSuccess(true);
        createConfetti();
        setTimeout(() => setShowSuccess(false), 3000);
    };
    
    return (
        <div className="solitaire-play-container">
            {confirmDialog && (
                <ConfirmDialog
                    message={confirmDialog.message}
                    onConfirm={confirmDialog.handleConfirm}
                    onCancel={confirmDialog.handleCancel}
                />
            )}
            {showSuccess && (
                <div className="solitaire-play-success-alert">
                    <span>🎉</span>
                    Congratulations! You won the game!
                    <span>🎉</span>
                </div>
            )}
            <div className="solitaire-play-header">
                <div className="solitaire-play-controls">
                    <button className="solitaire-play-control-btn" onClick={handleConfirmNewGame}>
                        New Game
                    </button>
                    <button 
                        className="solitaire-play-control-btn" 
                        onClick={handleConfirmReset}    
                    >
                        Reset
                    </button>
                    <button 
                        className="solitaire-play-control-btn" 
                        onClick={() => setIsPaused(!isPaused)}
                    >
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button 
                        className="solitaire-play-control-btn" 
                        onClick={handleUndo}
                        disabled={history.length === 0 || isGameWon} // Thêm isGameWon
                    >
                        Undo
                    </button>
                    <button 
                        className={`solitaire-play-control-btn ${hintCards?.type === 'draw' ? 'hint-highlight' : ''}`}
                        onClick={handleDrawCard}
                        disabled={game.drawPile.length === 0 && game.wastePile.length === 0}
                    >
                        Draw Card
                    </button>
                    <button 
                        className="solitaire-play-control-btn"
                        onClick={findValidMoves}
                        disabled={hintsRemaining <= 0 || isGameWon}
                    >
                        Hint ({hintsRemaining !== Infinity ? hintsRemaining : '∞'})
                    </button>
                    <button 
                        className="solitaire-play-control-btn"
                        onClick={handleCheat}
                    >
                        Cheat Win
                    </button>
                </div>
            </div>
      
            <div className="solitaire-play-stats">
                <div>Time: {formatTime()}</div>
                <div>Moves: {game.moves}</div>
            </div>
      
            {isPaused && (
                <div className="solitaire-play-pause-overlay">
                    <h2>Game Paused</h2>
                    <button 
                        className="solitaire-play-control-btn"
                        onClick={() => setIsPaused(false)}
                    >
                        Resume
                    </button>
                </div>
            )}
      
            <div className="solitaire-play-board">
                <div className="solitaire-deck-area">
                    <div
                        className={`solitaire-card hidden ${hintCards?.type === 'draw' ? 'hint-highlight' : ''}`}
                        onClick={handleDrawCard}
                        style={{ 
                            cursor: 'pointer',
                            visibility: game.drawPile.length > 0 ? 'visible' : 'hidden'
                        }}
                    >
                        {game.drawPile.length > 0 && (
                            <div className="card-count">{game.drawPile.length}</div>
                        )}
                    </div>
                    
                    <div className="last-two-cards">
                        {[...game.lastTwoDrawn].map((card, i) => (
                            renderCard(card, i, game.lastTwoDrawn.length, 'waste', 0)
                        ))}
                    </div>
      
                    <div className="solitaire-foundation">
                        {game.foundations.map((foundation, i) => (
                            <div 
                                key={i} 
                                className="solitaire-card-placeholder"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, 'foundation', i)}
                            >
                                {foundation.length > 0 && renderCard(
                                    foundation[foundation.length - 1], 
                                    0, 
                                    1, 
                                    'foundation', 
                                    i
                                )}
                            </div>
                        ))}
                    </div>
                </div>
      
                <div className="solitaire-tableaus">
                    {game.tableaus.map((tableau, i) => (
                        <div 
                            key={i} 
                            className={`solitaire-tableau ${tableau.length === 0 ? 'solitaire-card-placeholder' : ''}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 'tableau', i)}
                        >
                            {tableau.map((card, j) => renderCard(card, j, tableau.length, 'tableau', i))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      );
    }

export default SolitairePlay;