import { useEffect, useState } from 'react';
import './puzzle_play_history.css';
import axios from 'axios';

const PuzzlePlayHistory = ({ onClose }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const userResponse = await axios.get(
          'https://logical-backend.vercel.app/api/auth/user',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const response = await axios.get(
          `https://logical-backend.vercel.app/api/game/get-puzzle-history/${userResponse.data.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching puzzle history:', error);
      }
    };
    
    fetchHistory();
  }, []);

  return (
    <div className="puzzle-history-container">
      <div className="puzzle-history-header">
        <h2>Play History</h2>
        <button onClick={onClose}>Close</button>
      </div>
      <p className="puzzle-history-subtitle">Only 5 most recent success results will be shown here</p>
      <table className="puzzle-history-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Level</th>
            <th>Time</th>
            <th>Hints</th>
            <th>Moves</th>
            <th>Time Played</th>
          </tr>
        </thead>
        <tbody>
          {history.map((record, index) => (
            <tr key={record._id}>
              <td>{index + 1}</td>
              <td>{record.level}</td>
              <td>{record.time}</td>
              <td>{record.hint}</td>
              <td>{record.moves}</td>
              <td>{new Date(record.timePlayed).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PuzzlePlayHistory;