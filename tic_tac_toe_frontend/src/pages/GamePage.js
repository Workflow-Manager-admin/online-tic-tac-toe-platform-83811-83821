import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getGameState, startNewGame, makeMove } from '../api';
import { useAuth } from '../AuthContext';

// Board cell component
function Square({ value, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      data-testid="board-square"
      style={{
        width: 80,
        height: 80,
        fontSize: 32,
        fontWeight: 700,
        background: 'var(--bg-primary)',
        border: '2px solid var(--border-color)',
        cursor: disabled || value !== null ? 'default' : 'pointer',
        outline: 'none',
        transition: 'background-color 0.2s'
      }}
    >
      {value}
    </button>
  );
}

// PUBLIC_INTERFACE
function GamePage({ autoStart }) {
  // If /game/:id, use that game. Otherwise, autoStart triggers a new game if not in a session.
  const { id: paramGameId } = useParams();
  const [gameId, setGameId] = useState(paramGameId);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [showNewGameOpts, setShowNewGameOpts] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Polling interval ref
  useEffect(() => {
    if (!gameId) return;
    setPolling(true);
    let mount = true;
    let interval;
    async function fetchState() {
      try {
        setLoading(true);
        const res = await getGameState(gameId);
        if (mount) setGameState(res);
      } catch {
        // Game might be over or missing
      } finally {
        setLoading(false);
      }
    }
    fetchState();
    interval = setInterval(fetchState, 2000);
    return () => {
      mount = false;
      clearInterval(interval);
      setPolling(false);
    };
    // eslint-disable-next-line
  }, [gameId]);

  // Handle new game autoStart or manual new game
  useEffect(() => {
    if (!paramGameId && autoStart && !gameId) {
      handleNewGame('ai');
    }
    // eslint-disable-next-line
  }, [paramGameId, autoStart, gameId]);

  // PUBLIC_INTERFACE
  async function handleNewGame(type, opponentName = null) {
    setError('');
    try {
      setLoading(true);
      const data = await startNewGame(type, opponentName);
      setGameId(data); // API returns game ID as an integer
      setGameState(null);
    } catch (e) {
      setError('Could not start new game.');
    } finally {
      setLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  async function handleMove(r, c) {
    if (!gameId || !gameState) return;
    setLoading(true);
    try {
      const res = await makeMove(gameId, r, c);
      setGameState(res);
    } catch (e) {
      setError('Invalid move.');
    } finally {
      setLoading(false);
    }
  }

  const winner = useMemo(() => (gameState ? gameState.winner : null), [gameState]);
  const nextTurn = useMemo(() => (gameState ? gameState.next_turn : null), [gameState]);
  const status = useMemo(() => (gameState ? gameState.status : ''), [gameState]);

  return (
    <div style={{ maxWidth: 700, margin: '32px auto', background: 'var(--bg-secondary)', borderRadius: 14, padding: 24, boxShadow: '0 2px 14px #0002' }}>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'space-between', alignItems: 'start' }}>
        {/* Board and controls */}
        <section style={{ flex: 1 }}>
          <h2>Tic Tac Toe {winner && ' - Game Over'}</h2>
          <div style={{ marginBottom: 6, fontSize: 15 }}>
            {status}
            {nextTurn && !winner && <>Turn: <b>{nextTurn}</b></>}
            {winner && (
              <span style={{ color: winner === user?.username ? '#2ecc40' : '#e87a41', fontWeight: 600 }}>
                Winner: {winner}
              </span>
            )}
          </div>
          {error && <span style={{ color: 'crimson', fontSize: 14 }}>{error}</span>}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: 3,
            background: 'var(--border-color)', borderRadius: 8, margin: '18px 0',
          }}>
            {gameState && gameState.board.map((row, r) =>
              row.map((cell, c) =>
                <Square key={r * 3 + c} value={cell} onClick={() => handleMove(r, c)} disabled={!!winner || nextTurn !== user?.username} />
              ))}
          </div>
          {(winner || !gameState) && (
            <>
              <button
                onClick={() => setShowNewGameOpts(true)}
                className="theme-toggle"
                style={{ fontWeight: 550, marginTop: 8, fontSize: 18 }}>
                New Game
              </button>
              {showNewGameOpts && (
                <div style={{
                  background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: 18, borderRadius: 6, marginTop: 12
                }}>
                  <div style={{ marginBottom: 7 }}>Opponent:</div>
                  <button className="theme-toggle" style={{ marginRight: 8 }} onClick={() => { setShowNewGameOpts(false); handleNewGame('ai'); }}>
                    VS AI
                  </button>
                  <button className="theme-toggle" onClick={() => { setShowNewGameOpts(false); handleNewGame('human', prompt('Opponent Username:')); }}>
                    VS Human
                  </button>
                </div>
              )}
            </>
          )}
        </section>
        {/* Leaderboard summary */}
        <aside style={{ width: 200 }}>
          <LeaderboardSidebar />
        </aside>
      </div>
    </div>
  );
}

// Sidebar leaderboard summary
function LeaderboardSidebar() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await import('../api').then(api => api.getLeaderboard());
        setLeaders((await data).leaderboard || []);
      } catch {
        setLeaders([]);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <div>
      <h4 style={{ marginBottom: 8, borderBottom: '1px solid var(--border-color)', paddingBottom: 4 }}>Leaderboard</h4>
      <ul style={{ padding: 0, listStyle: 'none', fontSize: 15, margin: 0 }}>
        {leaders.map((entry, idx) =>
          <li key={entry.username} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '3px 0', color: idx === 0 ? '#e87a41' : 'inherit',
            fontWeight: idx === 0 ? 600 : 500
          }}>
            <span>{entry.username}</span> <span>{entry.wins}W/{entry.losses}L/{entry.draws}D</span>
          </li>
        )}
      </ul>
    </div>
  );
}

export default GamePage;
