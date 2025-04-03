import { useEffect, useState } from 'react';
import './solitaire_play_history.css';
import axios from 'axios';

const SolitairePlayHistory = ({ onClose }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('User not logged in');
          return;
        }
        const userResponse = await axios.get(
          'http://localhost:3000/api/auth/user',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const userId = userResponse.data._id;
        const response = await axios.get(
          `http://localhost:3000/api/game/get-solitaire-history/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="solitaire-history-container">
      <div className="solitaire-history-header">
        <h2>Play History</h2>
        <button onClick={onClose}>Close</button>
      </div>
      <p className="solitaire-history-subtitle">Only 5 most recent success results will be shown here</p>
      <table className="solitaire-history-table">
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

export default SolitairePlayHistory;