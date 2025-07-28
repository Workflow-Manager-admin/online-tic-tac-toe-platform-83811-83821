import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// PUBLIC_INTERFACE
function RegisterPage() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await register(username, email, password);
      navigate('/');
    } catch (e) {
      setErr(e.detail ? e.detail[0]?.msg || 'Registration failed.' : 'Registration failed.');
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: '48px auto', background: 'var(--bg-secondary)', padding: 24, borderRadius: 8, boxShadow: '0 2px 12px #0001' }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input type="text" required placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} autoFocus style={inputStyle} />
        <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" required placeholder="Password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
        <button type="submit" className="theme-toggle" style={{ fontWeight: 600 }}>Register</button>
        {!!err && <span style={{ color: 'crimson', fontSize: 14 }}>{err}</span>}
      </form>
      <p style={{ marginTop: 12 }}>
        Already have an account?{' '}
        <Link className="App-link" to="/login">Login</Link>
      </p>
    </div>
  );
}

const inputStyle = {
  border: '1px solid var(--border-color)', borderRadius: 5, background: 'var(--bg-primary)', padding: '8px 12px', fontSize: 16,
};

export default RegisterPage;
