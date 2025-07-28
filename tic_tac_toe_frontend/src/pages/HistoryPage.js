import React, { useEffect, useState } from 'react';
import { getGameHistory } from '../api';

function formatDate(dt) {
  return dt ? new Date(dt).toLocaleString() : '';
}

// PUBLIC_INTERFACE
export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        const res = await getGameHistory();
        setHistory(res.history || []);
      } catch (e) {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div style={{
      maxWidth: 700,
      margin: '36px auto',
      background: 'var(--bg-secondary)',
      borderRadius: 12,
      padding: 26,
      boxShadow: '0 2px 12px #0002'
    }}>
      <h2>Your Game History</h2>
      {loading && <span>Loading...</span>}
      {!loading && history.length === 0 && <div>No games played yet.</div>}
      <table style={{
        width: '100%', marginTop: 18, borderCollapse: 'collapse', color: 'var(--text-primary)',
        fontSize: 15, background: 'var(--bg-primary)', borderRadius: 8,
      }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
            <th>#ID</th>
            <th>Started</th>
            <th>Completed</th>
            <th>Players</th>
            <th>Winner</th>
            <th>Moves</th>
          </tr>
        </thead>
        <tbody>
          {history.map(item =>
            <tr key={item.game_id}
              style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
              <td>{item.game_id}</td>
              <td>{formatDate(item.started_at)}</td>
              <td>{formatDate(item.completed_at)}</td>
              <td>{item.players.join(', ')}</td>
              <td style={{
                color: item.winner ? (item.players[0] === item.winner ? '#2ecc40' : '#e87a41') : undefined,
                fontWeight: item.winner ? 600 : undefined
              }}>{item.winner || '-'}</td>
              <td>{item.moves_count}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
