import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../api';

// PUBLIC_INTERFACE
export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getLeaderboard().then(res => {
      setLeaders(res.leaderboard || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: '36px auto', background: 'var(--bg-secondary)', borderRadius: 12, padding: 26, boxShadow: '0 2px 12px #0002' }}>
      <h2>Leaderboard</h2>
      {loading && <div>Loading...</div>}
      {!loading && leaders.length === 0 && <div>No leaderboard data.</div>}
      <table style={{
        width: '100%', marginTop: 18, borderCollapse: 'collapse', color: 'var(--text-primary)',
        fontSize: 15, background: 'var(--bg-primary)', borderRadius: 8,
      }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
            <th>Rank</th>
            <th>User</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Draws</th>
            <th>Games Played</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((entry, idx) =>
            <tr key={entry.username}
              style={{
                borderBottom: '1px solid var(--border-color)',
                background: idx === 0 ? '#90caf922' : 'inherit', textAlign: 'center'
              }}>
              <td>{idx + 1}</td>
              <td style={{
                fontWeight: idx === 0 ? 700 : 500,
                color: idx === 0 ? '#e87a41' : 'var(--text-primary)'
              }}>{entry.username}</td>
              <td>{entry.wins}</td>
              <td>{entry.losses}</td>
              <td>{entry.draws}</td>
              <td>{entry.games_played}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
