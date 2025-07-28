//
// API helper functions for backend calls and WebSocket management
//

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export function getToken() {
  return localStorage.getItem('access_token');
}

// PUBLIC_INTERFACE
export async function apiRequest(path, options = {}, tokenRequired = true) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (tokenRequired && getToken()) {
    headers['Authorization'] = `Bearer ${getToken()}`;
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    throw await response.json();
  }
  return await response.json();
}

// PUBLIC_INTERFACE
export function login(email, password) {
  return apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false);
}

// PUBLIC_INTERFACE
export function register(username, email, password) {
  return apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  }, false);
}

// PUBLIC_INTERFACE
export function startNewGame(opponentType = 'ai', opponentUsername = null) {
  const body = { opponent_type: opponentType };
  if (opponentType === 'human' && opponentUsername) {
    body.opponent_username = opponentUsername;
  }
  return apiRequest('/new_game', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// PUBLIC_INTERFACE
export function getGameState(gameId) {
  return apiRequest(`/game_state/${gameId}`, {
    method: 'GET',
  });
}

// PUBLIC_INTERFACE
export function makeMove(gameId, row, col) {
  return apiRequest('/make_move', {
    method: 'POST',
    body: JSON.stringify({ game_id: gameId, row, col }),
  });
}

// PUBLIC_INTERFACE
export function getGameHistory() {
  return apiRequest('/game_history', {
    method: 'GET',
  });
}

// PUBLIC_INTERFACE
export function getLeaderboard() {
  return apiRequest('/leaderboard', {
    method: 'GET',
  }, false);
}

// PUBLIC_INTERFACE
export function getWebSocketUrl() {
  // Get WS URL from /websocket_info, or construct based on current API.
  const wsUrl =
    API_BASE_URL.replace(/^http(s?):/, 'ws$1:').replace(/\/$/, '') + '/ws';
  return wsUrl;
}
